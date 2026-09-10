import xml.etree.ElementTree as ET
import urllib.request
import urllib.error
from backend.graph.dynamic_graph import DynamicGraph
from backend.algorithms.heuristics import haversine_distance

class OSMLoader:
    """Loads OpenStreetMap data and converts to DynamicGraph."""
    def __init__(self):
        pass
        
    def load_from_file(self, filepath: str, filter_highway_types: list = None) -> DynamicGraph:
        try:
            tree = ET.parse(filepath)
            root = tree.getroot()
        except Exception:
            return DynamicGraph() # empty on error
            
        return self._parse_osm_root(root, filter_highway_types)
        
    def load_from_overpass(self, bbox: tuple, filter_highway_types: list = None) -> DynamicGraph:
        # bbox = (min_lat, min_lon, max_lat, max_lon)
        s_lat, w_lon, n_lat, e_lon = bbox
        query = f"""
        [out:xml][timeout:25];
        (
          way["highway"]({s_lat},{w_lon},{n_lat},{e_lon});
        );
        (._;>;);
        out body;
        """
        url = "https://overpass-api.de/api/interpreter"
        try:
            req = urllib.request.Request(url, data=query.encode('utf-8'), method='POST')
            with urllib.request.urlopen(req) as response:
                xml_data = response.read()
            root = ET.fromstring(xml_data)
            return self._parse_osm_root(root, filter_highway_types)
        except Exception:
            return DynamicGraph()
            
    def _parse_osm_root(self, root, filter_highway_types: list = None) -> DynamicGraph:
        graph = DynamicGraph()
        nodes = {} # id -> (lat, lng)
        
        # Parse nodes
        for node in root.findall('node'):
            n_id = node.get('id')
            lat = float(node.get('lat'))
            lon = float(node.get('lon'))
            nodes[n_id] = {'lat': lat, 'lng': lon}
            graph.add_node(n_id, nodes[n_id])
            
        # Parse ways
        for way in root.findall('way'):
            is_highway = False
            highway_type = None
            for tag in way.findall('tag'):
                if tag.get('k') == 'highway':
                    is_highway = True
                    highway_type = tag.get('v')
                    break
                    
            if not is_highway:
                continue
                
            if filter_highway_types and highway_type not in filter_highway_types:
                continue
                
            nd_refs = [nd.get('ref') for nd in way.findall('nd')]
            for i in range(len(nd_refs) - 1):
                u, v = nd_refs[i], nd_refs[i+1]
                if u in nodes and v in nodes:
                    dist = haversine_distance(nodes[u]['lat'], nodes[u]['lng'], nodes[v]['lat'], nodes[v]['lng'])
                    # base time assuming 5 m/s
                    base_time = dist / 5.0
                    
                    edge_data = {
                        "distance": dist,
                        "base_time": base_time,
                        "type": highway_type,
                        "bidirectional": True # simplification
                    }
                    
                    graph.add_edge(u, v, base_time, edge_data)
                    graph.add_edge(v, u, base_time, edge_data)
                    
        return graph
