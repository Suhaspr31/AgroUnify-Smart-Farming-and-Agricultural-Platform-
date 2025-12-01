const logger = require('../../core/logger');

class DeliveryService {
  constructor() {
    this.vehicleCapacity = 1000; // kg
    this.maxRouteTime = 8; // hours
    this.averageSpeed = 40; // km/h
  }

  // Traveling Salesman Problem heuristic (Nearest Neighbor)
  async calculateTSPRoute(deliveryPoints, startPoint = null) {
    try {
      if (!deliveryPoints || deliveryPoints.length === 0) {
        return { route: [], totalDistance: 0, totalTime: 0 };
      }

      const points = startPoint ? [startPoint, ...deliveryPoints] : [...deliveryPoints];
      const route = [];
      const unvisited = new Set(points.map((_, index) => index));

      // Start from first point (or warehouse)
      let currentIndex = 0;
      route.push(points[currentIndex]);
      unvisited.delete(currentIndex);

      let totalDistance = 0;

      while (unvisited.size > 0) {
        let nearestIndex = null;
        let minDistance = Infinity;

        // Find nearest unvisited point
        for (const index of unvisited) {
          const distance = this.calculateDistance(points[currentIndex], points[index]);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = index;
          }
        }

        if (nearestIndex !== null) {
          route.push(points[nearestIndex]);
          totalDistance += minDistance;
          unvisited.delete(nearestIndex);
          currentIndex = nearestIndex;
        } else {
          break; // No more points to visit
        }
      }

      const totalTime = this.calculateTravelTime(totalDistance);

      return {
        route,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalTime: Math.round(totalTime * 100) / 100,
        estimatedCost: this.calculateDeliveryCost(totalDistance, route.length)
      };
    } catch (error) {
      logger.error('Error calculating TSP route:', error);
      return { route: deliveryPoints, totalDistance: 0, totalTime: 0 };
    }
  }

  // Vehicle Routing Problem solver (simplified)
  async optimizeVehicleRoutes(orders, warehouseLocation, vehicleCapacity = this.vehicleCapacity) {
    try {
      if (!orders || orders.length === 0) {
        return { routes: [], totalDistance: 0, totalVehicles: 0 };
      }

      // Group orders by region for initial clustering
      const regionalGroups = this.groupOrdersByRegion(orders);

      const routes = [];
      let totalDistance = 0;

      for (const region of Object.values(regionalGroups)) {
        // Split region orders into vehicle loads
        const regionRoutes = await this.splitIntoVehicleLoads(region, vehicleCapacity);

        for (const route of regionRoutes) {
          const tspResult = await this.calculateTSPRoute(route.points, warehouseLocation);
          routes.push({
            vehicleId: `vehicle_${routes.length + 1}`,
            points: tspResult.route,
            orders: route.orders,
            totalWeight: route.totalWeight,
            ...tspResult
          });
          totalDistance += tspResult.totalDistance;
        }
      }

      return {
        routes,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalVehicles: routes.length,
        totalOrders: orders.length
      };
    } catch (error) {
      logger.error('Error optimizing vehicle routes:', error);
      return { routes: [], totalDistance: 0, totalVehicles: 0 };
    }
  }

  // Genetic Algorithm for route optimization (simplified)
  async geneticAlgorithmOptimization(deliveryPoints, generations = 50, populationSize = 20) {
    try {
      if (!deliveryPoints || deliveryPoints.length < 3) {
        return await this.calculateTSPRoute(deliveryPoints);
      }

      let population = this.initializePopulation(deliveryPoints, populationSize);
      let bestRoute = null;
      let bestFitness = Infinity;

      for (let gen = 0; gen < generations; gen++) {
        // Evaluate fitness
        const fitnessScores = population.map(route => this.calculateRouteFitness(route));

        // Find best route in current generation
        const bestIndex = fitnessScores.indexOf(Math.min(...fitnessScores));
        if (fitnessScores[bestIndex] < bestFitness) {
          bestFitness = fitnessScores[bestIndex];
          bestRoute = [...population[bestIndex]];
        }

        // Create new population
        const newPopulation = [];

        // Elitism - keep best route
        newPopulation.push([...population[bestIndex]]);

        // Generate offspring
        while (newPopulation.length < populationSize) {
          const parent1 = this.tournamentSelection(population, fitnessScores);
          const parent2 = this.tournamentSelection(population, fitnessScores);

          let offspring = this.crossover(parent1, parent2);
          offspring = this.mutate(offspring);

          newPopulation.push(offspring);
        }

        population = newPopulation;
      }

      const totalDistance = this.calculateTotalDistance(bestRoute);
      const totalTime = this.calculateTravelTime(totalDistance);

      return {
        route: bestRoute,
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalTime: Math.round(totalTime * 100) / 100,
        estimatedCost: this.calculateDeliveryCost(totalDistance, bestRoute.length),
        generations: generations
      };
    } catch (error) {
      logger.error('Error in genetic algorithm optimization:', error);
      return await this.calculateTSPRoute(deliveryPoints);
    }
  }

  // Simulated Annealing for route optimization
  async simulatedAnnealingOptimization(deliveryPoints, maxIterations = 1000, initialTemperature = 100) {
    try {
      if (!deliveryPoints || deliveryPoints.length < 3) {
        return await this.calculateTSPRoute(deliveryPoints);
      }

      let currentRoute = this.shuffleArray([...deliveryPoints]);
      let currentDistance = this.calculateTotalDistance(currentRoute);
      let bestRoute = [...currentRoute];
      let bestDistance = currentDistance;

      let temperature = initialTemperature;

      for (let i = 0; i < maxIterations; i++) {
        // Generate neighbor solution
        const neighborRoute = this.generateNeighbor(currentRoute);
        const neighborDistance = this.calculateTotalDistance(neighborRoute);

        // Accept better solution
        if (neighborDistance < currentDistance) {
          currentRoute = [...neighborRoute];
          currentDistance = neighborDistance;

          if (neighborDistance < bestDistance) {
            bestRoute = [...neighborRoute];
            bestDistance = neighborDistance;
          }
        } else {
          // Accept worse solution with probability
          const acceptanceProbability = Math.exp((currentDistance - neighborDistance) / temperature);
          if (Math.random() < acceptanceProbability) {
            currentRoute = [...neighborRoute];
            currentDistance = neighborDistance;
          }
        }

        // Cool down
        temperature *= 0.995;
      }

      const totalTime = this.calculateTravelTime(bestDistance);

      return {
        route: bestRoute,
        totalDistance: Math.round(bestDistance * 100) / 100,
        totalTime: Math.round(totalTime * 100) / 100,
        estimatedCost: this.calculateDeliveryCost(bestDistance, bestRoute.length),
        iterations: maxIterations
      };
    } catch (error) {
      logger.error('Error in simulated annealing optimization:', error);
      return await this.calculateTSPRoute(deliveryPoints);
    }
  }

  // Warehouse allocation optimization using K-means clustering
  async optimizeWarehouseAllocation(deliveryPoints, warehouseCandidates, k = 3) {
    try {
      if (!deliveryPoints || deliveryPoints.length === 0 || !warehouseCandidates || warehouseCandidates.length === 0) {
        return { clusters: [], centroids: [], totalCost: 0 };
      }

      // Initialize centroids randomly from warehouse candidates
      let centroids = this.selectRandomCentroids(warehouseCandidates, k);

      let clusters = [];
      let hasConverged = false;
      let iterations = 0;
      const maxIterations = 100;

      while (!hasConverged && iterations < maxIterations) {
        // Assign points to nearest centroid
        clusters = this.assignPointsToClusters(deliveryPoints, centroids);

        // Calculate new centroids
        const newCentroids = this.calculateCentroids(clusters);

        // Check convergence
        hasConverged = this.hasConverged(centroids, newCentroids);
        centroids = newCentroids;
        iterations++;
      }

      // Calculate total transportation cost
      const totalCost = this.calculateTotalTransportationCost(clusters, centroids);

      return {
        clusters,
        centroids,
        totalCost: Math.round(totalCost * 100) / 100,
        iterations,
        warehouses: centroids
      };
    } catch (error) {
      logger.error('Error optimizing warehouse allocation:', error);
      return { clusters: [], centroids: [], totalCost: 0 };
    }
  }

  // Zone optimization using K-means
  async optimizeDeliveryZones(deliveryPoints, numberOfZones = 5) {
    try {
      if (!deliveryPoints || deliveryPoints.length === 0) {
        return { zones: [], centroids: [], averageZoneSize: 0 };
      }

      // Initialize centroids randomly
      let centroids = this.selectRandomCentroids(deliveryPoints, numberOfZones);

      let zones = [];
      let hasConverged = false;
      let iterations = 0;
      const maxIterations = 50;

      while (!hasConverged && iterations < maxIterations) {
        // Assign points to nearest centroid
        zones = this.assignPointsToClusters(deliveryPoints, centroids);

        // Calculate new centroids
        const newCentroids = this.calculateCentroids(zones);

        // Check convergence
        hasConverged = this.hasConverged(centroids, newCentroids);
        centroids = newCentroids;
        iterations++;
      }

      const averageZoneSize = deliveryPoints.length / numberOfZones;

      return {
        zones,
        centroids,
        averageZoneSize: Math.round(averageZoneSize * 100) / 100,
        iterations,
        zoneEfficiency: this.calculateZoneEfficiency(zones)
      };
    } catch (error) {
      logger.error('Error optimizing delivery zones:', error);
      return { zones: [], centroids: [], averageZoneSize: 0 };
    }
  }

  // Helper methods for TSP and VRP
  calculateDistance(point1, point2) {
    // Haversine formula for geographical distance
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLon = this.toRadians(point2.lng - point1.lng);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  calculateTravelTime(distance) {
    return distance / this.averageSpeed; // hours
  }

  calculateDeliveryCost(distance, stops) {
    const baseCost = 50; // Base delivery cost
    const perKmCost = 8; // Cost per kilometer
    const perStopCost = 10; // Cost per delivery stop

    return baseCost + (distance * perKmCost) + (stops * perStopCost);
  }

  groupOrdersByRegion(orders) {
    const regions = {};

    orders.forEach(order => {
      const region = this.determineRegion(order.deliveryAddress);
      if (!regions[region]) {
        regions[region] = [];
      }
      regions[region].push(order);
    });

    return regions;
  }

  determineRegion(address) {
    // Simplified region determination based on pincode or location
    // In real implementation, use geocoding service
    if (address.pincode) {
      const pincode = address.pincode.toString();
      if (pincode.startsWith('11')) return 'delhi';
      if (pincode.startsWith('12')) return 'haryana';
      if (pincode.startsWith('13')) return 'punjab';
      // Add more region logic
    }
    return 'default';
  }

  splitIntoVehicleLoads(orders, capacity) {
    const routes = [];
    let currentRoute = { points: [], orders: [], totalWeight: 0 };

    orders.forEach(order => {
      const orderWeight = this.calculateOrderWeight(order);

      if (currentRoute.totalWeight + orderWeight <= capacity) {
        currentRoute.points.push(order.deliveryAddress);
        currentRoute.orders.push(order);
        currentRoute.totalWeight += orderWeight;
      } else {
        if (currentRoute.points.length > 0) {
          routes.push(currentRoute);
        }
        currentRoute = {
          points: [order.deliveryAddress],
          orders: [order],
          totalWeight: orderWeight
        };
      }
    });

    if (currentRoute.points.length > 0) {
      routes.push(currentRoute);
    }

    return routes;
  }

  calculateOrderWeight(order) {
    // Calculate total weight of order items
    return order.items.reduce((total, item) => total + (item.weight || 1), 0);
  }

  // Genetic Algorithm helper methods
  initializePopulation(points, size) {
    const population = [];
    for (let i = 0; i < size; i++) {
      population.push(this.shuffleArray([...points]));
    }
    return population;
  }

  calculateRouteFitness(route) {
    return this.calculateTotalDistance(route);
  }

  tournamentSelection(population, fitnessScores, tournamentSize = 3) {
    let best = null;
    let bestFitness = Infinity;

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      if (fitnessScores[randomIndex] < bestFitness) {
        bestFitness = fitnessScores[randomIndex];
        best = population[randomIndex];
      }
    }

    return best;
  }

  crossover(parent1, parent2) {
    const length = parent1.length;
    const start = Math.floor(Math.random() * length);
    const end = start + Math.floor(Math.random() * (length - start));

    const child = new Array(length).fill(null);
    const used = new Set();

    // Copy segment from parent1
    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
      used.add(JSON.stringify(parent1[i]));
    }

    // Fill remaining positions from parent2
    let childIndex = 0;
    for (const point of parent2) {
      if (!used.has(JSON.stringify(point))) {
        while (child[childIndex] !== null) {
          childIndex++;
        }
        if (childIndex < length) {
          child[childIndex] = point;
          childIndex++;
        }
      }
    }

    return child;
  }

  mutate(route, mutationRate = 0.01) {
    const mutatedRoute = [...route];

    for (let i = 0; i < mutatedRoute.length; i++) {
      if (Math.random() < mutationRate) {
        const j = Math.floor(Math.random() * mutatedRoute.length);
        [mutatedRoute[i], mutatedRoute[j]] = [mutatedRoute[j], mutatedRoute[i]];
      }
    }

    return mutatedRoute;
  }

  generateNeighbor(route) {
    const neighbor = [...route];
    const i = Math.floor(Math.random() * route.length);
    const j = Math.floor(Math.random() * route.length);

    [neighbor[i], neighbor[j]] = [neighbor[j], neighbor[i]];
    return neighbor;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  calculateTotalDistance(route) {
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += this.calculateDistance(route[i], route[i + 1]);
    }
    return totalDistance;
  }

  // K-means helper methods
  selectRandomCentroids(points, k) {
    const centroids = [];
    const shuffled = this.shuffleArray([...points]);
    for (let i = 0; i < k; i++) {
      centroids.push(shuffled[i]);
    }
    return centroids;
  }

  assignPointsToClusters(points, centroids) {
    const clusters = centroids.map(() => []);

    points.forEach(point => {
      let minDistance = Infinity;
      let closestCentroidIndex = 0;

      centroids.forEach((centroid, index) => {
        const distance = this.calculateDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroidIndex = index;
        }
      });

      clusters[closestCentroidIndex].push(point);
    });

    return clusters;
  }

  calculateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) return null;

      const avgLat = cluster.reduce((sum, point) => sum + point.lat, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, point) => sum + point.lng, 0) / cluster.length;

      return { lat: avgLat, lng: avgLng };
    });
  }

  hasConverged(oldCentroids, newCentroids) {
    const threshold = 0.001; // Small distance threshold

    for (let i = 0; i < oldCentroids.length; i++) {
      if (!oldCentroids[i] || !newCentroids[i]) return false;

      const distance = this.calculateDistance(oldCentroids[i], newCentroids[i]);
      if (distance > threshold) return false;
    }

    return true;
  }

  calculateTotalTransportationCost(clusters, centroids) {
    let totalCost = 0;

    clusters.forEach((cluster, index) => {
      const centroid = centroids[index];
      if (centroid) {
        cluster.forEach(point => {
          totalCost += this.calculateDistance(point, centroid);
        });
      }
    });

    return totalCost;
  }

  calculateZoneEfficiency(zones) {
    const zoneSizes = zones.map(zone => zone.length);
    const avgSize = zoneSizes.reduce((sum, size) => sum + size, 0) / zoneSizes.length;
    const variance = zoneSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / zoneSizes.length;

    // Efficiency is inversely related to variance (lower variance = higher efficiency)
    return Math.max(0, 100 - (variance / avgSize) * 100);
  }
}

module.exports = new DeliveryService();