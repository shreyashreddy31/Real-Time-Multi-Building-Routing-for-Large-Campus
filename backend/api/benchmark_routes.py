from fastapi import APIRouter, Request
from backend.api.models import BenchmarkRequest

router = APIRouter()


@router.get("/performance")
async def get_performance(request: Request):
    """Get latest performance report."""
    br = request.app.state.benchmark_runner
    report = br.generate_report()
    return {"benchmarks": report}


@router.post("/benchmark/run")
async def run_benchmark(req: BenchmarkRequest, request: Request):
    """Run Dijkstra vs A* comparison on a specific source-target pair."""
    br = request.app.state.benchmark_runner
    return br.run_comparison(req.source, req.target)


@router.post("/benchmark/representation")
async def run_representation_benchmark(req: BenchmarkRequest, request: Request):
    """Compare adjacency list vs matrix on a specific source-target pair."""
    br = request.app.state.benchmark_runner
    return br.run_representation_comparison(req.source, req.target)


@router.post("/benchmark/scale")
async def run_scale_test(request: Request):
    """Run scaling test with increasing graph sizes."""
    br = request.app.state.benchmark_runner
    return br.run_scale_test([100, 500, 1000, 3000])
