from fastapi import APIRouter, HTTPException, Depends
from typing import List
import os
from app.schemas.incidents import IncidentCreate, IncidentResponse, IncidentUpdate
from app.repositories.sqlite import SQLiteIncidentRepository
from app.repositories.supabase_repo import SupabaseIncidentRepository
from app.repositories.local import IncidentRepository

router = APIRouter()

# Select repo based on environment variables
if os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_KEY"):
    repo = SupabaseIncidentRepository()
else:
    repo = SQLiteIncidentRepository()

def get_repo() -> IncidentRepository:
    return repo

@router.post("", response_model=IncidentResponse, status_code=201)
def create_incident(incident: IncidentCreate, repo: IncidentRepository = Depends(get_repo)):
    return repo.create(incident)

@router.get("", response_model=List[IncidentResponse])
def list_incidents(repo: IncidentRepository = Depends(get_repo)):
    return repo.list_all()

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: str, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: str, update: IncidentUpdate, repo: IncidentRepository = Depends(get_repo)):
    incident = repo.update_status(incident_id, update)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
