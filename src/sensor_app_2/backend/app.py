import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .config import conf
from .logger import logger
from .router import api
from .runtime import rt
from .utils import add_not_found_handler

# Skip DB validation when using mock data (set SENSOR_APP_MOCK_DATA=true)
USE_MOCK_DATA = os.getenv("SENSOR_APP_MOCK_DATA", "true").lower() == "true"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting app with configuration:\n{conf.model_dump_json(indent=2)}")
    if USE_MOCK_DATA:
        logger.info("Running in MOCK DATA mode - skipping database validation")
    else:
        rt.validate_db()
        rt.initialize_models()
    yield


app = FastAPI(title=f"{conf.app_name}", lifespan=lifespan)
ui = StaticFiles(directory=conf.static_assets_path, html=True)

# note the order of includes and mounts!
app.include_router(api)
app.mount("/", ui)


add_not_found_handler(app)
