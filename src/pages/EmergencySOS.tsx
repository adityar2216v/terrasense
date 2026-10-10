import { useState, useRef } from 'react';
import { Camera, MapPin, AlertCircle, CheckCircle, Send, Upload, Loader2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export function EmergencySOS() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Waste Management',
    latitude: 0,
    longitude: 0,
    file: null as File | null
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (err) => {
          console.error(err);
          // Fallback to random if user denies, for demo purposes
          setFormData(prev => ({
            ...prev,
            latitude: +(Math.random() * 180 - 90).toFixed(4),
            longitude: +(Math.random() * 360 - 180).toFixed(4)
          }));
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (formData.file) {
        await api.uploadWasteImage(formData.file);
      }
      
      await api.createIncident({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: 'HIGH',
        status: 'OPEN',
        latitude: formData.latitude || 28.6139,
        longitude: formData.longitude || 77.2090,
        source_type: 'PUBLIC_SOS'
      });
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-brand-bg-main flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-brand-bg-secondary p-8 rounded-2xl border border-brand-primary text-center">
          <CheckCircle className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
          <p className="text-gray-400 mb-6">Your emergency report has been received and routed to the corresponding authorities. Thank you for your vigilance.</p>
          <button 
            onClick={() => {
              setSuccess(false);
              setFormData({title: '', description: '', category: 'Waste Management', latitude: 0, longitude: 0, file: null});
            }}
            className="w-full bg-brand-surface text-white py-3 rounded-lg hover:bg-brand-surface/80 transition"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg-main text-white py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <ShieldAlert className="w-8 h-8 text-risk-critical" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">Emergency SOS</h1>
          <p className="text-brand-text-secondary mt-2">Report environmental hazards directly to the TerraSense analysis grid.</p>
        </div>

        <div className="bg-[#131E2F] rounded-2xl border border-white/10 p-6 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Hazard Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Chemical Spill in River"
                className="w-full bg-[#0B131E] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#0B131E] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition"
              >
                <option>Waste Management</option>
                <option>Water Quality</option>
                <option>Air Quality</option>
                <option>Industrial Hazard</option>
                <option>Deforestation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description & Observations</label>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what you see, smell, or hear..."
                className="w-full bg-[#0B131E] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary transition resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={getLocation}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                  formData.latitude ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-[#0B131E] border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <MapPin className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium text-center">
                  {formData.latitude ? `${formData.latitude.toFixed(2)}, ${formData.longitude.toFixed(2)}` : 'Attach Location'}
                </span>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition ${
                  formData.file ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-[#0B131E] border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFormData({...formData, file: e.target.files[0]});
                    }
                  }}
                />
                {formData.file ? <CheckCircle className="w-6 h-6 mb-2" /> : <Camera className="w-6 h-6 mb-2" />}
                <span className="text-xs font-medium text-center truncate w-full px-2">
                  {formData.file ? formData.file.name : 'Upload Photo'}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-risk-critical hover:bg-risk-critical/90 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 mt-4"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</>
              ) : (
                <><Send className="w-5 h-5" /> Submit Emergency Alert</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
