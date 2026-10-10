import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Agents } from './pages/Agents';
import { Incidents } from './pages/Incidents';
import { Analytics } from './pages/Analytics';
import { LiveMap } from './pages/Map';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { TerraAI } from './pages/TerraAI';
import { HeroLogin } from './pages/HeroLogin';
import { EmergencySOS } from './pages/EmergencySOS';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrgDashboard } from './pages/OrgDashboard';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroLogin />} />
        
        {/* Public SOS Route */}
        <Route path="/sos" element={<EmergencySOS />} />
        
        {/* Legacy route redirects */}
        <Route path="/map" element={<Navigate to="/app/map" replace />} />
        <Route path="/incidents" element={<Navigate to="/app/incidents" replace />} />
        <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />
        <Route path="/agents" element={<Navigate to="/app/agents" replace />} />
        <Route path="/assistant" element={<Navigate to="/app/assistant" replace />} />
        <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
        <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
        
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="assistant" element={<TerraAI />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="org" element={<OrgDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
