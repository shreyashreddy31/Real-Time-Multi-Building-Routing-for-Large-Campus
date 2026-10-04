# Meridian Smart Campus 🏫 🗺️ ⚡

## Intelligent Campus Navigation & Smart Routing System

**A Data Structures & Algorithms Based Smart Campus Navigation Platform**

---

## 🌟 Overview

**Meridian Smart Campus** is an intelligent campus navigation platform designed to help students and visitors efficiently navigate through a large campus.

The project applies **Data Structures and Algorithms** to represent the campus as a weighted graph and calculate efficient routes between different locations.

Instead of treating the campus as a collection of static pages, Meridian models it as a **dynamic network of buildings, pathways, and connections**, allowing routing algorithms to determine suitable paths based on distance and changing campus conditions.

The system combines **Graph Data Structures, Dijkstra's Algorithm, A* Search, real-time updates, and interactive maps** to provide an intelligent navigation experience.

---

## 🚀 Key Features

### 🗺️ Interactive Campus Map

Provides an interactive map of the campus where users can visualize buildings, pathways, and routes.

### 🧭 Intelligent Route Finding

Users can select a starting location and destination, and the system calculates an efficient route between them.

### 📊 Graph-Based Campus Model

The campus is represented as a **weighted graph**:

- 🏢 Buildings → Vertices / Nodes
- 🛣️ Pathways → Edges
- 📏 Distance → Edge Weights

This representation makes the campus suitable for graph-based algorithms.

### ⚡ Dijkstra's Algorithm

Uses **Dijkstra's Algorithm** to calculate the shortest path between campus locations based on weighted distances.

### 🚀 A* Pathfinding

Uses **A* Search** for efficient pathfinding by combining the actual path cost with a heuristic estimate of the remaining distance.

### 🚦 Dynamic Campus Conditions

The system is designed to incorporate changing campus conditions such as traffic, crowd levels, and pathway availability.

### 🔄 Real-Time Updates

WebSockets enable real-time communication between the backend and frontend for dynamic campus information.

---

## 🧠 Data Structures & Algorithms

The main objective of Meridian Smart Campus is to demonstrate the practical application of **Data Structures and Algorithms** in a real-world problem.

### 🌐 Graph

The campus is modeled using a **weighted graph**, where locations represent nodes and pathways represent weighted edges.

```text
        🏢 Library
          /     \
       120       80
        /         \
 🏢 Hostel ─── 100 ─── 🏢 Canteen
        \               /
         \     150     /
          🏢 Main Gate
