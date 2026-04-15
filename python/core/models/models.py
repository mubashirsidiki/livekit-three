from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel


class IsSpam(StrEnum):
    SPAM = "SPAM"
    NOT_SPAM = "NOT_SPAM"
    NOT_SURE = "NOT_SURE"


class CallbackRequired(StrEnum):
    YES = "YES"
    NO = "NO"
    NOT_SURE = "NOT_SURE"


class CaseType(StrEnum):
    PERSONAL_INJURY = "PERSONAL_INJURY"
    FAMILY_LAW = "FAMILY_LAW"
    CRIMINAL_DEFENSE = "CRIMINAL_DEFENSE"
    EMPLOYMENT_LAW = "EMPLOYMENT_LAW"
    REAL_ESTATE = "REAL_ESTATE"
    CORPORATE = "CORPORATE"
    IMMIGRATION = "IMMIGRATION"
    ESTATE_PLANNING = "ESTATE_PLANNING"
    OTHER = "OTHER"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class Urgency(StrEnum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class QualificationScore(StrEnum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class CalendarEvent(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None


class CallClassification(BaseModel):
    is_spam: IsSpam
    reason_for_call: str
    callback_required: CallbackRequired
    callback_required_reason: str
    caller_name: str | None = None
    calendar_event: CalendarEvent | None = None
    case_type: CaseType | None = None
    urgency: Urgency | None = None
    qualification_score: QualificationScore | None = None
    recommended_next_steps: list[str] | None = None
