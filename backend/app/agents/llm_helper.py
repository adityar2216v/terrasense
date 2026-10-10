import os
import json
from typing import Dict, Any, Callable
from app.agents.schemas import AgentResult

def get_llm():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        from langchain_openai import ChatOpenAI
        # We use gpt-4o-mini as it is fast and supports structured output
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1, api_key=api_key)
        return llm.with_structured_output(AgentResult)
    except Exception as e:
        print(f"Failed to initialize LLM: {e}")
        return None

def analyze_with_llm(domain: str, input_data: Dict[str, Any], fallback: Callable[[Dict[str, Any]], AgentResult]) -> AgentResult:
    llm = get_llm()
    if not llm:
        print(f"No GEMINI_API_KEY found or LLM failed. Using deterministic fallback for {domain}.")
        return fallback(input_data)
        
    prompt = f"""
    You are the '{domain.capitalize()} Intelligence Core' of the TerraSense Environmental platform.
    Analyze the following telemetry/incident data and return a highly accurate assessment of the environmental risk.
    
    Data:
    {json.dumps(input_data, indent=2)}
    
    Instructions:
    1. Determine the risk_score from 0-100 based on the severity of the data.
    2. Set risk_level to LOW (0-24), MODERATE (25-49), HIGH (50-74), or CRITICAL (75-100).
    3. Generate highly technical 'evidence' bullet points explaining what patterns you see.
    4. Propose actionable 'recommended_actions'.
    5. Be professional and act as a sophisticated AI agent.
    6. Ensure 'execution_status' is 'SUCCESS' unless the data is completely irrelevant, then 'UNAVAILABLE'.
    7. 'agent_name' should be "{domain.capitalize()} Intelligence Core (TerraSense-LLM)".
    """
    
    try:
        result = llm.invoke(prompt)
        return result
    except Exception as e:
        print(f"LLM inference failed for {domain}: {e}. Falling back.")
        return fallback(input_data)
