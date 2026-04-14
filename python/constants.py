# FETCH_PROMPT_URL = "http://localhost:8000/api/v1/fetch-prompt"
# CALL_ANALYTICS_URL = "http://localhost:8000/api/v1/send-call-analytics"

ASSISTANT_DEFAULT_INSTRUCTIONS = """
You are a professional, calm, and empathetic voice assistant.
Keep your responses concise, natural, and conversational.
Ask one clear question at a time when you need more information.
Avoid complex formatting, emojis, or special punctuation.
"""

# END_CALL_DESCRIPTION = """End the current call/conversation.
# Speaks a short farewell message and ends the call.
# No return value - the call ends immediately after the goodbye message.
# """

# SWITCH_LANGUAGE_DESCRIPTION = """Switch the agent's spoken language to match the caller's language (supports English and Dutch).
# Call this tool as soon as you detect the caller is speaking Dutch.
# After calling this tool, continue the conversation naturally in the new language.
# Do NOT call this for English — it is already the default.
# """

USER_AWAY_PROMPT = "Are you still there? I'm here to help."

# USER_AWAY_GOODBYE = "Thank you for your time. Goodbye!"

END_CALL_GOODBYE = "Thank you for calling. Have a great day. Goodbye!"

GREETING_MESSAGE = "Hello! How can I help you today?"

WAIT_FOR_USER_SECONDS = 10

# CALL_CLASSIFICATION_PROMPT = (
#     "Analyze this phone call transcript for a law firm intake workflow and extract:\n"
#     "1. is_spam: SPAM if the call is sales/marketing/irrelevant, NOT_SPAM if it is a genuine legal inquiry, NOT_SURE if unclear\n"
#     "2. reason_for_call: Brief summary of the legal issue or reason the caller contacted the firm\n"
#     "3. callback_required: YES if an attorney or staff member should follow up, NO if the matter was resolved, NOT_SURE if unclear\n"
#     "4. callback_required_reason: Why follow-up is or is not needed\n"
#     "5. caller_name: Name if provided, else None\n"
#     "6. calendar_event: If the caller mentioned scheduling a consult or appointment, extract title, description, start_time, end_time (ISO 8601 format: YYYY-MM-DDTHH:MM:SS)\n\n"
#     "Be precise. Use null for unknown values."
# )

STT_MODEL = "assemblyai/universal-streaming-multilingual"
STT_LANGUAGE = "en"

LLM_MODEL = "gpt-4o"

# CLASSIFIER_MODEL = "google/gemini-2.5-flash"

CHATBOT_API_URL = (
    "https://platform.jambhala-ai.com/api/chatbot/widget/adbbb0d79d33daef60b6c549/chat"
)

TTS_MODEL = "inworld/inworld-tts-1.5-max"
TTS_LANGUAGE = "en"
TTS_VOICE = "Craig"
