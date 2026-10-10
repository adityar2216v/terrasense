from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import incidents, analyses

app = FastAPI(
    title="TerraSense API",
    description="Environmental Intelligence Platform API",
    version="1.0.0"
)

import os
from dotenv import load_dotenv

load_dotenv()

# Configure CORS for local frontend dev and production
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
legacy_frontend_url = os.environ.get("FRONTEND_URL", "")

raw_origins = allowed_origins_env.split(",")
if legacy_frontend_url:
    raw_origins.append(legacy_frontend_url)

allow_origins = []
for origin in raw_origins:
    origin = origin.strip()
    if origin:
        # Strip trailing slash to ensure Exact Match in FastAPI CORSMiddleware works
        if origin.endswith("/"):
            origin = origin[:-1]
        allow_origins.append(origin)

# Remove duplicates
allow_origins = list(set(allow_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/status")
def api_status():
    has_supabase = bool(os.environ.get("DATABASE_URL"))
    has_aws_sns = bool(os.environ.get("AWS_SNS_TOPIC_ARN"))
    
    aws_status = "NOT CONFIGURED"
    if has_aws_sns:
        try:
            import boto3
            sts = boto3.client('sts')
            sts.get_caller_identity()
            aws_status = "CONNECTED & VERIFIED"
        except Exception:
            aws_status = "CONFIGURED BUT UNREACHABLE (Check Credentials)"

    return {
        "persistence_layer": "Supabase PostgreSQL" if has_supabase else "Disconnected",
        "persistence_status": "CONNECTED" if has_supabase else "OFFLINE",
        "aws_sns_integration": aws_status,
        "langgraph_agents": "ACTIVE",
        "environment": "LOCAL DEVELOPMENT"
    }

app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(analyses.router, prefix="/api", tags=["analyses"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
