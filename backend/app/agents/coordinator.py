from langgraph.graph import StateGraph, START, END
from typing import Dict, Any, TypedDict, Annotated
from app.agents.schemas import WorkflowState, Recommendation, AgentResult
from app.agents.air import analyze_air
from app.agents.water import analyze_water
from app.agents.waste import analyze_waste

def merge_state(a: WorkflowState, b: WorkflowState) -> WorkflowState:
    if not a: return b
    if not b: return a
    a.air_result = b.air_result or a.air_result
    a.water_result = b.water_result or a.water_result
    a.waste_result = b.waste_result or a.waste_result
    return a

class GraphState(TypedDict):
    state: Annotated[WorkflowState, merge_state]

def node_air(state: GraphState) -> GraphState:
    wf_state = state["state"]
    # We must create a new object or copy to avoid mutating the original reference if LangGraph complains,
    # but mutating is fine if we return a new wrapper. Actually, we should return a new WorkflowState to be safe.
    new_state = wf_state.model_copy()
    new_state.air_result = analyze_air(wf_state.input_data)
    return {"state": new_state}

def node_water(state: GraphState) -> GraphState:
    wf_state = state["state"]
    new_state = wf_state.model_copy()
    new_state.water_result = analyze_water(wf_state.input_data)
    return {"state": new_state}

def node_waste(state: GraphState) -> GraphState:
    wf_state = state["state"]
    new_state = wf_state.model_copy()
    new_state.waste_result = analyze_waste(wf_state.input_data)
    return {"state": new_state}

def node_coordinator(state: GraphState) -> GraphState:
    wf_state = state["state"]
    
    # Extract scores for successful/partial agents
    scores = {}
    
    if wf_state.air_result and wf_state.air_result.execution_status in ["SUCCESS", "PARTIAL"] and wf_state.air_result.risk_score is not None:
        scores["Air"] = wf_state.air_result.risk_score
    if wf_state.water_result and wf_state.water_result.execution_status in ["SUCCESS", "PARTIAL"] and wf_state.water_result.risk_score is not None:
        scores["Water"] = wf_state.water_result.risk_score
    if wf_state.waste_result and wf_state.waste_result.execution_status in ["SUCCESS", "PARTIAL"] and wf_state.waste_result.risk_score is not None:
        scores["Waste"] = wf_state.waste_result.risk_score
        
    if not scores:
        wf_state.execution_status = "FAILED"
        wf_state.coordinator_evidence.append("All specialist agents failed or were unavailable.")
        wf_state.final_score = None
        wf_state.final_risk_level = "UNKNOWN"
        return {"state": wf_state}
        
    # Calculate final score (weighted average if specific weights exist, else simple average)
    # Weights based on prompt: Air 0.40, Water 0.35, Waste 0.25
    weights = {"Air": 0.40, "Water": 0.35, "Waste": 0.25}
    total_weight = sum(weights[agent] for agent in scores)
    
    wf_state.final_score = int(sum(scores[agent] * (weights[agent] / total_weight) for agent in scores))
    
    if total_weight < 1.0:
        wf_state.coordinator_evidence.append(f"Partial analysis. Final score normalized based on available agents: {', '.join(scores.keys())}.")
        wf_state.execution_status = "PARTIAL"
    else:
        wf_state.execution_status = "SUCCESS"
        wf_state.coordinator_evidence.append("Full analysis completed using all agents.")
        
    # Dominant risk contributor
    max_agent = max(scores, key=scores.get)
    wf_state.dominant_risk_contributor = max_agent
    wf_state.coordinator_evidence.append(f"Dominant risk factor identified from {max_agent} Agent with score {scores[max_agent]}.")
    
    # Set final risk level
    if wf_state.final_score < 25:
        wf_state.final_risk_level = "LOW"
    elif wf_state.final_score < 50:
        wf_state.final_risk_level = "MODERATE"
    elif wf_state.final_score < 75:
        wf_state.final_risk_level = "HIGH"
    else:
        wf_state.final_risk_level = "CRITICAL"
        
    # Build recommendations based on findings
    if wf_state.final_risk_level in ["HIGH", "CRITICAL"]:
        wf_state.recommendations.append(
            Recommendation(
                title="Immediate Site Inspection",
                priority="CRITICAL",
                triggering_evidence=f"High risk score from {max_agent}",
                explanation=f"The reported data indicates dangerous levels of environmental risk primarily driven by {max_agent.lower()} factors.",
                suggested_next_step="Dispatch field team for manual verification.",
                responsible_party="Environmental Response Team",
                verification_method="On-site lab sampling"
            )
        )
        
    return {"state": wf_state}

# Build LangGraph
workflow = StateGraph(GraphState)

workflow.add_node("air_agent", node_air)
workflow.add_node("water_agent", node_water)
workflow.add_node("waste_agent", node_waste)
workflow.add_node("coordinator", node_coordinator)

# Parallel execution
workflow.add_edge(START, "air_agent")
workflow.add_edge(START, "water_agent")
workflow.add_edge(START, "waste_agent")
workflow.add_edge("air_agent", "coordinator")
workflow.add_edge("water_agent", "coordinator")
workflow.add_edge("waste_agent", "coordinator")
workflow.add_edge("coordinator", END)

# Compile
engine = workflow.compile()
