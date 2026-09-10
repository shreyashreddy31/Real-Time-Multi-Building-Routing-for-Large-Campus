import time
import random
from typing import List
from backend.graph.dynamic_graph import DynamicGraph
from backend.graph.adjacency_list import AdjacencyListGraph
from backend.graph.adjacency_matrix import AdjacencyMatrixGraph
from backend.algorithms.dijkstra import dijkstra
from backend.algorithms.astar import astar
import dataclasses

class BenchmarkRunner:
    """Runs performance benchmarks on algorithms and graph representations."""
    def __init__(self, graph: DynamicGraph = None, node_data: dict = None):
        self.graph = graph
        self.node_data = node_data
        
    def run_comparison(self, source: str, target: str) -> dict:
        if not self.graph:
            return {}
            
        d_res = dijkstra(self.graph, source, target, self.node_data)
        a_res = astar(self.graph, source, target, self.node_data)
        
        return {
            "dijkstra": dataclasses.asdict(d_res),
            "astar": dataclasses.asdict(a_res),
            "speedup_factor": d_res.execution_time_ms / max(0.001, a_res.execution_time_ms),
            "nodes_saved": d_res.nodes_explored - a_res.nodes_explored
        }
        
    def run_representation_comparison(self, source: str, target: str) -> dict:
        if not self.graph:
            return {}
            
        # Create temp graphs
        adj_list = AdjacencyListGraph()
        adj_matrix = AdjacencyMatrixGraph()
        
        nodes = self.graph.get_nodes()
        edges = self.graph.get_edges()
        
        for n in nodes:
            data = self.graph.get_node_data(n)
            adj_list.add_node(n, data)
            adj_matrix.add_node(n, data)
            
        for u, v, w in edges:
            adj_list.add_edge(u, v, w)
            adj_matrix.add_edge(u, v, w)
            
        # Benchmark Adjacency List
        t1 = time.perf_counter()
        res_list = dijkstra(adj_list, source, target, self.node_data)
        t_list = (time.perf_counter() - t1) * 1000
        
        # Benchmark Adjacency Matrix
        t2 = time.perf_counter()
        res_matrix = dijkstra(adj_matrix, source, target, self.node_data)
        t_matrix = (time.perf_counter() - t2) * 1000
        
        return {
            "adjacency_list": {
                "time_ms": t_list,
                "path_length": len(res_list.path) if res_list.path else 0,
                "cost": res_list.cost,
                "nodes_explored": res_list.nodes_explored
            },
            "adjacency_matrix": {
                "time_ms": t_matrix,
                "path_length": len(res_matrix.path) if res_matrix.path else 0,
                "cost": res_matrix.cost,
                "nodes_explored": res_matrix.nodes_explored
            },
            "density": adj_list.density(),
            "faster_repr": "adjacency_list" if t_list < t_matrix else "adjacency_matrix"
        }
        
    def run_scale_test(self, node_counts: List[int] = [100, 500, 1000, 5000]) -> dict:
        results = {}
        for count in node_counts:
            # Generate random graph
            dg = DynamicGraph()
            nd = {}
            for i in range(count):
                data = {"lat": random.random()*90, "lng": random.random()*180}
                dg.add_node(f"n_{i}", data)
                nd[f"n_{i}"] = data
            for i in range(count):
                # add ~3 edges per node
                for _ in range(3):
                    j = random.randint(0, count-1)
                    if i != j:
                        dg.add_edge(f"n_{i}", f"n_{j}", random.random()*100)
                        
            # run A*
            if count > 1:
                t1 = time.perf_counter()
                astar(dg, "n_0", f"n_{count-1}", nd)
                t_astar = (time.perf_counter() - t1) * 1000
            else:
                t_astar = 0
                
            results[str(count)] = {
                "nodes": count,
                "edges": dg.edge_count(),
                "astar_ms": t_astar
            }
            
        return results
        
    def generate_report(self) -> dict:
        # Mock default run if nodes available
        if self.graph and self.graph.node_count() > 1:
            nodes = self.graph.get_nodes()
            s = nodes[0]
            t = nodes[-1]
            return {
                "comparison": self.run_comparison(s, t),
                "representation": self.run_representation_comparison(s, t)
            }
        return {}
