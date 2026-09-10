import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ExploreCampus from './pages/ExploreCampus';
import Navigation from './pages/Navigation';
import Places from './pages/Places';
import LiveConditions from './pages/LiveConditions';
import Emergency from './pages/Emergency';
import Parking from './pages/Parking';
import DSAPerformance from './pages/DSAPerformance';
import Admin from './pages/Admin';
import wsManager from './services/websocket';
import { useCampusStore, useTrafficStore, useParkingStore, useNavigationStore, useEmergencyStore } from './stores/campusStore';

function App() {
  const { fetchInitialData } = useCampusStore();
  const { fetchIncidents, addIncident, updateIncident, updateTraffic } = useTrafficStore();
  const { fetchParking, updateParking } = useParkingStore();
  const { handleReroute } = useNavigationStore();
  const { updateDispatch } = useEmergencyStore();

  useEffect(() => {
    useCampusStore.getState().fetchInitialData();
    fetchIncidents();
    fetchParking();

    wsManager.connect();

    const unsubTraffic = wsManager.subscribe('traffic_update', (data) => updateTraffic(data));
    const unsubIncidentCreate = wsManager.subscribe('incident_created', (data) => addIncident(data));
    const unsubIncidentResolve = wsManager.subscribe('incident_resolved', (data) => updateIncident(data));
    const unsubReroute = wsManager.subscribe('reroute', (data) => handleReroute(data));
    const unsubParking = wsManager.subscribe('parking_update', (data) => updateParking(data));
    const unsubEmergency = wsManager.subscribe('emergency_update', (data) => updateDispatch(data));

    return () => {
      unsubTraffic();
      unsubIncidentCreate();
      unsubIncidentResolve();
      unsubReroute();
      unsubParking();
      unsubEmergency();
      wsManager.disconnect();
    };
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreCampus />} />
            <Route path="/navigate" element={<Navigation />} />
            <Route path="/places" element={<Places />} />
            <Route path="/live" element={<LiveConditions />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/parking" element={<Parking />} />
            <Route path="/dsa" element={<DSAPerformance />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
