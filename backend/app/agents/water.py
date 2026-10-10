from datetime import datetime, timezone
from typing import Dict, Any
from app.agents.schemas import AgentResult

def analyze_water(input_data: Dict[str, Any]) -> AgentResult:
    ph = input_data.get("ph")
    turbidity = input_data.get("turbidity")
    dissolved_oxygen = input_data.get("dissolved_oxygen")
    
    result = AgentResult(
        agent_name="Water Intelligence Core",
        execution_status="SUCCESS",
        data_sources=["River Basins IoT Sensors", "LangGraph Reasoning Engine"],
        observation_timestamp=datetime.now(timezone.utc).isoformat()
    )
    
    if ph is None and turbidity is None and dissolved_oxygen is None:
        result.execution_status = "UNAVAILABLE"
        result.missing_data.extend(["ph", "turbidity", "dissolved_oxygen"])
        result.errors.append("No hydrological data available for inference.")
        result.uncertainty_notes = "Insufficient data. Cannot perform assessment."
        return result
        
    result.evidence.append("Note: The calculated score is an internal screening metric based on weighted heuristic penalties, not a certified Water Quality Index (WQI).")
    
    ph_penalty = 0
    if ph is not None:
        try:
            ph_val = float(ph)
            if ph_val < 0 or ph_val > 14:
                result.errors.append(f"Invalid pH value: {ph_val}")
            else:
                ph_penalty = abs(7 - ph_val) * 15
                result.evidence.append(f"Primary Sensor pH measured at {ph_val}.")
        except ValueError:
            result.errors.append(f"Non-numeric pH value provided: {ph}")
    else:
        result.missing_data.append("ph")
        
    turbidity_penalty = 0
    if turbidity is not None:
        try:
            turb_val = float(turbidity)
            if turb_val < 0:
                result.errors.append(f"Invalid turbidity value: {turb_val}")
            else:
                turbidity_penalty = min(turb_val * 1.5, 40)
                result.evidence.append(f"Primary Sensor Turbidity measured at {turb_val} NTU.")
        except ValueError:
            result.errors.append(f"Non-numeric turbidity value provided: {turbidity}")
    else:
        result.missing_data.append("turbidity")

    do_penalty = 0
    if dissolved_oxygen is not None:
        try:
            do_val = float(dissolved_oxygen)
            if do_val < 0:
                result.errors.append(f"Invalid dissolved oxygen value: {do_val}")
            else:
                if do_val < 6.0:
                    do_penalty = (6.0 - do_val) * 10
                result.evidence.append(f"Dissolved Oxygen measured at {do_val} mg/L.")
        except ValueError:
            result.errors.append(f"Non-numeric dissolved oxygen value provided: {dissolved_oxygen}")
    else:
        result.missing_data.append("dissolved_oxygen")
        
    score = min(ph_penalty + turbidity_penalty + do_penalty, 100)
    result.risk_score = int(score)
    
    if result.risk_score < 25:
        result.risk_level = "LOW"
    elif result.risk_score < 50:
        result.risk_level = "MODERATE"
    elif result.risk_score < 75:
        result.risk_level = "HIGH"
    else:
        result.risk_level = "CRITICAL"
        
    if result.risk_level in ["HIGH", "CRITICAL"]:
        result.recommended_actions.append("Autonomous Surface Vehicle Dispatch: Deploy for targeted water sampling.")
        result.recommended_actions.append("Issue automated API alert to regional water treatment facilities.")
        
    if result.errors:
        result.execution_status = "PARTIAL" if len(result.evidence) > 1 else "FAILED"
        
    return result
