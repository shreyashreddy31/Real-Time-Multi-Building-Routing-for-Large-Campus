import { create } from 'zustand';
import * as api from '../services/api';

export const useCampusStore = create((set) => ({
  places: [],
  nodes: [],
  edges: [],
  networkInfo: null,
  isLoading: false,
  error: null,
  
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const [places, nodes, edges, networkInfo] = await Promise.all([
        api.getPlaces(),
        api.getNodes(),
        api.getEdges(),
        api.getNetwork()
      ]);
      set({ places, nodes, edges, networkInfo, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export const useNavigationStore = create((set, get) => ({
  currentRoute: null,
  fromNode: null,
  toNode: null,
  algorithm: 'astar',
  routeType: 'fastest',
  avoidCrowds: false,
  isNavigating: false,
  routeHistory: [],
  
  setNavigationParams: (params) => set((state) => ({ ...state, ...params })),
  
  calculateRoute: async () => {
    const { fromNode, toNode, algorithm, routeType, avoidCrowds } = get();
    if (!fromNode || !toNode) return;
    
    set({ isNavigating: true, rerouteAlert: false });
    try {
      const route = await api.calculateRoute({
        from_node: fromNode,
        to_node: toNode,
        algorithm,
        route_type: routeType,
        avoid_crowds: avoidCrowds
      });
      set((state) => ({ 
        currentRoute: route, 
        isNavigating: false,
        routeHistory: [route, ...state.routeHistory].slice(0, 10)
      }));
    } catch (error) {
      set({ isNavigating: false });
      console.error(error);
    }
  },
  
  handleReroute: (newRoute) => set({ currentRoute: newRoute, rerouteAlert: true }),
  clearRerouteAlert: () => set({ rerouteAlert: false })
}));

export const useTrafficStore = create((set) => ({
  incidents: [],
  trafficStates: {},
  
  fetchIncidents: async () => {
    try {
      const incidents = await api.getIncidents();
      set({ incidents });
    } catch (error) {
      console.error(error);
    }
  },
  
  addIncident: (incident) => set((state) => ({ 
    incidents: [incident, ...state.incidents] 
  })),
  
  updateIncident: (incident) => set((state) => ({
    incidents: state.incidents.map(i => i.id === incident.id ? incident : i)
  })),
  
  removeIncident: (id) => set((state) => ({
    incidents: state.incidents.filter(i => i.id !== id)
  })),
  
  updateTraffic: (data) => set((state) => ({
    trafficStates: { ...state.trafficStates, [`${data.from_node}-${data.to_node}`]: data.level }
  }))
}));

export const useParkingStore = create((set) => ({
  parkingZones: [],
  
  fetchParking: async () => {
    try {
      const parkingZones = await api.getParking();
      set({ parkingZones });
    } catch (error) {
      console.error(error);
    }
  },
  
  updateParking: (zone) => set((state) => ({
    parkingZones: state.parkingZones.map(z => z.id === zone.id ? zone : z)
  }))
}));

export const useEmergencyStore = create((set) => ({
  activeDispatches: [],
  
  addDispatch: (dispatch) => set((state) => ({
    activeDispatches: [dispatch, ...state.activeDispatches]
  })),
  
  updateDispatch: (dispatch) => set((state) => ({
    activeDispatches: state.activeDispatches.map(d => d.dispatch_id === dispatch.dispatch_id ? dispatch : d)
  }))
}));
