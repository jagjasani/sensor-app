import math
import random
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import conf
from .logger import logger
from .models import (
    SensorReading,
    SensorSeriesOut,
    SensorSeriesPoint,
    SensorSummaryOut,
    SensorSummaryWindow,
)


def add_not_found_handler(app: FastAPI):
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        logger.info(
            f"HTTP exception handler called for request {request.url.path} with status code {exc.status_code}"
        )
        if exc.status_code == 404:
            path = request.url.path
            accept = request.headers.get("accept", "")

            is_api = path.startswith(conf.api_prefix)
            is_get_page_nav = request.method == "GET" and "text/html" in accept

            # Heuristic: if the last path segment looks like a file (has a dot), don't SPA-fallback
            looks_like_asset = "." in path.split("/")[-1]

            if (not is_api) and is_get_page_nav and (not looks_like_asset):
                # Let the SPA router handle it
                return FileResponse(conf.static_assets_path / "index.html")
        # Default: return the original HTTP error (JSON 404 for API, etc.)
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)

    app.exception_handler(StarletteHTTPException)(http_exception_handler)


# ─────────────────────────────────────────────────────────────────────────────
# Mock Sensor Data Generators
# ─────────────────────────────────────────────────────────────────────────────


def _generate_mock_reading(ts: datetime, sensor_id: str = "sensor-01") -> SensorReading:
    """Generate a single mock sensor reading for a given timestamp."""
    # Use sine wave with noise for realistic-looking data
    # Temperature: baseline 22°C, varies ±5°C over a 1-hour period
    hours_offset = ts.timestamp() / 3600
    temp_base = 22.0 + 5.0 * math.sin(hours_offset * 0.5)
    temp_noise = random.gauss(0, 0.3)
    temperature = round(temp_base + temp_noise, 2)

    # Humidity: baseline 55%, varies ±15% inversely to temperature
    humidity_base = 55.0 - 10.0 * math.sin(hours_offset * 0.5)
    humidity_noise = random.gauss(0, 1.5)
    humidity = round(max(20, min(95, humidity_base + humidity_noise)), 2)

    return SensorReading(
        sensor_id=sensor_id,
        timestamp=ts,
        temperature=temperature,
        humidity=humidity,
    )


def generate_mock_readings(
    minutes: int, interval_seconds: int = 2, sensor_id: str | None = None
) -> list[SensorReading]:
    """Generate mock sensor readings for the given time window."""
    now = datetime.now(timezone.utc)
    start = now - timedelta(minutes=minutes)

    readings: list[SensorReading] = []
    current = start
    sid = sensor_id or "sensor-01"

    while current <= now:
        readings.append(_generate_mock_reading(current, sid))
        current += timedelta(seconds=interval_seconds)

    return readings


def get_mock_summary() -> SensorSummaryOut:
    """Generate mock summary data for 10 minutes, 1 hour, and 1 day windows."""

    def compute_averages(
        readings: list[SensorReading],
    ) -> tuple[float, float]:
        if not readings:
            return 0.0, 0.0
        avg_temp = sum(r.temperature for r in readings) / len(readings)
        avg_hum = sum(r.humidity for r in readings) / len(readings)
        return round(avg_temp, 1), round(avg_hum, 1)

    # Generate readings for each window
    readings_10m = generate_mock_readings(minutes=10, interval_seconds=2)
    readings_1h = generate_mock_readings(minutes=60, interval_seconds=10)
    readings_1d = generate_mock_readings(minutes=1440, interval_seconds=60)

    avg_10m = compute_averages(readings_10m)
    avg_1h = compute_averages(readings_1h)
    avg_1d = compute_averages(readings_1d)

    return SensorSummaryOut(
        last_10_minutes=SensorSummaryWindow(
            window_label="10m",
            avg_temperature=avg_10m[0],
            avg_humidity=avg_10m[1],
        ),
        last_hour=SensorSummaryWindow(
            window_label="1h",
            avg_temperature=avg_1h[0],
            avg_humidity=avg_1h[1],
        ),
        last_day=SensorSummaryWindow(
            window_label="1d",
            avg_temperature=avg_1d[0],
            avg_humidity=avg_1d[1],
        ),
    )


def get_mock_series(
    metric: Literal["temperature", "humidity"],
    minutes: int = 10,
    sensor_id: str | None = None,
) -> SensorSeriesOut:
    """Generate mock time series data for a specific metric."""
    # Use smaller interval for real-time feel
    interval = max(1, minutes * 60 // 300)  # Aim for ~300 points max
    readings = generate_mock_readings(
        minutes=minutes, interval_seconds=interval, sensor_id=sensor_id
    )

    points = [
        SensorSeriesPoint(
            timestamp=r.timestamp,
            value=r.temperature if metric == "temperature" else r.humidity,
        )
        for r in readings
    ]

    return SensorSeriesOut(metric=metric, points=points)


def get_mock_chat_response(question: str) -> str:
    """Generate a mock chat response based on keyword detection."""
    question_lower = question.lower()
    summary = get_mock_summary()

    # Check for specific metric queries
    if "temperature" in question_lower:
        if "10 min" in question_lower or "10min" in question_lower:
            return f"The average temperature over the last 10 minutes is {summary.last_10_minutes.avg_temperature}°C."
        elif "hour" in question_lower:
            return f"The average temperature over the last hour is {summary.last_hour.avg_temperature}°C."
        elif "day" in question_lower or "daily" in question_lower:
            return f"The daily average temperature is {summary.last_day.avg_temperature}°C."
        else:
            return f"Current temperature readings: Last 10 min: {summary.last_10_minutes.avg_temperature}°C, Last hour: {summary.last_hour.avg_temperature}°C, Daily: {summary.last_day.avg_temperature}°C."

    if "humidity" in question_lower:
        if "10 min" in question_lower or "10min" in question_lower:
            return f"The average humidity over the last 10 minutes is {summary.last_10_minutes.avg_humidity}%."
        elif "hour" in question_lower:
            return f"The average humidity over the last hour is {summary.last_hour.avg_humidity}%."
        elif "day" in question_lower or "daily" in question_lower:
            return f"The daily average humidity is {summary.last_day.avg_humidity}%."
        else:
            return f"Current humidity readings: Last 10 min: {summary.last_10_minutes.avg_humidity}%, Last hour: {summary.last_hour.avg_humidity}%, Daily: {summary.last_day.avg_humidity}%."

    if "summary" in question_lower or "status" in question_lower or "overview" in question_lower:
        return (
            f"Here's the current sensor summary:\n\n"
            f"**Last 10 minutes:** {summary.last_10_minutes.avg_temperature}°C, {summary.last_10_minutes.avg_humidity}% humidity\n"
            f"**Last hour:** {summary.last_hour.avg_temperature}°C, {summary.last_hour.avg_humidity}% humidity\n"
            f"**Daily average:** {summary.last_day.avg_temperature}°C, {summary.last_day.avg_humidity}% humidity"
        )

    if "help" in question_lower:
        return (
            "I can help you with sensor data! Try asking about:\n"
            "- Temperature (e.g., 'What's the temperature in the last hour?')\n"
            "- Humidity (e.g., 'What's the humidity today?')\n"
            "- Summary or status (e.g., 'Give me a summary')"
        )

    # Default response
    return (
        f"I'm your sensor data assistant. Based on the latest readings, "
        f"the temperature is around {summary.last_10_minutes.avg_temperature}°C "
        f"with {summary.last_10_minutes.avg_humidity}% humidity. "
        f"Ask me about temperature, humidity, or request a summary!"
    )
