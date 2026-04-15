import asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    ChatContext,
    CloseEvent,
    ConversationItemAddedEvent,
    JobProcess,
    UserStateChangedEvent,
    inference,
    room_io,
)
from livekit.agents.beta import EndCallTool
from livekit.plugins import google, silero, noise_cancellation

from core.logging.logger import LOG
from core.models import CallClassification
from constants import (
    ASSISTANT_DEFAULT_INSTRUCTIONS,
    CALL_CLASSIFICATION_PROMPT,
    CLASSIFICATION_MODEL,
    GENERATE_REPLY_INSTRUCTIONS,
    GEMINI_MODEL,
    GEMINI_VOICE,
    GEMINI_TEMPERATURE,
    USER_AWAY_GOODBYE,
    USER_AWAY_PROMPT,
    WAIT_FOR_USER_SECONDS,
)

load_dotenv(".env.local")


# --- Post-call classification helpers ---


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


async def _classify_call(chat_ctx: ChatContext) -> CallClassification | None:
    transcript = _build_transcript(chat_ctx)
    if not transcript:
        return None

    classification_ctx = ChatContext()
    classification_ctx.add_message(
        role="system",
        content=(
            f"Current date and time: {datetime.now(timezone.utc).isoformat()}\n\n"
            f"{CALL_CLASSIFICATION_PROMPT}"
        ),
    )
    classification_ctx.add_message(role="user", content=transcript)

    try:
        async with inference.LLM(model=CLASSIFICATION_MODEL) as llm:
            async with llm.chat(
                chat_ctx=classification_ctx,
                response_format=CallClassification,  # type: ignore[call-arg]
            ) as stream:
                collected = await stream.collect()
                if collected.text:
                    return CallClassification.model_validate_json(collected.text)
    except Exception as e:
        LOG.error(f"Failed to extract call metadata: {e}")

    return None


# --- Agent ---


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions=ASSISTANT_DEFAULT_INSTRUCTIONS,
            tools=[
                EndCallTool(
                    end_instructions="say a brief, warm goodbye to the user IN THE SAME LANGUAGE the conversation has been happening in",
                    delete_room=False,
                ),
            ],
        )

    async def on_enter(self) -> None:
        self.session.generate_reply(
            instructions=GENERATE_REPLY_INSTRUCTIONS,
            allow_interruptions=True,
        )


# --- User-away inactivity handler ---


async def _user_presence_loop(session: AgentSession) -> None:
    try:
        await asyncio.sleep(WAIT_FOR_USER_SECONDS)

        await session.generate_reply(
            instructions=USER_AWAY_PROMPT,
            allow_interruptions=True,
        )

        await asyncio.sleep(WAIT_FOR_USER_SECONDS)

        await session.generate_reply(
            instructions=(
                "Say a brief, warm goodbye in the same language the conversation has been happening in. "
                f"The English version for reference: {USER_AWAY_GOODBYE}. "
                "Do NOT call any tools. Just say the goodbye."
            ),
            allow_interruptions=True,
        )

        session.shutdown(drain=True)
    except asyncio.CancelledError:
        LOG.info("User presence check cancelled - user responded")
        raise
    except Exception as e:
        LOG.error(f"Error in user presence task: {e}")


# --- Server setup ---


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server = AgentServer(initialize_process_timeout=60)
server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    participant = await ctx.wait_for_participant()
    LOG.info(
        f"Participant: {participant.sid} {participant.identity} {participant.name} (kind={participant.kind})"
    )

    call_started_at = datetime.now(tz=timezone.utc)
    inactivity_task: asyncio.Task | None = None

    session: AgentSession = AgentSession(
        llm=google.realtime.RealtimeModel(
            model=GEMINI_MODEL,
            voice=GEMINI_VOICE,
            temperature=GEMINI_TEMPERATURE,
        ),
        vad=ctx.proc.userdata["vad"],
        user_away_timeout=WAIT_FOR_USER_SECONDS,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
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

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev: ConversationItemAddedEvent):
        LOG.info(f"[Chat] {ev.item.role}: {ev.item.content}")  # type: ignore[union-attr]

    @session.on("user_state_changed")
    def _user_state_changed(ev: UserStateChangedEvent):
        nonlocal inactivity_task
        if ev.new_state == "away":
            if inactivity_task is None or inactivity_task.done():
                inactivity_task = asyncio.create_task(_user_presence_loop(session))
            return

        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    @session.on("close")
    def on_close(ev: CloseEvent):
        nonlocal inactivity_task

        duration = (datetime.now(tz=timezone.utc) - call_started_at).total_seconds()
        LOG.info(f"call duration: {duration:.2f}s")

        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    async def classify_on_shutdown():
        try:
            classification = await asyncio.wait_for(
                _classify_call(session.history),
                timeout=6,
            )
            if classification:
                LOG.info(f"Call Classification: {classification.model_dump_json()}")
            else:
                LOG.info("No classification generated for session")
        except TimeoutError:
            LOG.warning("Skipping call classification: summarization timed out")

    ctx.add_shutdown_callback(classify_on_shutdown)


if __name__ == "__main__":
    agents.cli.run_app(server)
