import asyncio
from dotenv import load_dotenv
from datetime import datetime, timezone

from livekit import agents, rtc
from livekit.agents import (
    AgentServer,
    AgentSession,
    Agent,
    ChatContext,
    inference,
    room_io,
    RunContext,
    function_tool,
    ConversationItemAddedEvent,
    UserStateChangedEvent,
    llm,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from core.logging.logger import LOG
from core.models import CallClassification

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(
        self,
        instructions: str | None = None,
        chat_ctx: llm.ChatContext | None = None,
        tools: list[llm.Tool | llm.Toolset] | None = None,
    ) -> None:
        default_instructions = """
You are a helpful, friendly voice AI assistant with a warm and engaging personality.
You assist users with their questions and requests using your extensive knowledge.
Keep your responses concise, natural, and conversational.
Avoid complex formatting, emojis, or special punctuation.
"""

        super().__init__(
            instructions=instructions or default_instructions,
            chat_ctx=chat_ctx,
            tools=tools,
        )


async def end_call(
    context: RunContext,
    # reason: str,
):

    # Speak goodbye message before ending the call
    # Don't await say() directly in tool calls - use wait_for_playout()
    context.session.say(
        "Thank you for calling Champion. Have a great day. Goodbye!",
        allow_interruptions=False,
    )

    # Wait for speech to complete using context method (best practice in tools)
    await context.wait_for_playout()

    context.session.shutdown(drain=True)

    # Don't return anything - prevents LLM from generating another response
    # after the tool call completes


end_call_default_intent = """End the current call/conversation.
    Speaks a farewell message and ends the call.
    No return value - the call ends immediately after the goodbye message.
    """


def _build_transcript(chat_ctx: ChatContext) -> str:
    items = [
        f"{item.role}: {item.text_content}"
        for item in chat_ctx.items
        if item.type == "message"
        and item.role in ("user", "assistant")
        and not item.extra.get("is_summary")
        and item.text_content
    ]
    return "\n".join(items)


async def _extract_call_metadata(
    summarizer: inference.LLM, chat_ctx: ChatContext
) -> CallClassification | None:
    transcript = _build_transcript(chat_ctx)
    if not transcript:
        return None

    classification_ctx = ChatContext()
    classification_ctx.add_message(
        role="system",
        content=(
            f"Current date and time: {datetime.now(timezone.utc).isoformat()}\n\n"
            "Analyze this phone call transcript and extract:\n"
            "1. is_spam: SPAM if sales/marketing, NOT_SPAM if legitimate inquiry, NOT_SURE if unclear\n"
            "2. reason_for_call: Brief reason the caller contacted\n"
            "3. callback_required: YES if caller needs follow-up, NO if resolved, NOT_SURE if unclear\n"
            "4. callback_required_reason: Why callback is or isn't needed\n"
            "5. caller_name: Name if provided, else None\n"
            "6. calendar_event: If caller mentioned scheduling, extract title, description, start_time, end_time (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)\n\n"
            "Be precise. Use null for unknown values."
        ),
    )
    classification_ctx.add_message(role="user", content=transcript)

    try:
        async with summarizer.chat(
            chat_ctx=classification_ctx,
            response_format=CallClassification,
        ) as stream:
            full_content = ""
            async for chunk in stream:
                if chunk.delta and chunk.delta.content:
                    full_content += chunk.delta.content

            if full_content:
                return CallClassification.model_validate_json(full_content)
    except Exception as e:
        LOG.error(f"Failed to extract call metadata: {e}")

    return None


async def _on_session_end(
    ctx: agents.JobContext,
    call_duration: int,
) -> None:
    LOG.info(f"call duration: {call_duration['seconds']}")

    report = ctx.make_session_report()
    summarizer = inference.LLM(model="google/gemini-2.5-flash")

    classification = await _extract_call_metadata(summarizer, report.chat_history)

    if classification:
        LOG.info(f"Call Classification: {classification.model_dump_json()}")
    else:
        LOG.info("No classification generated for session")


server = AgentServer(initialize_process_timeout=60)


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    participant = await ctx.wait_for_participant()
    LOG.info(
        f"Participant: {participant.sid} {participant.identity} {participant.name} (kind={participant.kind})"
    )

    call_duration = {"seconds": 0}

    async def shutdown_callback():
        await _on_session_end(
            ctx,
            call_duration,
        )

    ctx.add_shutdown_callback(shutdown_callback)

    end_call_description = end_call_default_intent
    wait_for_user = 5

    session = AgentSession(
        stt=inference.STT("deepgram/nova-2-phonecall", language="en"),
        llm=inference.LLM(model="gpt-4o"),
        # llm=openai.responses.LLM(model="gpt-5-mini", reasoning=Reasoning(effort="minimal")),
        # llm=inference.LLM("openai/gpt-5-mini",
        #                   provider="openai",
        #                   extra_kwargs={
        #                       "reasoning_effort": "minimal",
        #                       "verbosity": "low",
        #                 }
        #                 ),
        tts=inference.TTS(
            "inworld/inworld-tts-1.5-max",
            language="en",
            voice="Craig",
        ),
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
        user_away_timeout=wait_for_user,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(
            tools=[
                function_tool(
                    end_call,
                    name="end_call",
                    description=end_call_description,
                )
            ],
        ),
        room_options=room_io.RoomOptions(
            delete_room_on_close=True,
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind
                    == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    call_started_at = datetime.now(tz=timezone.utc)

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev: ConversationItemAddedEvent):
        LOG.info(f"[Chat] {ev.item.role}: {ev.item.content}")

    async def user_presence_task():
        try:
            # Use session.say() to speak directly (no LLM processing)
            # add_to_chat_ctx=True keeps these messages in transcript for analytics
            await session.say(
                "Are you still there Champion?",
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )

            await asyncio.sleep(wait_for_user)

            await session.say(
                "Thank you for your time Champion. Goodbye!",
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )

            session.shutdown(drain=True)
        except asyncio.CancelledError:
            # User spoke - task was cancelled, this is expected
            LOG.info("User presence check cancelled - user responded")
            raise
        except Exception as e:
            LOG.error(f"Error in user presence task: {e}")

    inactivity_task: asyncio.Task | None = None

    @session.on("user_state_changed")
    def _user_state_changed(ev: UserStateChangedEvent):
        nonlocal inactivity_task
        if ev.new_state == "away":
            # Only start a new task if one isn't already running
            if inactivity_task is None or inactivity_task.done():
                inactivity_task = asyncio.create_task(user_presence_task())
            return

        # User is back (listening/speaking) - cancel any pending inactivity task
        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    @session.on("close")
    def stop_tasks():
        nonlocal call_duration
        call_ended_at = datetime.now(tz=timezone.utc)
        call_duration["seconds"] = (call_ended_at - call_started_at).total_seconds()

    await session.generate_reply(
        instructions="Greet the user warmly and ask how you can help.",
        allow_interruptions=True,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
