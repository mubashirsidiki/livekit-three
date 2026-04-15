import json
import logging
from datetime import datetime


class JsonFormatter(logging.Formatter):
    def formatTime(self, record: logging.LogRecord, datefmt: str | None = None) -> str:
        dt = datetime.fromtimestamp(record.created)
        microseconds = int(record.msecs * 1000)

        if datefmt:
            if ".%" in datefmt:
                parts = datefmt.split(".%")
                return (
                    dt.strftime(parts[0])
                    + f".{microseconds:06d}"
                    + dt.strftime(parts[1])
                )
            return dt.strftime(datefmt)

        date_part = dt.strftime("%d %b %Y %A")
        time_part = (
            dt.strftime("%I:%M:%S") + f".{microseconds:06d} " + dt.strftime("%p")
        )
        return f"{date_part} {time_part}"

    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "msg": record.getMessage(),
        }

        standard_attrs = set(
            logging.LogRecord("", 0, "", 0, "", (), None).__dict__.keys()  # type: ignore[arg-type]
        )
        extra_fields = {
            key: value
            for key, value in record.__dict__.items()
            if key not in standard_attrs
        }
        log_record.update(extra_fields)
        return json.dumps(log_record, ensure_ascii=False)
