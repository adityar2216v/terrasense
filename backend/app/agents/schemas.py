from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AgentResult(BaseModel):
    agent_name: str
    execution_status: str  # SUCCESS, FAILED, UNAVAILABLE
    risk_score: Optional[int] = Field(None, ge=0, le=100)
    risk_level: Optional[str] = None  # LOW, MODERATE, HIGH, CRITICAL
    evidence: List[str] = []
    data_sources: List[str] = []
    observation_timestamp: Optional[str] = None
    missing_data: List[str] = []
    uncertainty_notes: Optional[str] = None
    recommended_actions: List[str] = []
    errors: List[str] = []

class Recommendation(BaseModel):
    title: str
    priority: str # LOW, MEDIUM, HIGH, CRITICAL
    triggering_evidence: str
    explanation: str
    suggested_next_step: str
    responsible_party: str
    verification_method: str

class WorkflowState(BaseModel):
    input_data: Dict[str, Any]
    air_result: Optional[AgentResult] = None
    water_result: Optional[AgentResult] = None
    waste_result: Optional[AgentResult] = None
    final_score: Optional[int] = None
    final_risk_level: Optional[str] = None
    coordinator_evidence: List[str] = []
    recommendations: List[Recommendation] = []
    execution_status: str = "PENDING"
    dominant_risk_contributor: Optional[str] = None
