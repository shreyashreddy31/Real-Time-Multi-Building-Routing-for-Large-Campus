import React, { useState, useEffect } from 'react';
import { Activity, Database, Cpu, Play } from 'lucide-react';
import * as api from '../services/api';
import StatsCard from '../components/StatsCard';

export default function DSAPerformance() {
  const [stats, setStats] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [benchmarkParams, setBenchmarkParams] = useState({ source: 'main_gate', target: 'central_library' });
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [repResult, setRepResult] = useState(null);
  const [scaleResult, setScaleResult] = useState(null);

  useEffect(() => {
    api.getStatistics().then(setStats).catch(console.error);
    api.getNodes().then(setNodes).catch(console.error);
  }, []);

  const handleBenchmark = async () => {
    setIsRunning(true);
    try {
      const res = await api.runBenchmark({ ...benchmarkParams, algorithms: ['dijkstra', 'astar'] });
      setBenchmarkResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Database className="h-8 w-8 text-primary" /> System Architecture & DSA
        </h1>
        <p className="text-slate-500 mt-2">Insights into the data structures and algorithms powering Meridian.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard icon={Database} label="Nodes" value={stats.node_count} colorClass="bg-blue-100 text-blue-600" />
          <StatsCard icon={Activity} label="Edges" value={stats.edge_count} colorClass="bg-emerald-100 text-emerald-600" />
          <StatsCard icon={Cpu} label="Avg Degree" value={stats.average_degree.toFixed(2)} colorClass="bg-purple-100 text-purple-600" />
          <StatsCard icon={Play} label="Active Routes" value={stats.active_routes} colorClass="bg-amber-100 text-amber-600" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Theory Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Core Data Structures</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h3 className="font-semibold text-slate-900">Adjacency List Graph</h3>
              <p>Primary representation for the sparse campus network. Memory: O(V + E). Allows fast neighbor iteration which is crucial for routing algorithms.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Min-Heap Priority Queue</h3>
              <p>Powers Dijkstra and A* open sets. Extract-Min in O(log V) time.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Hash Maps</h3>
              <p>Used for O(1) lookups of node data, edge weights, and real-time traffic modifiers.</p>
            </div>
          </div>
          
          <h2 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Routing Algorithms</h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <h3 className="font-semibold text-primary">A* Search (Default)</h3>
              <p>Uses Haversine distance heuristic. Time complexity: O((V+E)log V) but explores significantly fewer nodes in practice due to directed search.</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Dijkstra's Algorithm</h3>
              <p>Used as baseline and for multi-target routing (e.g., finding nearest parking). Explores uniformly in all directions.</p>
            </div>
          </div>
        </div>

        {/* Benchmark Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Live Benchmark</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Source Node ID</label>
               <select value={benchmarkParams.source} onChange={e=>setBenchmarkParams({...benchmarkParams, source: e.target.value})} className="w-full p-2 border rounded text-sm">
                 <option value="">Select source...</option>
                 {nodes.map(n => <option key={n.id} value={n.id}>{n.name || n.id}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-xs font-medium text-slate-500 mb-1">Target Node ID</label>
               <select value={benchmarkParams.target} onChange={e=>setBenchmarkParams({...benchmarkParams, target: e.target.value})} className="w-full p-2 border rounded text-sm">
                 <option value="">Select target...</option>
                 {nodes.map(n => <option key={n.id} value={n.id}>{n.name || n.id}</option>)}
               </select>
            </div>
          </div>
          
          <button 
            onClick={handleBenchmark}
            disabled={isRunning}
            className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            {isRunning ? 'Running...' : <><Play className="h-4 w-4"/> Run Comparison</>}
          </button>

          {benchmarkResult && (
            <div className="space-y-8 flex-1">
              {/* Table Comparison */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-900 uppercase">
                    <tr>
                      <th className="px-4 py-3 border-b">Algorithm</th>
                      <th className="px-4 py-3 border-b">Nodes Explored</th>
                      <th className="px-4 py-3 border-b">Distance</th>
                      <th className="px-4 py-3 border-b">Cost</th>
                      <th className="px-4 py-3 border-b">Time (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['astar', 'dijkstra'].map((alg) => {
                      const res = benchmarkResult[alg];
                      if (!res) return null;
                      return (
                        <tr key={alg} className="border-b last:border-b-0">
                          <td className="px-4 py-3 font-medium capitalize text-slate-900">{alg}</td>
                          <td className="px-4 py-3">{res.nodes_explored}</td>
                          <td className="px-4 py-3">{res.distance.toFixed(0)}m</td>
                          <td className="px-4 py-3">{res.cost.toFixed(1)}</td>
                          <td className="px-4 py-3 font-mono">{res.execution_time_ms.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bar Charts */}
              <div className="space-y-6">
                <h3 className="font-semibold text-slate-800">Nodes Explored Visualization</h3>
                {['astar', 'dijkstra'].map(alg => {
                  const res = benchmarkResult[alg];
                  if (!res) return null;
                  const maxNodes = Math.max(...['astar', 'dijkstra'].map(a => benchmarkResult[a]?.nodes_explored || 0));
                  const nodePercent = (res.nodes_explored / maxNodes) * 100;
                  
                  return (
                    <div key={alg} className="space-y-1">
                      <div className="text-xs text-slate-500 flex justify-between uppercase">
                        <span>{alg}</span>
                        <span>{res.nodes_explored}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full ${alg === 'astar' ? 'bg-primary' : 'bg-slate-500'}`} style={{ width: `${nodePercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reroute Before/After */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 mt-8">
                <h3 className="font-bold text-indigo-900 mb-2">Before/After Dynamic Rerouting</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  When edge weights change (e.g., traffic jam reported), algorithms recalculate using updated heuristics.
                  This demo compares the base route vs route with severe traffic on the primary path.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded shadow-sm border border-indigo-100">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Base Route</h4>
                    <p className="text-xs text-slate-600">Uses original edge costs. Fastest path chosen naturally.</p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm border border-indigo-100">
                    <h4 className="font-bold text-slate-800 text-sm mb-2">Reroute (Traffic +200%)</h4>
                    <p className="text-xs text-slate-600">Avoids congested edges. Path may be physically longer but takes less time.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
          
          <div className="mt-8 space-y-6">
            <h2 className="text-xl font-bold border-b pb-2">Representation Comparison</h2>
            <p className="text-sm text-slate-500">Runs Dijkstra on both Adjacency List and Adjacency Matrix representations of the campus graph to compare real weighted routing performance.</p>
            <button onClick={async () => { try { setRepResult(await api.runRepresentationBenchmark({ source: benchmarkParams.source, target: benchmarkParams.target })); } catch(e) { console.error(e); }}} className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mb-6">
              <Play className="h-4 w-4"/> Compare Adj List vs Matrix
            </button>
            {repResult && (
              <div className="text-sm bg-slate-50 p-4 rounded border space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-sm mb-1">Adjacency List</h4>
                    <p>Time: <span className="font-mono">{repResult.adjacency_list?.time_ms?.toFixed(3) ?? 'N/A'}</span> ms</p>
                    <p>Nodes explored: {repResult.adjacency_list?.nodes_explored ?? 'N/A'}</p>
                    <p>Cost: {repResult.adjacency_list?.cost?.toFixed(1) ?? 'N/A'}</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-bold text-sm mb-1">Adjacency Matrix</h4>
                    <p>Time: <span className="font-mono">{repResult.adjacency_matrix?.time_ms?.toFixed(3) ?? 'N/A'}</span> ms</p>
                    <p>Nodes explored: {repResult.adjacency_matrix?.nodes_explored ?? 'N/A'}</p>
                    <p>Cost: {repResult.adjacency_matrix?.cost?.toFixed(1) ?? 'N/A'}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Graph density: {repResult.density?.toFixed(4) ?? 'N/A'} | Faster: <strong>{repResult.faster_repr ?? 'N/A'}</strong></p>
                <p className="text-xs text-slate-400">Note: Very small graphs can produce noisy millisecond results. Multiple iterations would give more stable measurements.</p>
              </div>
            )}

            <h2 className="text-xl font-bold border-b pb-2">Scale Test</h2>
            <p className="text-sm text-slate-500">Generates synthetic random graphs of increasing sizes and measures A* routing performance on each.</p>
            <button onClick={async () => { try { setScaleResult(await api.runScaleBenchmark()); } catch(e) { console.error(e); }}} className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mb-6">
              <Play className="h-4 w-4"/> Run Scale Test
            </button>
            {scaleResult && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50 text-slate-900 uppercase">
                    <tr>
                      <th className="px-4 py-3 border-b">Nodes</th>
                      <th className="px-4 py-3 border-b">Edges</th>
                      <th className="px-4 py-3 border-b">A* Time (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(scaleResult).map(([key, val]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="px-4 py-3">{val.nodes}</td>
                        <td className="px-4 py-3">{val.edges}</td>
                        <td className="px-4 py-3 font-mono">{val.astar_ms?.toFixed(2) ?? 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-xs text-slate-400 mt-2">Synthetic random graphs with ~3 edges per node. Timing includes heuristic computation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
