import json
import random

# Existing places and roads
places_file = 'data/campus/places.json'
roads_file = 'data/campus/roads.json'

with open(places_file, 'r') as f:
    places = json.load(f)

with open(roads_file, 'r') as f:
    roads = json.load(f)

place_ids = [p['id'] for p in places]

new_roads = []
start_id = 84

connections = [
    # Library approaches
    ("central_library", "north_junction", "Library North Path", 300, 120, "path"),
    ("central_library", "east_junction", "Library East Link", 400, 160, "road"),
    ("central_library", "science_block", "Library Sci Walk", 150, 60, "path"),
    ("library_junction", "administration", "Admin Lib Link", 250, 100, "road"),
    
    # Hostel connections
    ("boys_hostel_1", "north_gate", "BH1 Gate Link", 400, 150, "road"),
    ("girls_hostel_1", "north_gate", "GH1 Gate Link", 450, 170, "road"),
    ("boys_hostel_2", "sports_complex", "BH2 Sports Path", 300, 120, "path"),
    ("girls_hostel_2", "sports_complex", "GH2 Sports Path", 350, 140, "path"),
    ("hostel_junction", "engineering_junction", "Hostel Eng Link", 600, 200, "road"),
    ("hostel_junction", "central_junction", "Hostel Central Link", 550, 190, "road"),

    # Sports complex
    ("sports_complex", "west_gate", "Sports West Link", 500, 180, "road"),
    ("sports_complex", "west_junction", "Sports West Junc Link", 550, 200, "road"),
    ("gymnasium", "north_junction", "Gym North Path", 250, 100, "path"),
    ("swimming_pool", "hostel_junction", "Pool Hostel Link", 300, 120, "path"),

    # Medical center
    ("medical_center", "main_gate", "Med Main Gate Link", 250, 90, "road"),
    ("medical_center", "central_junction", "Med Central Link", 450, 160, "road"),
    ("medical_center", "east_junction", "Med East Link", 500, 180, "road"),
    ("campus_hospital", "main_gate", "Hosp Main Gate Link", 300, 110, "road"),

    # Main gate
    ("main_gate", "east_junction", "Main East Link", 600, 200, "road"),
    ("main_gate", "west_junction", "Main West Link", 600, 200, "road"),

    # Departments / building clusters
    ("cse_dept", "engineering_block", "CSE Eng Path", 80, 35, "path"),
    ("cse_dept", "science_block", "CSE Sci Path", 150, 60, "path"),
    ("classroom_block_a", "science_block", "Class A Sci Path", 200, 80, "path"),
    ("classroom_block_b", "engineering_block", "Class B Eng Path", 250, 100, "path"),
    ("classroom_block_c", "west_junction", "Class C West Link", 300, 120, "path"),
    ("auditorium", "administration", "Audi Admin Link", 350, 140, "road"),
    ("research_center", "engineering_block", "Res Eng Path", 200, 80, "path"),
    
    # Junctions cross-links
    ("north_junction", "west_junction", "North West Link", 700, 250, "road"),
    ("east_junction", "south_junction", "East South Link", 600, 200, "road"),
    ("west_junction", "library_junction", "West Lib Link", 400, 150, "road"),
    
    # Extra paths for internal connectivity
    ("faculty_housing", "east_junction", "Faculty East Link", 250, 90, "road"),
    ("faculty_housing", "guest_house", "Faculty Guest Path", 100, 40, "path"),
    ("guest_house", "gardens", "Guest Garden Path", 150, 60, "path"),
    ("gardens", "memorial_garden", "Garden Memorial Path", 200, 80, "path"),
    ("memorial_garden", "administration", "Memorial Admin Path", 150, 60, "path"),
    
    ("main_cafeteria", "auditorium", "Cafe Audi Path", 200, 80, "path"),
    ("main_cafeteria", "central_library", "Cafe Lib Path", 150, 60, "path"),
    ("coffee_house", "library_junction", "Coffee Lib Path", 100, 40, "path"),
    ("food_court", "south_junction", "Food South Path", 250, 100, "path"),
    
    ("north_canteen", "boys_hostel_1", "NCanteen BH1 Path", 100, 40, "path"),
    ("north_canteen", "girls_hostel_1", "NCanteen GH1 Path", 100, 40, "path"),
    
    ("general_store", "north_junction", "Store North Path", 200, 80, "path"),
    ("laundry", "girls_hostel_2", "Laundry GH2 Path", 150, 60, "path"),
    
    ("it_services", "cse_dept", "IT CSE Path", 100, 40, "path"),
    ("it_services", "central_library", "IT Lib Path", 250, 100, "path"),
    
    ("fire_station", "south_junction", "Fire South Link", 300, 110, "road"),
    ("police_post", "south_junction", "Police South Link", 250, 90, "road"),
    
    ("bus_stop_main", "south_junction", "Bus South Path", 150, 60, "path"),
    ("bus_stop_north", "hostel_junction", "Bus Hostel Path", 200, 80, "path"),
    
    ("ev_charging_1", "central_junction", "EV1 Central Path", 300, 120, "path"),
    ("ev_charging_2", "north_junction", "EV2 North Path", 250, 100, "path"),
    
    ("bicycle_stand", "central_junction", "Bike Central Path", 150, 60, "path"),
    ("auto_stand", "south_junction", "Auto South Path", 200, 80, "path"),
    
    ("clock_tower", "library_junction", "Clock Lib Path", 100, 40, "path"),
    ("fountain_square", "central_junction", "Fountain Central Path", 100, 40, "path"),
    
    ("innovation_hub", "science_block", "Innov Sci Path", 200, 80, "path"),
    ("startup_incubator", "research_center", "Incubator Res Path", 150, 60, "path"),
    
    ("walkway_north", "sports_complex", "Walk North Sports", 250, 100, "path"),
    ("walkway_south", "exam_hall", "Walk South Exam", 200, 80, "path"),
    
    ("internal_road_1", "classroom_block_a", "Int Road Class A", 150, 60, "internal_road"),
    ("internal_road_2", "east_gate", "Int Road East Gate", 200, 80, "internal_road"),
    
    ("pedestrian_crossing_1", "bus_stop_main", "Cross Bus Path", 100, 40, "crossing"),
    ("pedestrian_crossing_2", "main_cafeteria", "Cross Cafe Path", 100, 40, "crossing"),
    
    # some more paths
    ("lift_1", "classroom_block_b", "Lift1 ClassB Path", 80, 30, "path"),
    ("lift_2", "coffee_house", "Lift2 Coffee Path", 120, 50, "path"),
    ("tea_point", "science_block", "Tea Sci Path", 150, 60, "path"),
    ("registrar_office", "east_junction", "Reg East Path", 200, 80, "path"),
    ("placement_cell", "central_junction", "Place Central Path", 300, 120, "path")
]

# Let's ensure we reach ~150 total
current_len = len(roads)
needed = 150 - current_len

count = 0
for fro, to, name, dist, time, rtype in connections:
    if fro in place_ids and to in place_ids:
        new_road = {
            "id": f"road_{start_id}",
            "name": name,
            "from": fro,
            "to": to,
            "distance": dist,
            "base_time": time,
            "type": rtype,
            "bidirectional": True,
            "speed_limit": 30 if rtype == "road" else 10
        }
        if rtype == "internal_road":
            new_road["speed_limit"] = 15
        
        roads.append(new_road)
        start_id += 1
        count += 1
        
print(f"Added {count} roads. Total roads now: {len(roads)}")

with open(roads_file, 'w') as f:
    json.dump(roads, f, indent=2)

