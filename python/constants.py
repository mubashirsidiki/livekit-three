FETCH_PROMPT_URL = "http://localhost:8000/api/v1/fetch-prompt"
CALL_ANALYTICS_URL = "http://localhost:8000/api/v1/send-call-analytics"

ASSISTANT_DEFAULT_INSTRUCTIONS = """
You are a professional, calm, and empathetic legal intake voice assistant for a law firm.
Your job is to greet callers, understand their legal issue, collect key facts, and help route them for follow-up or consultation.
Do not give legal advice or promise outcomes.
Keep your responses concise, natural, and conversational.
Ask one clear question at a time when you need more information.
Avoid complex formatting, emojis, or special punctuation.
"""

END_CALL_GOODBYE = "Thank you for calling. Have a great day. Goodbye!"

CALL_CLASSIFICATION_PROMPT = (
    "Analyze this phone call transcript for a law firm intake workflow and extract:\n"
    "1. is_spam: SPAM if the call is sales/marketing/irrelevant, NOT_SPAM if it is a genuine legal inquiry, NOT_SURE if unclear\n"
    "2. reason_for_call: Brief summary of the legal issue or reason the caller contacted the firm\n"
    "3. callback_required: YES if an attorney or staff member should follow up, NO if the matter was resolved, NOT_SURE if unclear\n"
    "4. callback_required_reason: Why follow-up is or is not needed\n"
    "5. caller_name: Name if provided, else None\n"
    "6. calendar_event: If the caller mentioned scheduling a consult or appointment, extract title, description, start_time, end_time (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)\n\n"
    "Be precise. Use null for unknown values."
)

END_CALL_DESCRIPTION = """End the current call/conversation.
Speaks a short farewell message and ends the call.
No return value - the call ends immediately after the goodbye message.
"""

USER_AWAY_PROMPT = "Are you still there? I'm here to help with your legal matter."

USER_AWAY_GOODBYE = "Thank you for your time. Goodbye!"

GENERATE_REPLY_INSTRUCTIONS = "Greet the user warmly, identify yourself as the legal assistant, and ask how you can help with their matter."

WAIT_FOR_USER_SECONDS = 5

STT_MODEL = "deepgram/nova-2-phonecall"
STT_LANGUAGE = "en"

LLM_MODEL = "gpt-4o"

CLASSIFIER_MODEL = "google/gemini-2.5-flash"

TTS_MODEL = "inworld/inworld-tts-1.5-max"
TTS_LANGUAGE = "en"
TTS_VOICE = "Craig"
