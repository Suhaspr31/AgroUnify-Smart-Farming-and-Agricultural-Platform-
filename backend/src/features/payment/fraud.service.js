const logger = require('../../core/logger');

class FraudDetectionService {
  constructor() {
    this.anomalyThreshold = 2.5; // Standard deviations
    this.suspiciousPatterns = {
      highAmount: 50000, // INR
      rapidTransactions: 5, // transactions per minute
      unusualLocations: true,
      newDevice: true,
      timeWindow: 60000 // 1 minute in milliseconds
    };
  }

  // Isolation Forest for anomaly detection (simplified)
  async detectAnomalies(transactionData, historicalData) {
    try {
      if (!transactionData || !historicalData || historicalData.length === 0) {
        return { isAnomalous: false, score: 0, reasons: [] };
      }

      const features = this.extractFeatures(transactionData, historicalData);
      const anomalyScore = this.isolationForestScore(features, historicalData);

      const isAnomalous = anomalyScore > this.anomalyThreshold;
      const reasons = this.analyzeAnomalyReasons(transactionData, historicalData, features);

      return {
        isAnomalous,
        score: anomalyScore,
        reasons,
        confidence: this.calculateConfidence(anomalyScore)
      };
    } catch (error) {
      logger.error('Error detecting anomalies:', error);
      return { isAnomalous: false, score: 0, reasons: [] };
    }
  }

  // Autoencoder for anomaly detection (simplified simulation)
  async autoencoderAnomalyDetection(transactionData, historicalData) {
    try {
      const features = this.extractFeatures(transactionData, historicalData);
      const reconstructionError = this.calculateReconstructionError(features, historicalData);

      const threshold = this.calculateDynamicThreshold(historicalData);
      const isAnomalous = reconstructionError > threshold;

      return {
        isAnomalous,
        reconstructionError,
        threshold,
        confidence: Math.min(reconstructionError / threshold, 1)
      };
    } catch (error) {
      logger.error('Error in autoencoder anomaly detection:', error);
      return { isAnomalous: false, reconstructionError: 0, threshold: 0 };
    }
  }

  // Rule-based fraud detection
  async ruleBasedDetection(transactionData, userHistory = []) {
    try {
      const rules = [
        this.checkAmountAnomaly(transactionData, userHistory),
        this.checkFrequencyAnomaly(transactionData, userHistory),
        this.checkLocationAnomaly(transactionData, userHistory),
        this.checkDeviceAnomaly(transactionData, userHistory),
        this.checkTimeAnomaly(transactionData, userHistory),
        this.checkMerchantAnomaly(transactionData, userHistory)
      ];

      const triggeredRules = rules.filter(rule => rule.triggered);
      const riskScore = triggeredRules.reduce((sum, rule) => sum + rule.weight, 0);

      return {
        riskScore,
        triggeredRules,
        riskLevel: this.calculateRiskLevel(riskScore),
        recommendations: this.generateRecommendations(triggeredRules)
      };
    } catch (error) {
      logger.error('Error in rule-based detection:', error);
      return { riskScore: 0, triggeredRules: [], riskLevel: 'low' };
    }
  }

  // Combined fraud detection
  async comprehensiveFraudCheck(transactionData, userHistory = []) {
    try {
      // Run multiple detection methods
      const [anomalyResult, autoencoderResult, ruleResult] = await Promise.all([
        this.detectAnomalies(transactionData, userHistory),
        this.autoencoderAnomalyDetection(transactionData, userHistory),
        this.ruleBasedDetection(transactionData, userHistory)
      ]);

      // Combine results with weights
      const weights = {
        anomaly: 0.4,
        autoencoder: 0.3,
        rules: 0.3
      };

      const combinedScore = (
        anomalyResult.score * weights.anomaly +
        (autoencoderResult.isAnomalous ? 1 : 0) * weights.autoencoder +
        ruleResult.riskScore * weights.rules
      );

      const overallRisk = this.calculateOverallRisk(combinedScore, anomalyResult, autoencoderResult, ruleResult);

      return {
        overallRisk,
        scores: {
          anomaly: anomalyResult,
          autoencoder: autoencoderResult,
          rules: ruleResult
        },
        combinedScore,
        action: this.recommendAction(overallRisk),
        details: this.compileFraudDetails(anomalyResult, autoencoderResult, ruleResult)
      };
    } catch (error) {
      logger.error('Error in comprehensive fraud check:', error);
      return {
        overallRisk: 'unknown',
        scores: {},
        combinedScore: 0,
        action: 'allow',
        details: []
      };
    }
  }

  // Helper methods
  extractFeatures(transaction, historicalData) {
    const amount = transaction.amount;
    const historicalAmounts = historicalData.map(t => t.amount);

    return {
      amount: amount,
      amountZScore: this.calculateZScore(amount, historicalAmounts),
      amountPercentile: this.calculatePercentile(amount, historicalAmounts),
      timeSinceLastTransaction: this.calculateTimeSinceLast(transaction, historicalData),
      transactionFrequency: this.calculateFrequency(transaction, historicalData),
      locationChange: this.checkLocationChange(transaction, historicalData),
      deviceChange: this.checkDeviceChange(transaction, historicalData)
    };
  }

  calculateZScore(value, data) {
    if (data.length === 0) return 0;

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return stdDev > 0 ? (value - mean) / stdDev : 0;
  }

  calculatePercentile(value, data) {
    if (data.length === 0) return 0;

    const sortedData = [...data].sort((a, b) => a - b);
    const index = sortedData.findIndex(val => val >= value);
    return index / sortedData.length;
  }

  calculateTimeSinceLast(transaction, historicalData) {
    if (historicalData.length === 0) return Infinity;

    const sortedHistory = historicalData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const lastTransaction = sortedHistory[0];
    return new Date(transaction.timestamp) - new Date(lastTransaction.timestamp);
  }

  calculateFrequency(transaction, historicalData) {
    const oneHourAgo = new Date(transaction.timestamp);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentTransactions = historicalData.filter(t =>
      new Date(t.timestamp) >= oneHourAgo
    );

    return recentTransactions.length;
  }

  checkLocationChange(transaction, historicalData) {
    if (historicalData.length === 0) return false;

    const lastTransaction = historicalData[historicalData.length - 1];
    return transaction.location !== lastTransaction.location;
  }

  checkDeviceChange(transaction, historicalData) {
    if (historicalData.length === 0) return false;

    const lastTransaction = historicalData[historicalData.length - 1];
    return transaction.deviceId !== lastTransaction.deviceId;
  }

  isolationForestScore(features, historicalData) {
    // Simplified isolation forest scoring
    let score = 0;
    const weights = {
      amountZScore: 0.3,
      amountPercentile: 0.2,
      timeSinceLastTransaction: 0.2,
      transactionFrequency: 0.15,
      locationChange: 0.1,
      deviceChange: 0.05
    };

    Object.keys(weights).forEach(key => {
      if (Math.abs(features[key]) > 2) score += weights[key];
    });

    return score;
  }

  analyzeAnomalyReasons(transaction, historicalData, features) {
    const reasons = [];

    if (Math.abs(features.amountZScore) > 2) {
      reasons.push('Unusual transaction amount compared to historical data');
    }

    if (features.amountPercentile > 0.95) {
      reasons.push('Transaction amount in top 5% of historical transactions');
    }

    if (features.transactionFrequency > this.suspiciousPatterns.rapidTransactions) {
      reasons.push('High frequency of transactions in short time period');
    }

    if (features.locationChange) {
      reasons.push('Transaction from unusual location');
    }

    if (features.deviceChange) {
      reasons.push('Transaction from new or unrecognized device');
    }

    return reasons;
  }

  calculateConfidence(score) {
    return Math.min(score / this.anomalyThreshold, 1);
  }

  calculateReconstructionError(features, historicalData) {
    // Simplified reconstruction error calculation
    let error = 0;
    const featureKeys = Object.keys(features);

    historicalData.forEach(historical => {
      const historicalFeatures = this.extractFeatures(historical, historicalData);
      featureKeys.forEach(key => {
        error += Math.pow(features[key] - historicalFeatures[key], 2);
      });
    });

    return Math.sqrt(error / (historicalData.length * featureKeys.length));
  }

  calculateDynamicThreshold(historicalData) {
    if (historicalData.length === 0) return 0;

    const errors = [];
    for (let i = 0; i < historicalData.length; i++) {
      const testData = historicalData.slice(0, i).concat(historicalData.slice(i + 1));
      const features = this.extractFeatures(historicalData[i], testData);
      errors.push(this.calculateReconstructionError(features, testData));
    }

    const mean = errors.reduce((sum, err) => sum + err, 0) / errors.length;
    const variance = errors.reduce((sum, err) => sum + Math.pow(err - mean, 2), 0) / errors.length;
    const stdDev = Math.sqrt(variance);

    return mean + (2 * stdDev); // 2 standard deviations
  }

  // Rule-based detection methods
  checkAmountAnomaly(transaction, userHistory) {
    const avgAmount = userHistory.length > 0
      ? userHistory.reduce((sum, t) => sum + t.amount, 0) / userHistory.length
      : 0;

    const isHighAmount = transaction.amount > this.suspiciousPatterns.highAmount;
    const isUnusualAmount = transaction.amount > avgAmount * 3;

    return {
      name: 'amount_anomaly',
      triggered: isHighAmount || isUnusualAmount,
      weight: isHighAmount ? 0.8 : isUnusualAmount ? 0.6 : 0,
      description: isHighAmount ? 'High transaction amount' : 'Unusual amount for user'
    };
  }

  checkFrequencyAnomaly(transaction, userHistory) {
    const recentTransactions = userHistory.filter(t => {
      const timeDiff = new Date(transaction.timestamp) - new Date(t.timestamp);
      return timeDiff < this.suspiciousPatterns.timeWindow;
    });

    const triggered = recentTransactions.length >= this.suspiciousPatterns.rapidTransactions;

    return {
      name: 'frequency_anomaly',
      triggered,
      weight: triggered ? 0.7 : 0,
      description: 'High transaction frequency'
    };
  }

  checkLocationAnomaly(transaction, userHistory) {
    if (!this.suspiciousPatterns.unusualLocations || userHistory.length === 0) {
      return { name: 'location_anomaly', triggered: false, weight: 0, description: '' };
    }

    const usualLocations = [...new Set(userHistory.map(t => t.location))];
    const isUnusualLocation = !usualLocations.includes(transaction.location);

    return {
      name: 'location_anomaly',
      triggered: isUnusualLocation,
      weight: isUnusualLocation ? 0.5 : 0,
      description: 'Transaction from unusual location'
    };
  }

  checkDeviceAnomaly(transaction, userHistory) {
    if (!this.suspiciousPatterns.newDevice || userHistory.length === 0) {
      return { name: 'device_anomaly', triggered: false, weight: 0, description: '' };
    }

    const usualDevices = [...new Set(userHistory.map(t => t.deviceId))];
    const isNewDevice = !usualDevices.includes(transaction.deviceId);

    return {
      name: 'device_anomaly',
      triggered: isNewDevice,
      weight: isNewDevice ? 0.4 : 0,
      description: 'Transaction from new device'
    };
  }

  checkTimeAnomaly(transaction, userHistory) {
    const transactionHour = new Date(transaction.timestamp).getHours();
    const isUnusualHour = transactionHour < 6 || transactionHour > 22; // Outside 6 AM - 10 PM

    return {
      name: 'time_anomaly',
      triggered: isUnusualHour,
      weight: isUnusualHour ? 0.3 : 0,
      description: 'Transaction at unusual hour'
    };
  }

  checkMerchantAnomaly(transaction, userHistory) {
    // Check if transaction is with a new merchant type
    const historicalMerchantTypes = [...new Set(userHistory.map(t => t.merchantType))];
    const isNewMerchantType = !historicalMerchantTypes.includes(transaction.merchantType);

    return {
      name: 'merchant_anomaly',
      triggered: isNewMerchantType && userHistory.length > 5,
      weight: isNewMerchantType ? 0.2 : 0,
      description: 'Transaction with new merchant type'
    };
  }

  calculateRiskLevel(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  generateRecommendations(triggeredRules) {
    const recommendations = [];

    if (triggeredRules.some(rule => rule.name === 'amount_anomaly')) {
      recommendations.push('Verify transaction amount with customer');
    }

    if (triggeredRules.some(rule => rule.name === 'frequency_anomaly')) {
      recommendations.push('Implement rate limiting for user');
    }

    if (triggeredRules.some(rule => rule.name === 'location_anomaly')) {
      recommendations.push('Request additional verification for location change');
    }

    if (triggeredRules.some(rule => rule.name === 'device_anomaly')) {
      recommendations.push('Send device verification code');
    }

    return recommendations;
  }

  calculateOverallRisk(combinedScore, anomalyResult, autoencoderResult, ruleResult) {
    const riskFactors = [
      anomalyResult.isAnomalous,
      autoencoderResult.isAnomalous,
      ruleResult.riskLevel === 'high',
      ruleResult.riskLevel === 'medium'
    ];

    const riskCount = riskFactors.filter(Boolean).length;

    if (combinedScore > 0.8 || riskCount >= 3) return 'high';
    if (combinedScore > 0.5 || riskCount >= 2) return 'medium';
    if (combinedScore > 0.3 || riskCount >= 1) return 'low';
    return 'safe';
  }

  recommendAction(risk) {
    switch (risk) {
      case 'high':
        return 'block';
      case 'medium':
        return 'challenge';
      case 'low':
        return 'flag';
      default:
        return 'allow';
    }
  }

  compileFraudDetails(anomalyResult, autoencoderResult, ruleResult) {
    const details = [];

    if (anomalyResult.reasons.length > 0) {
      details.push(...anomalyResult.reasons);
    }

    if (autoencoderResult.isAnomalous) {
      details.push('Autoencoder detected anomalous pattern');
    }

    ruleResult.triggeredRules.forEach(rule => {
      details.push(rule.description);
    });

    return [...new Set(details)]; // Remove duplicates
  }
}

module.exports = new FraudDetectionService();