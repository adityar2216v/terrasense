from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class IncidentCreate(BaseModel):
    category: str
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: IncidentSeverity = IncidentSeverity.MODERATE
    source_type: str = "MANUAL"

class IncidentUpdate(BaseModel):
    status: IncidentStatus

class IncidentResponse(IncidentCreate):
    incident_id: str
    status: IncidentStatus
    evidence_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
