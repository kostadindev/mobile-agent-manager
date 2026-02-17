from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import chat, execute, approve
from config import settings

app = FastAPI(title="AgentFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(execute.router)
app.include_router(approve.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
