from datetime import datetime
from typing import Literal
from pydantic import BaseModel
from .. import __version__


class VersionOut(BaseModel):
    version: str

    @classmethod
    def from_metadata(cls):
        return cls(version=__version__)


# ─────────────────────────────────────────────────────────────────────────────
# Sensor Models
# ─────────────────────────────────────────────────────────────────────────────


class SensorReading(BaseModel):
    """A single sensor reading with temperature and humidity."""

    sensor_id: str
    timestamp: datetime
    temperature: float
    humidity: float


class SensorSummaryWindow(BaseModel):
    """Aggregated sensor data for a time window."""

    window_label: Literal["10m", "1h", "1d"]
    avg_temperature: float
    avg_humidity: float


class SensorSummaryOut(BaseModel):
    """Summary of sensor data for multiple time windows."""

    last_10_minutes: SensorSummaryWindow
    last_hour: SensorSummaryWindow
    last_day: SensorSummaryWindow


class SensorSeriesPoint(BaseModel):
    """A single point in a time series."""

    timestamp: datetime
    value: float


class SensorSeriesOut(BaseModel):
    """Time series data for a specific metric."""

    metric: Literal["temperature", "humidity"]
    points: list[SensorSeriesPoint]


class SensorChatRequest(BaseModel):
    """Request for sensor chat."""

    question: str


class SensorChatResponse(BaseModel):
    """Response from sensor chat."""

    answer: str
