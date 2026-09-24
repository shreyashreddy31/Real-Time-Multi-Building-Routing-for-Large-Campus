import axios from 'axios';

const api = axios.create({
  baseURL: 'https://real-time-multi-building-routing-for-t71s.onrender.com/api',
});

export const getNetwork = async () => (await api.get('/network')).data;
export const getPlaces = async () => (await api.get('/places')).data;
export const getPlace = async (id) => (await api.get(`/places/${id}`)).data;
export const getNodes = async () => (await api.get('/nodes')).data;
export const getEdges = async () => (await api.get('/edges')).data;
export const calculateRoute = async (params) => (await api.post('/route', params)).data;
export const reroute = async (routeId) => (await api.post('/reroute', { route_id: routeId })).data;
export const updateTraffic = async (params) => (await api.post('/traffic', params)).data;
export const createIncident = async (params) => (await api.post('/incident', params)).data;
export const resolveIncident = async (id) => (await api.post(`/incident/${id}/resolve`)).data;
export const closeRoad = async (params) => (await api.post('/road/close', params)).data;
export const openRoad = async (params) => (await api.post('/road/open', params)).data;
export const dispatchEmergency = async (params) => (await api.post('/emergency', params)).data;
export const getParking = async () => (await api.get('/parking')).data;
export const navigateToParking = async (params) => (await api.post('/parking/navigate', params)).data;
export const getStatistics = async () => (await api.get('/statistics')).data;
export const getPerformance = async () => (await api.get('/performance')).data;
export const runBenchmark = async (params) => (await api.post('/benchmark/run', params)).data;
export const getIncidents = async () => (await api.get('/incidents')).data;
export const searchPlaces = async (query) => (await api.get(`/search?q=${encodeURIComponent(query)}`)).data;
export const getEdgesList = async () => (await api.get('/edges/list')).data;
export const runRepresentationBenchmark = async (params) => (await api.post('/benchmark/representation', params)).data;
export const runScaleBenchmark = async () => (await api.post('/benchmark/scale')).data;
export const getReroutingStats = async () => (await api.get('/rerouting-stats')).data;
export const simulateScenario = async (params) => (await api.post('/simulate', params)).data;
export const compareRoutes = async (params) => (await api.post('/compare-routes', params)).data;
export const routeWithIntelligence = async (params) => (await api.post('/route-with-intelligence', params)).data;

export default api;
