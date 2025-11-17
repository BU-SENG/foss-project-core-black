/**
 * Dijkstra's algorithm for finding the shortest path between two buildings
 * Returns both path and distance information
 */

export class PathfindingGraph {
  constructor(buildings) {
    this.buildings = buildings;
    this.adjacencyList = this.buildAdjacencyList();
  }

  /**
   * Build adjacency list with distances between all buildings
   * Uses Haversine formula to calculate real distances
   */
  buildAdjacencyList() {
    const adjacencyList = {};

    for (let i = 0; i < this.buildings.length; i++) {
      const building = this.buildings[i];
      adjacencyList[building.id] = [];

      for (let j = 0; j < this.buildings.length; j++) {
        if (i !== j) {
          const otherBuilding = this.buildings[j];
          const distance = this.haversineDistance(
            building.coordinates,
            otherBuilding.coordinates
          );
          adjacencyList[building.id].push({
            id: otherBuilding.id,
            distance,
            coordinates: otherBuilding.coordinates
          });
        }
      }
    }

    return adjacencyList;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  haversineDistance(coord1, coord2) {
    const R = 6371000; // Earth's radius in meters
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Dijkstra's algorithm to find shortest path
   */
  findShortestPath(startId, endId) {
    const distances = {};
    const visited = new Set();
    const previous = {};
    const allNodeIds = this.buildings.map((b) => b.id);

    // Initialize distances
    allNodeIds.forEach((id) => {
      distances[id] = Infinity;
      previous[id] = null;
    });
    distances[startId] = 0;

    while (visited.size < allNodeIds.length) {
      // Find unvisited node with minimum distance
      let minNode = null;
      let minDist = Infinity;

      for (const id of allNodeIds) {
        if (!visited.has(id) && distances[id] < minDist) {
          minNode = id;
          minDist = distances[id];
        }
      }

      if (minNode === null || distances[minNode] === Infinity) break;

      visited.add(minNode);

      // Update distances to neighbors
      for (const neighbor of this.adjacencyList[minNode]) {
        const newDist = distances[minNode] + neighbor.distance;
        if (newDist < distances[neighbor.id]) {
          distances[neighbor.id] = newDist;
          previous[neighbor.id] = minNode;
        }
      }
    }

    // Reconstruct path
    const path = [];
    let currentId = endId;

    while (currentId !== null) {
      const building = this.buildings.find((b) => b.id === currentId);
      path.unshift(building);
      currentId = previous[currentId];
    }

    return {
      path,
      distance: distances[endId],
      time: this.estimateWalkingTime(distances[endId]),
      found: path.length > 0 && path[0].id === startId
    };
  }

  /**
   * Estimate walking time (assuming 1.4 m/s average walking speed)
   */
  estimateWalkingTime(distance) {
    const walkingSpeed = 1.4; // meters per second
    const seconds = Math.round(distance / walkingSpeed);
    const minutes = Math.round(seconds / 60);

    return {
      seconds,
      minutes,
      formatted: `${minutes} min`
    };
  }

  /**
   * Get building by name (case-insensitive)
   */
  getBuildingByName(name) {
    return this.buildings.find(
      (b) => b.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Search buildings by keyword
   */
  searchBuildings(query) {
    const lowerQuery = query.toLowerCase();
    return this.buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(lowerQuery) ||
        b.department.toLowerCase().includes(lowerQuery) ||
        b.description.toLowerCase().includes(lowerQuery)
    );
  }
}

export default PathfindingGraph;
