import aiosqlite
import os

class Database:
    """Async database operations using aiosqlite."""
    def __init__(self, db_path: str = None):
        self.db_path = db_path or os.getenv("DB_PATH", "campus.db")
        
    async def get_connection(self):
        return await aiosqlite.connect(self.db_path)
        
    async def init_db(self):
        async with await self.get_connection() as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS places (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    type TEXT,
                    category TEXT,
                    description TEXT,
                    lat REAL,
                    lng REAL,
                    hours TEXT,
                    status TEXT,
                    nearby_parking TEXT
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS roads (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    from_node TEXT,
                    to_node TEXT,
                    distance REAL,
                    base_time REAL,
                    type TEXT,
                    bidirectional BOOLEAN,
                    speed_limit INTEGER
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS incidents (
                    id TEXT PRIMARY KEY,
                    type TEXT,
                    from_node TEXT,
                    to_node TEXT,
                    severity TEXT,
                    description TEXT,
                    status TEXT,
                    created_at TEXT
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS traffic_states (
                    from_node TEXT,
                    to_node TEXT,
                    level TEXT,
                    updated_at TEXT,
                    PRIMARY KEY (from_node, to_node)
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS parking_zones (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    lat REAL,
                    lng REAL,
                    total_spaces INTEGER,
                    occupied INTEGER,
                    ev_spaces INTEGER,
                    type TEXT,
                    nearby_node TEXT
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS route_history (
                    id TEXT PRIMARY KEY,
                    from_node TEXT,
                    to_node TEXT,
                    algorithm TEXT,
                    cost REAL,
                    distance REAL,
                    execution_time_ms REAL,
                    created_at TEXT
                )
            ''')
            
            await db.execute('''
                CREATE TABLE IF NOT EXISTS benchmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    algorithm TEXT,
                    graph_type TEXT,
                    nodes INTEGER,
                    edges INTEGER,
                    execution_time_ms REAL,
                    created_at TEXT
                )
            ''')
            
            await db.commit()
