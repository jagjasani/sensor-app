from typing import Annotated, Literal

from databricks.sdk import WorkspaceClient
from databricks.sdk.service.iam import User as UserOut
from fastapi import APIRouter, Depends, Query

from .config import conf
from .dependencies import get_obo_ws
from .models import (
    SensorChatRequest,
    SensorChatResponse,
    SensorSeriesOut,
    SensorSummaryOut,
    VersionOut,
)
from .utils import get_mock_chat_response, get_mock_series, get_mock_summary

api = APIRouter(prefix=conf.api_prefix)


@api.get("/version", response_model=VersionOut, operation_id="version")
async def version():
    return VersionOut.from_metadata()


@api.get("/current-user", response_model=UserOut, operation_id="currentUser")
def me(obo_ws: Annotated[WorkspaceClient, Depends(get_obo_ws)]):
    return obo_ws.current_user.me()


# ─────────────────────────────────────────────────────────────────────────────
# Sensor API Routes
# ─────────────────────────────────────────────────────────────────────────────


@api.get(
    "/sensors/summary",
    response_model=SensorSummaryOut,
    operation_id="sensorSummary",
    summary="Get sensor summary",
    description="Returns aggregated sensor data for 10 minutes, 1 hour, and daily windows.",
)
async def get_sensor_summary():
    """Get aggregated sensor data for multiple time windows."""
    return get_mock_summary()


@api.get(
    "/sensors/series",
    response_model=SensorSeriesOut,
    operation_id="sensorSeries",
    summary="Get sensor time series",
    description="Returns time series data for temperature or humidity.",
)
async def get_sensor_series(
    metric: Annotated[
        Literal["temperature", "humidity"],
        Query(description="The metric to retrieve"),
    ] = "temperature",
    minutes: Annotated[
        int,
        Query(ge=1, le=1440, description="Number of minutes of data to retrieve"),
    ] = 10,
    sensor_id: Annotated[
        str | None,
        Query(description="Optional sensor ID filter"),
    ] = None,
):
    """Get time series data for a specific metric."""
    return get_mock_series(metric=metric, minutes=minutes, sensor_id=sensor_id)


@api.post(
    "/sensors/chat",
    response_model=SensorChatResponse,
    operation_id="sensorChat",
    summary="Chat with sensor data",
    description="Send a question about sensor data and get an intelligent response.",
)
async def chat_with_sensors(request: SensorChatRequest):
    """Chat with sensor data using natural language."""
    answer = get_mock_chat_response(request.question)
    return SensorChatResponse(answer=answer)
