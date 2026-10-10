export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://terrasense-api-6wlk.onrender.com/api';

export interface Incident {
  incident_id: string;
  category: string;
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  source_type: string;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  title: string;
  priority: string;
  triggering_evidence: string;
  explanation: string;
  suggested_next_step: string;
  responsible_party: string;
  verification_method: string;
}

export interface AgentResult {
  agent_name: string;
  execution_status: string;
  risk_score?: number;
  risk_level?: string;
  evidence: string[];
  data_sources: string[];
  missing_data: string[];
  recommended_actions: string[];
  errors: string[];
}

export interface WorkflowState {
  input_data: any;
  air_result?: AgentResult;
  water_result?: AgentResult;
  waste_result?: AgentResult;
  final_score?: number;
  final_risk_level?: string;
  coordinator_evidence: string[];
  recommendations: Recommendation[];
  execution_status: string;
  dominant_risk_contributor?: string;
}

export const api = {
  async getIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },

  async createIncident(data: Partial<Incident>): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create incident');
    return response.json();
  },

  async runAnalysis(incidentId: string, inputData: any): Promise<WorkflowState> {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, input_data: inputData })
    });
    if (!response.ok) throw new Error('Failed to run analysis');
    return response.json();
  },

  async runAirAnalysis(incidentId: string, inputData: any): Promise<AgentResult> {
    const response = await fetch(`${API_BASE_URL}/air/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, input_data: inputData })
    });
    if (!response.ok) throw new Error('Failed to run air analysis');
    return response.json();
  },

  async runWaterAnalysis(incidentId: string, inputData: any): Promise<AgentResult> {
    const response = await fetch(`${API_BASE_URL}/water/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, input_data: inputData })
    });
    if (!response.ok) throw new Error('Failed to run water analysis');
    return response.json();
  },

  async runWasteAnalysis(incidentId: string, inputData: any): Promise<AgentResult> {
    const response = await fetch(`${API_BASE_URL}/waste/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incident_id: incidentId, input_data: inputData })
    });
    if (!response.ok) throw new Error('Failed to run waste analysis');
    return response.json();
  },

  async uploadWasteImage(file: File): Promise<{ filename: string; status: string; has_image: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/waste/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  async simulateEndToEnd(): Promise<{ incident: Incident; analysis: WorkflowState }> {
    const response = await fetch(`${API_BASE_URL}/analyses/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error('Failed to simulate end-to-end flow');
    return response.json();
  }
};
