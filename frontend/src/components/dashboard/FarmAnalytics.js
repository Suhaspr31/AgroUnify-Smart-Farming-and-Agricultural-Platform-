import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import './FarmAnalytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FarmAnalytics = ({ farmId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6m');

  useEffect(() => {
    fetchAnalytics();
  }, [farmId, selectedPeriod]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Simulated API call with mock data
    setTimeout(() => {
      setAnalyticsData({
        summary: {
          totalRevenue: 450000,
          revenueChange: 12.5,
          totalYield: 45,
          yieldChange: 8.3,
          activeFields: 8,
          fieldsChange: 2,
          avgProfit: 52000,
          profitChange: 15.2
        },
        revenueData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [
            {
              label: 'Revenue',
              data: [35000, 38000, 42000, 40000, 45000, 48000, 52000, 50000, 55000, 58000, 60000, 62000],
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        yieldData: {
          labels: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize'],
          datasets: [
            {
              label: 'Yield (tons)',
              data: [12, 15, 8, 18, 10],
              backgroundColor: [
                'rgba(46, 204, 113, 0.8)',
                'rgba(52, 152, 219, 0.8)',
                'rgba(243, 156, 18, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(231, 76, 60, 0.8)'
              ],
              borderColor: [
                '#2ecc71',
                '#3498db',
                '#f39c12',
                '#9b59b6',
                '#e74c3c'
              ],
              borderWidth: 2
            }
          ]
        },
        cropDistribution: {
          labels: ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize'],
          datasets: [
            {
              label: 'Area Distribution',
              data: [25, 30, 15, 20, 10],
              backgroundColor: [
                'rgba(46, 204, 113, 0.8)',
                'rgba(52, 152, 219, 0.8)',
                'rgba(243, 156, 18, 0.8)',
                'rgba(155, 89, 182, 0.8)',
                'rgba(231, 76, 60, 0.8)'
              ],
              borderColor: [
                '#2ecc71',
                '#3498db',
                '#f39c12',
                '#9b59b6',
                '#e74c3c'
              ],
              borderWidth: 2
            }
          ]
        },
        expenseData: {
          labels: ['Seeds', 'Fertilizers', 'Pesticides', 'Labor', 'Equipment', 'Other'],
          datasets: [
            {
              label: 'Expenses (₹)',
              data: [45000, 65000, 28000, 120000, 85000, 35000],
              backgroundColor: 'rgba(231, 76, 60, 0.6)',
              borderColor: '#e74c3c',
              borderWidth: 2
            }
          ]
        },
        monthlyProfit: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Profit',
              data: [28000, 32000, 35000, 30000, 38000, 42000],
              borderColor: '#2ecc71',
              backgroundColor: 'rgba(46, 204, 113, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Expenses',
              data: [22000, 24000, 25000, 26000, 27000, 28000],
              borderColor: '#e74c3c',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        },
        topPerformingCrops: [
          {
            name: 'Rice',
            revenue: 180000,
            profit: 65000,
            profitMargin: 36.1,
            trend: 'up'
          },
          {
            name: 'Wheat',
            revenue: 145000,
            profit: 52000,
            profitMargin: 35.9,
            trend: 'up'
          },
          {
            name: 'Sugarcane',
            revenue: 125000,
            profit: 42000,
            profitMargin: 33.6,
            trend: 'down'
          }
        ],
        insights: [
          {
            type: 'positive',
            title: 'Revenue Growth',
            message: 'Your revenue has increased by 12.5% compared to last period'
          },
          {
            type: 'warning',
            title: 'High Expenses',
            message: 'Labor costs are 15% higher than average. Consider optimization.'
          },
          {
            type: 'info',
            title: 'Peak Season',
            message: 'Next 2 months are ideal for harvesting wheat and rice'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  const getTrendIcon = (change) => {
    if (change > 0) {
      return <FiTrendingUp className="trend-icon positive" />;
    } else if (change < 0) {
      return <FiTrendingDown className="trend-icon negative" />;
    }
    return <FiActivity className="trend-icon neutral" />;
  };

  const getTrendClass = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + (value / 1000) + 'k';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + ' tons';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="farm-analytics loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="farm-analytics error">
        <p>Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="farm-analytics">
      {/* Header with Period Selector */}
      <div className="analytics-header">
        <h2>Farm Analytics</h2>
        <div className="period-selector">
          <button
            className={selectedPeriod === '1m' ? 'active' : ''}
            onClick={() => setSelectedPeriod('1m')}
          >
            1 Month
          </button>
          <button
            className={selectedPeriod === '3m' ? 'active' : ''}
            onClick={() => setSelectedPeriod('3m')}
          >
            3 Months
          </button>
          <button
            className={selectedPeriod === '6m' ? 'active' : ''}
            onClick={() => setSelectedPeriod('6m')}
          >
            6 Months
          </button>
          <button
            className={selectedPeriod === '1y' ? 'active' : ''}
            onClick={() => setSelectedPeriod('1y')}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon revenue">
            <FiDollarSign />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Revenue</span>
            <h3 className="summary-value">₹{analyticsData.summary.totalRevenue.toLocaleString()}</h3>
            <div className={`summary-change ${getTrendClass(analyticsData.summary.revenueChange)}`}>
              {getTrendIcon(analyticsData.summary.revenueChange)}
              <span>{analyticsData.summary.revenueChange > 0 ? '+' : ''}{analyticsData.summary.revenueChange}%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon yield">
            <FiActivity />
          </div>
          <div className="summary-content">
            <span className="summary-label">Total Yield</span>
            <h3 className="summary-value">{analyticsData.summary.totalYield} tons</h3>
            <div className={`summary-change ${getTrendClass(analyticsData.summary.yieldChange)}`}>
              {getTrendIcon(analyticsData.summary.yieldChange)}
              <span>{analyticsData.summary.yieldChange > 0 ? '+' : ''}{analyticsData.summary.yieldChange}%</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon fields">
            <FiTrendingUp />
          </div>
          <div className="summary-content">
            <span className="summary-label">Active Fields</span>
            <h3 className="summary-value">{analyticsData.summary.activeFields}</h3>
            <div className={`summary-change ${getTrendClass(analyticsData.summary.fieldsChange)}`}>
              {getTrendIcon(analyticsData.summary.fieldsChange)}
              <span>{analyticsData.summary.fieldsChange > 0 ? '+' : ''}{analyticsData.summary.fieldsChange}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon profit">
            <FiDollarSign />
          </div>
          <div className="summary-content">
            <span className="summary-label">Avg Monthly Profit</span>
            <h3 className="summary-value">₹{analyticsData.summary.avgProfit.toLocaleString()}</h3>
            <div className={`summary-change ${getTrendClass(analyticsData.summary.profitChange)}`}>
              {getTrendIcon(analyticsData.summary.profitChange)}
              <span>{analyticsData.summary.profitChange > 0 ? '+' : ''}{analyticsData.summary.profitChange}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts">
        {/* Revenue Chart */}
        <div className="chart-container large">
          <div className="chart-header">
            <h3>Revenue Trend</h3>
            <span className="chart-subtitle">Monthly revenue over time</span>
          </div>
          <div className="chart-body">
            <Line data={analyticsData.revenueData} options={lineChartOptions} />
          </div>
        </div>

        {/* Yield by Crop */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Yield by Crop</h3>
            <span className="chart-subtitle">Total yield comparison</span>
          </div>
          <div className="chart-body">
            <Bar data={analyticsData.yieldData} options={barChartOptions} />
          </div>
        </div>

        {/* Crop Distribution */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Crop Distribution</h3>
            <span className="chart-subtitle">Area allocation by crop</span>
          </div>
          <div className="chart-body">
            <Doughnut data={analyticsData.cropDistribution} options={doughnutOptions} />
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Expenses Breakdown</h3>
            <span className="chart-subtitle">Cost distribution</span>
          </div>
          <div className="chart-body">
            <Bar data={analyticsData.expenseData} options={barChartOptions} />
          </div>
        </div>

        {/* Profit vs Expenses */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Profit vs Expenses</h3>
            <span className="chart-subtitle">6-month comparison</span>
          </div>
          <div className="chart-body">
            <Line data={analyticsData.monthlyProfit} options={lineChartOptions} />
          </div>
        </div>
      </div>

      {/* Top Performing Crops */}
      <div className="top-crops-section">
        <h3>Top Performing Crops</h3>
        <div className="top-crops-grid">
          {analyticsData.topPerformingCrops.map((crop, index) => (
            <div key={index} className="top-crop-card">
              <div className="crop-rank">{index + 1}</div>
              <div className="crop-details">
                <h4>{crop.name}</h4>
                <div className="crop-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Revenue</span>
                    <span className="metric-value">₹{crop.revenue.toLocaleString()}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Profit</span>
                    <span className="metric-value">₹{crop.profit.toLocaleString()}</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Margin</span>
                    <span className="metric-value">{crop.profitMargin}%</span>
                  </div>
                </div>
              </div>
              <div className={`crop-trend ${crop.trend}`}>
                {crop.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>Insights & Recommendations</h3>
        <div className="insights-list">
          {analyticsData.insights.map((insight, index) => (
            <div key={index} className={`insight-card ${insight.type}`}>
              <div className="insight-icon">
                {insight.type === 'positive' && <FiTrendingUp />}
                {insight.type === 'warning' && <FiActivity />}
                {insight.type === 'info' && <FiDollarSign />}
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FarmAnalytics;
