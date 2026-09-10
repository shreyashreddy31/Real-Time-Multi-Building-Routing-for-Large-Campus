import React, { useState } from 'react';
import { Settings, AlertTriangle, ShieldX, CheckCircle, Car, Activity, Map as MapIcon, Lock, Unlock } from 'lucide-react';
import { useCampusStore, useTrafficStore } from '../stores/campusStore';
import * as api from '../services/api';
import CampusMap from '../map/CampusMap';

export default function Admin() {
  const { edges } = useCampusStore();
  const { incidents } = useTrafficStore();
  const activeIncidents = incidents.filter(i => i.status === 'active');

  const [incidentForm, setIncidentForm] = useState({
    type: 'construction', from_node: '', to_node: '', severity: 'medium', description: '', duration_minutes: 60
  });
  const [selectedEdge, setSelectedEdge] = useState('');
  const [trafficLevel, setTrafficLevel] = useState('normal');
  const [apiEdges, setApiEdges] = useState([]);

  React.useEffect(() => {
    api.getEdgesList().then(setApiEdges).catch(console.error);
  }, []);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.from_node || !incidentForm.to_node) return alert("Select edge");
    try {
      await api.createIncident(incidentForm);
      alert('Incident created successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveIncident(id);
      alert('Incident resolved.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdateTraffic = async () => {
    if (!selectedEdge) return alert('Select a road');
    const [from_node, to_node] = selectedEdge.split('|');
    try {
      await api.updateTraffic({ from_node, to_node, level: trafficLevel });
      alert('Traffic updated successfully.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRoadClose = async () => {
    if (!selectedEdge) return alert('Select a road');
    const [from_node, to_node] = selectedEdge.split('|');
    try {
      await api.closeRoad({ from_node, to_node });
      alert('Road closed.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRoadOpen = async () => {
    if (!selectedEdge) return alert('Select a road');
    const [from_node, to_node] = selectedEdge.split('|');
    try {
      await api.openRoad({ from_node, to_node });
      alert('Road opened.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <Settings className="h-8 w-8 text-slate-800" />
        <h1 className="text-3xl font-bold text-slate-900">Admin Console</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Edge Selector - Global for Traffic & Road closures */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MapIcon className="h-5 w-5 text-indigo-500" /> Road Controls</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Road Segment</label>
              <select className="w-full p-2 border rounded" value={selectedEdge} onChange={e => setSelectedEdge(e.target.value)}>
                <option value="">Select a road...</option>
                {apiEdges.map(e => <option key={`${e.from_node}|${e.to_node}`} value={`${e.from_node}|${e.to_node}`}>{e.name || `${e.from_node} to ${e.to_node}`}</option>)}
              </select>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Traffic Level</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {['normal', 'moderate', 'heavy', 'severe'].map(level => (
                  <button key={level} onClick={() => setTrafficLevel(level)} className={`p-2 rounded border text-sm capitalize ${trafficLevel === level ? 'bg-indigo-100 border-indigo-500 font-bold' : 'bg-slate-50'}`}>
                    {level}
                  </button>
                ))}
              </div>
              <button onClick={handleUpdateTraffic} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium">Update Traffic</button>
            </div>

            <div className="border-t pt-4 mt-4 grid grid-cols-2 gap-4">
              <button onClick={handleRoadClose} className="w-full py-2 bg-red-100 text-red-700 border border-red-200 rounded hover:bg-red-200 font-medium flex justify-center items-center gap-2"><Lock className="h-4 w-4"/> Close Road</button>
              <button onClick={handleRoadOpen} className="w-full py-2 bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-200 font-medium flex justify-center items-center gap-2"><Unlock className="h-4 w-4"/> Open Road</button>
            </div>
          </div>

          {/* Incident Creator */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Create Incident</h2>
            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full p-2 border rounded" value={incidentForm.type} onChange={e=>setIncidentForm({...incidentForm, type: e.target.value})}>
                    {['construction', 'accident', 'flood', 'fallen_tree', 'pothole', 'crowd'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select className="w-full p-2 border rounded" value={incidentForm.severity} onChange={e=>setIncidentForm({...incidentForm, severity: e.target.value})}>
                    {['low', 'medium', 'high', 'critical'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Road Segment</label>
                <select className="w-full p-2 border rounded" onChange={e => {
                  const edge = apiEdges.find(ed => `${ed.from_node}|${ed.to_node}` === e.target.value);
                  if(edge) setIncidentForm({...incidentForm, from_node: edge.from_node, to_node: edge.to_node});
                }}>
                  <option value="">Select a road...</option>
                  {apiEdges.map(e => <option key={`${e.from_node}|${e.to_node}`} value={`${e.from_node}|${e.to_node}`}>{e.name || `${e.from_node} to ${e.to_node}`}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Description</label>
                 <input type="text" className="w-full p-2 border rounded" value={incidentForm.description} onChange={e=>setIncidentForm({...incidentForm, description: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-2 bg-slate-900 text-white rounded hover:bg-slate-800 font-medium">Inject Incident</button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Active Incidents Manager */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldX className="h-5 w-5 text-red-500" /> Manage Incidents</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {activeIncidents.length === 0 ? <p className="text-slate-500 text-sm">No active incidents.</p> : activeIncidents.map(inc => (
                <div key={inc.id} className="p-3 border rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm uppercase">{inc.type} - {inc.severity}</div>
                    <div className="text-xs text-slate-500">{inc.road_name || `${inc.from_name} to ${inc.to_name}`}</div>
                  </div>
                  <button onClick={() => handleResolve(inc.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold flex items-center gap-1 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3" /> Resolve
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Map Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[400px]">
            <CampusMap incidents={incidents} />
          </div>
        </div>
      </div>
    </div>
  );
}
