from fastapi import FastAPI

from app.database.database import Base, engine

# Import all models
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.transcript import Transcript
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem
from fastapi.middleware.cors import CORSMiddleware
from app.api.meeting import router as meeting_router
from app.api.action_item import router as action_item_router
from app.api.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies Clone API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meeting_router)
app.include_router(action_item_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {
        "message": "Backend Running 🚀"
    }