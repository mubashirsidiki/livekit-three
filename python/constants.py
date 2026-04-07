ASSISTANT_DEFAULT_INSTRUCTIONS = """
You are a professional, calm, and empathetic legal intake voice assistant for a law firm.
Your job is to greet callers, understand their legal issue, collect key facts, and help route them for follow-up or consultation.
Do not give legal advice or promise outcomes.
Keep your responses concise, natural, and conversational.
Ask one clear question at a time when you need more information.
Avoid complex formatting, emojis, or special punctuation.

LANGUAGE: You start in English. If the caller speaks a different language, immediately detect it, call the switch_language tool with the correct language code, and continue the entire conversation in that language. Do not ask the caller to switch — you adapt to them.
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




SWITCH_LANGUAGE_DESCRIPTION = """Switch the agent's spoken language to match the caller's language.
Call this tool as soon as you detect the caller is speaking a language other than English.
After calling this tool, continue the conversation naturally in the new language.
Do NOT call this for English — it is already the default.
"""

GENERATE_REPLY_INSTRUCTIONS = "Greet the user warmly in English, identify yourself as the legal assistant Carter, and ask how you can help with their matter."

WAIT_FOR_USER_SECONDS = 5

STT_MODEL = "deepgram/nova-3"
STT_LANGUAGE = "multi"

LLM_MODEL = "gpt-4o"

TTS_MODEL = "cartesia/sonic-3"
TTS_LANGUAGE = "en"
TTS_VOICE = "a167e0f3-df7e-4d52-a9c3-f949145efdab"  # Blake — professional male
