import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiSearch, FiExternalLink, FiClock, FiUser } from 'react-icons/fi';
import newsService from '../../services/newsService';
import './NewsFeed.css';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('agriculture');
  const [savedDates, setSavedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchNews = useCallback(async () => {
    setLoading(true);
    let result;

    // If a specific date is selected, fetch history for that date (backend mode only)
    if (selectedDate) {
      const h = await newsService.getHistory(selectedDate);
      if (h.success) {
        setNews(h.data.data || h.data || []);
        setLoading(false);
        return;
      }
    }

    if (activeTab === 'agriculture') {
      result = await newsService.getAgricultureNews({ pageSize: 20 });
    } else if (activeTab === 'headlines') {
      result = await newsService.getTopHeadlines({ pageSize: 20 });
    }

    if (result.success) {
      setNews(result.data);
    } else {
      // Fallback to mock data
      setNews([
        {
          title: 'New Government Initiative for Farmers',
          description: 'The government has announced a new scheme to support small farmers with subsidized seeds and fertilizers.',
          url: 'https://www.agrinews.com/government-initiative-farmers',
          urlToImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GQXJNRVIgTkVXUzwvdGV4dD4KPC9zdmc+',
          publishedAt: new Date().toISOString(),
          source: { name: 'Agriculture Today' },
          author: 'Ministry of Agriculture'
        },
        {
          title: 'Climate Change Impact on Crop Yields',
          description: 'Experts discuss how changing weather patterns are affecting agricultural productivity across India.',
          url: 'https://www.farmjournal.com/climate-change-crop-yields',
          urlToImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DTElNQU1RSBOTldTPC90ZXh0Pgo8L3N2Zz4=',
          publishedAt: new Date().toISOString(),
          source: { name: 'Farm Journal' },
          author: 'Dr. Rajesh Kumar'
        }
      ]);
    }
    setLoading(false);
  }, [activeTab, selectedDate]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // fetch available saved dates from backend (if available)
  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
    if (!API_BASE) return;

    (async () => {
      const resp = await newsService.getHistory();
      if (resp.success) {
        setSavedDates(resp.data.dates || []);
      }
    })();
  }, []);

  // Server-Sent Events for important alerts (only when frontend is configured to use backend)
  const eventSourceRef = useRef(null);
  useEffect(() => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
    if (!API_BASE) return;
    if (!window.EventSource) return;

    try {
      const es = new EventSource(`${API_BASE}/news/alerts/stream`);
      eventSourceRef.current = es;

      es.addEventListener('important', (e) => {
        try {
          const payload = JSON.parse(e.data);
          const article = payload.article;
          // Show browser notification
          if (window.Notification && Notification.permission === 'granted') {
            const title = article.title || 'Important agriculture news';
            const body = article.description || (article.source && article.source.name) || '';
            const n = new Notification(title, { body });
            n.onclick = () => {
              window.open(article.url, '_blank');
            };
          } else if (window.Notification && Notification.permission !== 'denied') {
            Notification.requestPermission().then((perm) => {
              if (perm === 'granted') {
                const title = article.title || 'Important agriculture news';
                const body = article.description || (article.source && article.source.name) || '';
                const n = new Notification(title, { body });
                n.onclick = () => {
                  window.open(article.url, '_blank');
                };
              }
            });
          }
        } catch (err) {
          // ignore parse errors
        }
      });

      es.onerror = (err) => {
        // reconnect logic is handled by EventSource automatically in browsers
        console.warn('SSE connection error', err);
      };

      return () => {
        try { es.close(); } catch (e) {}
      };
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const result = await newsService.searchNews(searchQuery, { pageSize: 20 });
    if (result.success) {
      setNews(result.data);
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="news-feed-page">
        <div className="container">
          <div className="loading">Loading latest news...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="news-feed-page">
      <div className="container">
        <div className="page-header">
          <h1>📰 Agriculture News</h1>
          <p>Stay updated with the latest farming news and agricultural developments</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <FiSearch />
            <input
              type="text"
              placeholder="Search for farming news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
          </div>
        </form>

        {/* Tab Navigation */}
        <div className="news-tabs">
          <button
            className={`tab-btn ${activeTab === 'agriculture' ? 'active' : ''}`}
            onClick={() => setActiveTab('agriculture')}
          >
            🌾 Agriculture News
          </button>
          <button
            className={`tab-btn ${activeTab === 'headlines' ? 'active' : ''}`}
            onClick={() => setActiveTab('headlines')}
          >
            📰 Top Headlines
          </button>
        </div>

        {/* History selector (backend only) */}
        {savedDates.length > 0 && (
          <div className="history-select">
            <label>View saved snapshots: </label>
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="">Today / Live</option>
              {savedDates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {selectedDate && (
              <button className="clear-btn" onClick={() => setSelectedDate('')}>Clear</button>
            )}
          </div>
        )}

        {/* News Grid */}
        <div className="news-grid">
          {news.map((article, index) => (
            <div key={index} className="news-card">
              {article.urlToImage && article.urlToImage.startsWith('http') && (
                <div className="news-image">
                  <img src={article.urlToImage} alt={article.title} onError={(e) => {
                    e.target.src = 'https://placehold.co/300x200?text=No+Image';
                  }} />
                </div>
              )}
              <div className="news-content">
                <h3 className="news-title">{article.title}</h3>
                <p className="news-description">{article.description}</p>

                <div className="news-meta">
                  <span className="news-source">
                    <FiUser />
                    {article.author || article.source.name}
                  </span>
                  <span className="news-date">
                    <FiClock />
                    {formatDate(article.publishedAt)}
                  </span>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-more-btn"
                >
                  Read Full Article
                  <FiExternalLink />
                </a>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="no-news">
            <p>No news articles found. Try adjusting your search or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsFeed;