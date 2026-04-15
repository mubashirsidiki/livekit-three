import logging
from logging.config import dictConfig

APP_NAME = "livekit-agent"


class LoggerManager:
    def __init__(self):
        self._log_config = {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {
                "json": {
                    "()": "core.logging.handler.JsonFormatter",
                },
            },
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "json",
                    "stream": "ext://sys.stdout",
                },
            },
            "loggers": {
                APP_NAME: {
                    "handlers": ["console"],
                    "level": "INFO",
                    "propagate": False,
                },
            },
        }
        self._setup_logging()

    def _setup_logging(self):
        dictConfig(self._log_config)

    @property
    def logger(self) -> logging.Logger:
        return logging.getLogger(APP_NAME)


LOG = LoggerManager().logger
