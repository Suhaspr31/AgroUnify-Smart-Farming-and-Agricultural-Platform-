const logger = require('../../core/logger');

class UserEngagementService {
  constructor() {
    this.churnThreshold = 30; // days without activity
    this.engagementWeights = {
      login: 1,
      purchase: 5,
      review: 3,
      search: 0.5,
      view: 0.1
    };
  }

  // User segmentation using clustering (simplified K-means)
  async segmentUsers(users) {
    try {
      if (!users || users.length === 0) return { segments: [], centroids: [] };

      // Extract features for each user
      const userFeatures = users.map(user => this.extractUserFeatures(user));

      // Simple K-means clustering (k=3: low, medium, high engagement)
      const k = 3;
      const { clusters, centroids } = this.performKMeans(userFeatures, k);

      // Assign segment labels
      const segments = clusters.map((cluster, index) => ({
        segmentId: index + 1,
        segmentName: this.getSegmentName(index),
        users: cluster,
        centroid: centroids[index],
        size: cluster.length
      }));

      return { segments, centroids };
    } catch (error) {
      logger.error('Error segmenting users:', error);
      return { segments: [], centroids: [] };
    }
  }

  // Churn prediction using logistic regression (simplified)
  async predictChurn(user) {
    try {
      const features = this.extractChurnFeatures(user);
      const churnProbability = this.calculateChurnProbability(features);

      const isAtRisk = churnProbability > 0.7;
      const riskLevel = this.getChurnRiskLevel(churnProbability);

      return {
        userId: user._id,
        churnProbability,
        isAtRisk,
        riskLevel,
        features,
        recommendations: this.generateChurnRecommendations(user, churnProbability)
      };
    } catch (error) {
      logger.error('Error predicting churn:', error);
      return { userId: user._id, churnProbability: 0, isAtRisk: false };
    }
  }

  // Personalized offers based on user behavior
  async generatePersonalizedOffers(user, userHistory) {
    try {
      const preferences = this.analyzeUserPreferences(userHistory);
      const engagement = this.calculateEngagementScore(user, userHistory);

      const offers = [];

      // Category-based offers
      if (preferences.favoriteCategories.length > 0) {
        offers.push({
          type: 'category_discount',
          category: preferences.favoriteCategories[0],
          discount: engagement > 0.7 ? 15 : 10,
          reason: 'Based on your purchase history'
        });
      }

      // Seasonal offers
      const seasonalOffer = this.generateSeasonalOffer(user, preferences);
      if (seasonalOffer) offers.push(seasonalOffer);

      // Loyalty offers
      if (engagement > 0.8) {
        offers.push({
          type: 'loyalty_bonus',
          bonus: 'Free delivery on next order',
          reason: 'Thank you for being a valued customer'
        });
      }

      // Re-engagement offers for low engagement users
      if (engagement < 0.3) {
        offers.push({
          type: 'reengagement',
          discount: 20,
          reason: 'We missed you! Come back with this special offer'
        });
      }

      return offers;
    } catch (error) {
      logger.error('Error generating personalized offers:', error);
      return [];
    }
  }

  // Push notification targeting
  async generatePushNotifications(userSegments) {
    try {
      const notifications = [];

      userSegments.forEach(segment => {
        const segmentNotifications = this.generateSegmentNotifications(segment);
        notifications.push(...segmentNotifications);
      });

      return notifications;
    } catch (error) {
      logger.error('Error generating push notifications:', error);
      return [];
    }
  }

  // SMS campaign optimization
  async optimizeSMSCampaign(userData, campaignType) {
    try {
      const segments = await this.segmentUsers(userData);
      const campaignConfig = this.getCampaignConfig(campaignType);

      const optimizedCampaign = {
        campaignType,
        segments: segments.segments.map(segment => ({
          segmentId: segment.segmentId,
          segmentName: segment.segmentName,
          userCount: segment.size,
          message: this.customizeMessage(campaignConfig.message, segment),
          sendTime: this.optimizeSendTime(segment),
          expectedConversion: this.predictConversionRate(segment, campaignType)
        })),
        totalUsers: userData.length,
        estimatedCost: this.calculateSMSCost(segments.segments),
        expectedRevenue: this.predictCampaignRevenue(segments.segments, campaignType)
      };

      return optimizedCampaign;
    } catch (error) {
      logger.error('Error optimizing SMS campaign:', error);
      return null;
    }
  }

  // Basket analysis for cross-selling (simplified Apriori)
  async analyzeBasketPatterns(orders) {
    try {
      if (!orders || orders.length === 0) return { rules: [], patterns: [] };

      // Extract itemsets from orders
      const itemsets = orders.map(order =>
        order.items.map(item => item.product.toString())
      );

      // Generate frequent itemsets (simplified)
      const frequentItemsets = this.generateFrequentItemsets(itemsets, 0.01); // 1% support

      // Generate association rules
      const rules = this.generateAssociationRules(frequentItemsets, 0.1); // 10% confidence

      return {
        rules: rules.slice(0, 20), // Top 20 rules
        patterns: frequentItemsets,
        totalOrders: orders.length,
        averageBasketSize: itemsets.reduce((sum, set) => sum + set.length, 0) / itemsets.length
      };
    } catch (error) {
      logger.error('Error analyzing basket patterns:', error);
      return { rules: [], patterns: [] };
    }
  }

  // Helper methods
  extractUserFeatures(user) {
    // Simplified feature extraction
    return {
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      lastActivity: user.lastActivity ? new Date(user.lastActivity).getTime() : 0,
      accountAge: user.createdAt ? Date.now() - new Date(user.createdAt).getTime() : 0,
      engagementScore: user.engagementScore || 0
    };
  }

  performKMeans(data, k, maxIterations = 100) {
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(data[Math.floor(Math.random() * data.length)]);
    }

    let clusters = [];
    let hasConverged = false;
    let iterations = 0;

    while (!hasConverged && iterations < maxIterations) {
      // Assign points to clusters
      clusters = this.assignToClusters(data, centroids);

      // Calculate new centroids
      const newCentroids = this.calculateCentroids(clusters);

      // Check convergence
      hasConverged = this.centroidsConverged(centroids, newCentroids);
      centroids = newCentroids;
      iterations++;
    }

    return { clusters, centroids };
  }

  assignToClusters(data, centroids) {
    const clusters = centroids.map(() => []);

    data.forEach(point => {
      let minDistance = Infinity;
      let closestCentroid = 0;

      centroids.forEach((centroid, index) => {
        const distance = this.euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });

      clusters[closestCentroid].push(point);
    });

    return clusters;
  }

  calculateCentroids(clusters) {
    return clusters.map(cluster => {
      if (cluster.length === 0) return null;

      const centroid = {};
      const keys = Object.keys(cluster[0]);

      keys.forEach(key => {
        centroid[key] = cluster.reduce((sum, point) => sum + point[key], 0) / cluster.length;
      });

      return centroid;
    });
  }

  centroidsConverged(oldCentroids, newCentroids) {
    const threshold = 0.001;

    for (let i = 0; i < oldCentroids.length; i++) {
      if (!oldCentroids[i] || !newCentroids[i]) return false;

      const distance = this.euclideanDistance(oldCentroids[i], newCentroids[i]);
      if (distance > threshold) return false;
    }

    return true;
  }

  euclideanDistance(point1, point2) {
    const keys = Object.keys(point1);
    let sum = 0;

    keys.forEach(key => {
      sum += Math.pow(point1[key] - point2[key], 2);
    });

    return Math.sqrt(sum);
  }

  getSegmentName(index) {
    const names = ['Low Engagement', 'Medium Engagement', 'High Engagement'];
    return names[index] || `Segment ${index + 1}`;
  }

  extractChurnFeatures(user) {
    const now = Date.now();
    const lastActivity = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
    const daysSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);

    return {
      daysSinceLastActivity,
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      accountAge: user.createdAt ? (now - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24) : 0,
      engagementScore: user.engagementScore || 0,
      hasRecentPurchase: daysSinceLastActivity < 7
    };
  }

  calculateChurnProbability(features) {
    // Simplified logistic regression coefficients
    const coefficients = {
      daysSinceLastActivity: 0.1,
      totalOrders: -0.05,
      totalSpent: -0.001,
      accountAge: -0.01,
      engagementScore: -0.5,
      hasRecentPurchase: -1.0
    };

    const intercept = -2.0;

    let logit = intercept;
    Object.keys(coefficients).forEach(feature => {
      logit += coefficients[feature] * features[feature];
    });

    // Sigmoid function
    return 1 / (1 + Math.exp(-logit));
  }

  getChurnRiskLevel(probability) {
    if (probability > 0.8) return 'critical';
    if (probability > 0.6) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  }

  generateChurnRecommendations(user, probability) {
    const recommendations = [];

    if (probability > 0.8) {
      recommendations.push('Send immediate re-engagement email with 25% discount');
      recommendations.push('Call customer for personalized assistance');
    } else if (probability > 0.6) {
      recommendations.push('Send targeted email with 15% discount');
      recommendations.push('Include user in special promotion campaign');
    } else if (probability > 0.4) {
      recommendations.push('Send newsletter with farming tips and product recommendations');
    }

    return recommendations;
  }

  analyzeUserPreferences(history) {
    const categories = {};
    const totalSpent = history.reduce((sum, item) => sum + item.amount, 0);

    history.forEach(item => {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + item.amount;
      }
    });

    const favoriteCategories = Object.keys(categories)
      .sort((a, b) => categories[b] - categories[a]);

    return {
      favoriteCategories,
      totalSpent,
      categoryPreferences: categories
    };
  }

  calculateEngagementScore(user, history) {
    let score = 0;
    const maxScore = 100;

    // Recency score (30%)
    const lastActivity = user.lastActivity ? new Date(user.lastActivity).getTime() : 0;
    const daysSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 30 - daysSinceLastActivity);

    // Frequency score (25%)
    const orderFrequency = user.totalOrders || 0;
    const frequencyScore = Math.min(25, orderFrequency * 2);

    // Monetary score (25%)
    const monetaryValue = user.totalSpent || 0;
    const monetaryScore = Math.min(25, monetaryValue / 100); // 1 point per 100 rupees

    // Activity diversity score (20%)
    const uniqueActivities = new Set(history.map(h => h.type)).size;
    const diversityScore = Math.min(20, uniqueActivities * 5);

    score = recencyScore + frequencyScore + monetaryScore + diversityScore;

    return Math.min(maxScore, score) / maxScore; // Normalize to 0-1
  }

  generateSeasonalOffer(user, preferences) {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

    // Define seasonal offers based on crop cycles
    const seasonalOffers = {
      'kharif': ['june', 'july', 'august', 'september', 'october'],
      'rabi': ['november', 'december', 'january', 'february', 'march'],
      'summer': ['march', 'april', 'may', 'june']
    };

    for (const [season, months] of Object.entries(seasonalOffers)) {
      if (months.includes(currentMonth)) {
        return {
          type: 'seasonal_offer',
          season,
          discount: 12,
          reason: `Special ${season} season offer for farmers`
        };
      }
    }

    return null;
  }

  generateSegmentNotifications(segment) {
    const notifications = [];

    switch (segment.segmentName) {
      case 'High Engagement':
        notifications.push({
          segmentId: segment.segmentId,
          title: 'Exclusive Offer for Our Best Customers',
          message: 'Thank you for your continued support! Enjoy 20% off on your next purchase.',
          priority: 'high'
        });
        break;

      case 'Medium Engagement':
        notifications.push({
          segmentId: segment.segmentId,
          title: 'Don\'t Miss Out!',
          message: 'Limited time offer: 15% discount on premium seeds.',
          priority: 'medium'
        });
        break;

      case 'Low Engagement':
        notifications.push({
          segmentId: segment.segmentId,
          title: 'Welcome Back!',
          message: 'We missed you! Get 25% off on your next order.',
          priority: 'high'
        });
        break;
    }

    return notifications;
  }

  getCampaignConfig(campaignType) {
    const configs = {
      'seasonal_promotion': {
        message: 'Special {{season}} season offers on agricultural inputs!'
      },
      'reengagement': {
        message: 'We miss you! Come back and save {{discount}}% on your next purchase.'
      },
      'new_products': {
        message: 'Check out our latest {{category}} products with exclusive discounts!'
      }
    };

    return configs[campaignType] || { message: 'Special offer just for you!' };
  }

  customizeMessage(template, segment) {
    // Simple template replacement
    return template
      .replace('{{season}}', 'kharif')
      .replace('{{discount}}', segment.segmentName === 'Low Engagement' ? '25' : '15')
      .replace('{{category}}', 'seeds');
  }

  optimizeSendTime(segment) {
    // Optimize send time based on segment
    const timePreferences = {
      'High Engagement': '10:00',
      'Medium Engagement': '14:00',
      'Low Engagement': '18:00'
    };

    return timePreferences[segment.segmentName] || '12:00';
  }

  predictConversionRate(segment, campaignType) {
    // Simplified conversion prediction
    const baseRates = {
      'seasonal_promotion': 0.05,
      'reengagement': 0.08,
      'new_products': 0.03
    };

    const baseRate = baseRates[campaignType] || 0.04;
    const segmentMultiplier = {
      'High Engagement': 1.5,
      'Medium Engagement': 1.0,
      'Low Engagement': 0.7
    };

    return baseRate * segmentMultiplier[segment.segmentName];
  }

  calculateSMSCost(segments) {
    const costPerSMS = 0.3; // INR
    const totalUsers = segments.reduce((sum, segment) => sum + segment.size, 0);
    return totalUsers * costPerSMS;
  }

  predictCampaignRevenue(segments, campaignType) {
    let totalRevenue = 0;

    segments.forEach(segment => {
      const conversionRate = this.predictConversionRate(segment, campaignType);
      const averageOrderValue = this.getAverageOrderValue(segment);
      const segmentRevenue = segment.size * conversionRate * averageOrderValue;
      totalRevenue += segmentRevenue;
    });

    return totalRevenue;
  }

  getAverageOrderValue(segment) {
    // Simplified AOV based on segment
    const aovs = {
      'High Engagement': 2500,
      'Medium Engagement': 1800,
      'Low Engagement': 1200
    };

    return aovs[segment.segmentName] || 1500;
  }

  generateFrequentItemsets(itemsets, minSupport) {
    const itemCounts = {};
    const totalTransactions = itemsets.length;

    // Count individual items
    itemsets.forEach(transaction => {
      transaction.forEach(item => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });
    });

    // Filter by minimum support
    const frequentItems = Object.keys(itemCounts)
      .filter(item => itemCounts[item] / totalTransactions >= minSupport)
      .map(item => ({ items: [item], support: itemCounts[item] / totalTransactions }));

    return frequentItems;
  }

  generateAssociationRules(frequentItemsets, minConfidence) {
    const rules = [];

    frequentItemsets.forEach(itemset => {
      if (itemset.items.length > 1) {
        // Generate all possible rules from this itemset
        const subsets = this.getAllSubsets(itemset.items);

        subsets.forEach(antecedent => {
          if (antecedent.length > 0 && antecedent.length < itemset.items.length) {
            const consequent = itemset.items.filter(item => !antecedent.includes(item));
            const confidence = itemset.support / this.getSupport(antecedent, frequentItemsets);

            if (confidence >= minConfidence) {
              rules.push({
                antecedent,
                consequent,
                confidence,
                support: itemset.support,
                lift: confidence / this.getSupport(consequent, frequentItemsets)
              });
            }
          }
        });
      }
    });

    return rules.sort((a, b) => b.confidence - a.confidence);
  }

  getAllSubsets(array) {
    const subsets = [[]];

    for (const item of array) {
      const newSubsets = subsets.map(subset => [...subset, item]);
      subsets.push(...newSubsets);
    }

    return subsets;
  }

  getSupport(itemset, frequentItemsets) {
    const found = frequentItemsets.find(itemsetObj =>
      itemsetObj.items.length === itemset.length &&
      itemsetObj.items.every(item => itemset.includes(item))
    );

    return found ? found.support : 0;
  }
}

module.exports = new UserEngagementService();