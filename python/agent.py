import asyncio
from typing import AsyncIterable
from dotenv import load_dotenv

# from datetime import datetime, timezone

from livekit import agents, rtc
from livekit.agents import (
    AgentServer,
    AgentSession,
    Agent,
    # ChatContext,
    ModelSettings,
    inference,
    room_io,
    TurnHandlingOptions,
    ConversationItemAddedEvent,
    UserStateChangedEvent,
    llm,
)
from livekit.plugins import noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from core.logging.logger import LOG
from core.clients import jambhala_client

# from core.models import CallClassification, CallMetadata
# from core.clients import backend_client
from constants import (
    ASSISTANT_DEFAULT_INSTRUCTIONS,
    END_CALL_GOODBYE,
    USER_AWAY_PROMPT,
    GREETING_MESSAGE,
    LLM_MODEL,
    STT_LANGUAGE,
    STT_MODEL,
    TTS_LANGUAGE,
    TTS_MODEL,
    TTS_VOICE,
    WAIT_FOR_USER_SECONDS,
)

# SWITCH_LANGUAGE_DESCRIPTION
# END_CALL_DESCRIPTION

load_dotenv(".env.local")


class Assistant(Agent):
    def __init__(
        self,
        instructions: str | None = None,
        chat_ctx: llm.ChatContext | None = None,
        # tools: list[llm.Tool | llm.Toolset] | None = None,
    ) -> None:
        super().__init__(
            instructions=instructions or ASSISTANT_DEFAULT_INSTRUCTIONS,
            chat_ctx=chat_ctx,
        )

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.FunctionTool],
        model_settings: ModelSettings,
    ) -> AsyncIterable[str | llm.ChatChunk]:
        # Extract last user message
        user_messages = [
            item
            for item in chat_ctx.items
            if item.type == "message" and item.role == "user"
        ]
        last_message = user_messages[-1].text_content if user_messages else ""
        if not last_message:
            return

        reply = await jambhala_client.chat(last_message)
        if reply:
            yield reply


# async def switch_language(context: RunContext, language_code: str):
#     """Switch the agent's TTS language so speech output matches the caller's language."""
#     tts = context.session.tts
#     if tts is not None:
#         tts.update_options(language=language_code)
#         LOG.info(f"Switched TTS language to: {language_code}")


# async def end_call(
#     context: RunContext,
#     # reason: str,
# ):
#     context.session.say(
#         END_CALL_GOODBYE,
#         allow_interruptions=False,
#     )
#     await context.wait_for_playout()
#     context.session.shutdown(drain=True)


# def _build_transcript(chat_ctx: ChatContext) -> str:
#     items = [
#         f"{item.role}: {item.text_content}"
#         for item in chat_ctx.items
#         if item.type == "message"
#         and item.role in ("user", "assistant")
#         and not item.extra.get("is_summary")
#         and item.text_content
#     ]
#     return "\n".join(items)
#
#
# async def _extract_call_metadata(
#     classifier: inference.LLM, chat_ctx: ChatContext
# ) -> CallClassification | None:
#     transcript = _build_transcript(chat_ctx)
#     if not transcript:
#         return None
#
#     classification_ctx = ChatContext()
#     classification_ctx.add_message(
#         role="system",
#         content=(
#             f"Current date and time: {datetime.now(timezone.utc).isoformat()}\n\n"
#             f"{CALL_CLASSIFICATION_PROMPT}"
#         ),
#     )
#     classification_ctx.add_message(role="user", content=transcript)
#
#     try:
#         async with classifier.chat(
#             chat_ctx=classification_ctx,
#             response_format=CallClassification,
#         ) as stream:
#             full_content = ""
#             async for chunk in stream:
#                 if chunk.delta and chunk.delta.content:
#                     full_content += chunk.delta.content
#
#             if full_content:
#                 return CallClassification.model_validate_json(full_content)
#     except Exception as e:
#         LOG.error(f"Failed to extract call metadata: {e}")
#
#     return None
#
#
# async def _on_session_end(
#     ctx: agents.JobContext,
#     access_token: str,
#     call_duration: dict,
# ) -> None:
#     LOG.info(f"call duration: {call_duration['seconds']}")
#
#     report = ctx.make_session_report()
#     classifier = inference.LLM(model=CLASSIFIER_MODEL)
#
#     classification = await _extract_call_metadata(classifier, report.chat_history)
#
#     if classification:
#         LOG.info(f"Call Classification: {classification.model_dump_json()}")
#
#         metadata = CallMetadata(
#             call_datetime=datetime.now(timezone.utc),
#             call_transcript=_build_transcript(report.chat_history),
#             is_spam=classification.is_spam,
#             reason_for_call=classification.reason_for_call,
#             callback_required=classification.callback_required,
#             callback_required_reason=classification.callback_required_reason,
#             caller_name=classification.caller_name,
#             calendar_event=classification.calendar_event,
#             service_pricing=classification.service_pricing,
#             call_duration=round(call_duration["seconds"]),
#         )
#
#         if access_token:
#             pass  # await backend_client.send_call_analytics(access_token, metadata)
#     else:
#         LOG.info("No classification generated for session")


server = AgentServer(initialize_process_timeout=60)


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    participant = await ctx.wait_for_participant()
    LOG.info(
        f"Participant: {participant.sid} {participant.identity} {participant.name} (kind={participant.kind})"
    )

    # prompt_id = participant.attributes.get("promptId", "")
    # access_token = participant.attributes.get("accessToken", "")

    # call_duration = {"seconds": 0}
    # async def shutdown_callback():
    #     await _on_session_end(ctx, access_token, call_duration)
    # ctx.add_shutdown_callback(shutdown_callback)

    # config = await backend_client.fetch_prompt(access_token, prompt_id)
    instructions = ASSISTANT_DEFAULT_INSTRUCTIONS

    session = AgentSession(
        stt=inference.STT(STT_MODEL, language=STT_LANGUAGE),
        llm=inference.LLM(model=LLM_MODEL),
        tts=inference.TTS(
            TTS_MODEL,
            language=TTS_LANGUAGE,
            voice=TTS_VOICE,
        ),
        vad=silero.VAD.load(),
        turn_handling=TurnHandlingOptions(
            turn_detection=MultilingualModel(),
        ),
        user_away_timeout=WAIT_FOR_USER_SECONDS,
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(
            instructions=instructions,
            # tools=[
            #     function_tool(
            #         switch_language,
            #         name="switch_language",
            #         description=SWITCH_LANGUAGE_DESCRIPTION,
            #     ),
            #     function_tool(
            #         end_call,
            #         name="end_call",
            #         description=end_call_description,
            #     ),
            # ],
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

    # call_started_at = datetime.now(tz=timezone.utc)

    @session.on("conversation_item_added")
    def on_conversation_item_added(ev: ConversationItemAddedEvent):
        LOG.info(f"[Chat] {ev.item.role}: {ev.item.content}")

    async def user_presence_task():
        try:
            await session.say(
                USER_AWAY_PROMPT,
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )

            await asyncio.sleep(WAIT_FOR_USER_SECONDS)

            await session.say(
                END_CALL_GOODBYE,
                allow_interruptions=True,
                add_to_chat_ctx=True,
            )
            session.shutdown(drain=True)
        except asyncio.CancelledError:
            LOG.info("User presence check cancelled - user responded")
            raise
        except Exception as e:
            LOG.error(f"Error in user presence task: {e}")

    inactivity_task: asyncio.Task | None = None

    @session.on("user_state_changed")
    def _user_state_changed(ev: UserStateChangedEvent):
        nonlocal inactivity_task
        if ev.new_state == "away":
            if inactivity_task is None or inactivity_task.done():
                inactivity_task = asyncio.create_task(user_presence_task())
            return

        if inactivity_task is not None and not inactivity_task.done():
            inactivity_task.cancel()

    @session.on("close")
    def stop_tasks():
        pass

    await session.say(
        GREETING_MESSAGE,
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
