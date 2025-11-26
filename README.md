# 🌾 AgroUnify - AI-Powered Agricultural Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)

A comprehensive AI-powered agricultural platform designed to empower farmers with intelligent crop disease diagnosis, real-time monitoring, market intelligence, and seamless marketplace connectivity.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Quick Start](#-quick-start)
- [📖 API Documentation](#-api-documentation)
- [🔧 Installation](#-installation)
- [📊 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 Features

### 🏥 AI Crop Doctor

- **Disease Diagnosis**: Upload crop images for instant AI-powered analysis using Google Gemini API and YOLOv8
- **Multi-Disease Detection**: Supports 20+ diseases across Tomato, Potato, and Pepper crops
- **Treatment Recommendations**: Chemical and organic treatment options with prevention strategies
- **PDF Reports**: Automated report generation with detailed analysis
- **Offline Capability**: Fallback model for offline analysis

### 📊 Real-Time Monitoring

- **IoT Integration**: Soil moisture, pH, temperature, and humidity tracking
- **Predictive Alerts**: Automated notifications for optimal farming conditions
- **Historical Data**: Comprehensive analytics and trend analysis

### 💰 Market Intelligence

- **Live Pricing**: Real-time commodity prices across multiple markets
- **Price Forecasting**: ML-based price prediction using historical data
- **Multi-Commodity Support**: Cereals, pulses, oilseeds, vegetables, and fruits

### 🛒 Digital Marketplace

- **B2B Platform**: Direct farmer-to-buyer marketplace
- **Product Catalog**: Comprehensive agricultural product listings
- **Order Management**: Complete order tracking and delivery system

### 🌍 Multi-Language Support

- **4 Languages**: English, Hindi, Kannada, Telugu
- **Cultural Adaptation**: Localized content and user interfaces

### 📱 Progressive Web App

- **Mobile-First**: Responsive design for all devices
- **Offline Support**: Service worker for offline functionality
- **Push Notifications**: Real-time alerts and updates

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React PWA)                   │
│  • User Dashboard • Crop Doctor • Marketplace • Analytics   │
└──────────────────────┬──────────────────────────────────────┘
                       │ (REST API)
┌──────────────────────▼──────────────────────────────────────┐
│                 BACKEND (Node.js/Express)                   │
│  ├─ Authentication & Authorization (JWT)                   │
│  ├─ Database Integration (MongoDB)                          │
│  ├─ File Upload & Caching (Redis)                           │
│  └─ External API Integration                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ (HTTP/gRPC)
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼──────────────┐    ┌────────▼──────────────┐
│   AI SERVICE         │    │   DATA LAYER          │
│  (Python/Flask)      │    ├─ MongoDB (Primary)    │
│  ├─ Google Gemini    │    ├─ Redis (Cache)        │
│  ├─ YOLOv8           │    │─ Elasticsearch        │
│  ├─ ML Models        │    │─  (Search)            │
│  └─ Analytics        │    │                       │
└──────────────────────┘    └───────────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: React.js 18+
- **Build Tool**: Vite.js
- **State Management**: Context API + Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Internationalization**: i18next
- **PWA**: Service Worker API
- **Styling**: CSS3 + CSS Modules

### Backend

- **Runtime**: Node.js 16+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 4.4+
- **Authentication**: JWT
- **File Upload**: Multer
- **Caching**: Redis
- **Search**: Elasticsearch

### AI/ML Service

- **Language**: Python 3.8+
- **Framework**: Flask/FastAPI
- **LLM**: Google Gemini API
- **Computer Vision**: YOLOv8, EfficientNet
- **ML Libraries**: TensorFlow, PyTorch, Scikit-learn
- **Data Processing**: Pandas, NumPy

### DevOps

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ & npm
- Python 3.8+
- MongoDB 4.4+
- Git
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Suhaspr31/AgroUnify-Smart-Farming-and-Agricultural-Platform-.git
   cd AgroUnify-Smart-Farming-and-Agricultural-Platform-
   ```

2. **Setup AI Service**

   ```bash
   cd ai
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   # Add your GEMINI_API_KEY to .env
   python crop_analyzer.py
   ```

3. **Setup Backend**

   ```bash
   cd ../backend
   npm install
   # Configure .env with database URL and API keys
   npm run seed
   npm start
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   # Configure .env with API URLs
   npm start
   ```

### Docker Deployment

```bash
docker-compose up --build
```

## 📖 API Documentation

### Core Endpoints

#### Crop Doctor

```http
POST /api/v1/crop-doctor/analyze
Content-Type: multipart/form-data

{
  image: File,
  language?: "en" | "hi" | "kn" | "te",
  cropType?: string,
  location?: string
}
```

#### Market Intelligence

```http
GET /api/v1/market/prices/{commodity}
GET /api/v1/market/forecast/{commodity}
```

#### Weather Integration

```http
GET /api/v1/weather/{location}
GET /api/v1/weather/forecast/{location}
```

### Authentication

```http
POST /api/v1/auth/login
POST /api/v1/auth/register
```

## 📊 Project Structure

```
AgroUnify/
├── frontend/              # React PWA Frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── i18n/          # Internationalization
│   └── public/            # Static assets
├── backend/               # Node.js/Express Backend
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── middleware/    # Custom middleware
│   │   └── config/        # Configuration files
│   └── routes/            # API routes
├── ai/                    # Python AI Service
│   ├── api/               # Flask API endpoints
│   ├── services/          # AI/ML services
│   ├── models/            # Trained models
│   └── data/              # Training datasets
├── database/              # Database migrations & seeds
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL=mongodb://localhost:27017/agrofy
JWT_SECRET=your_secret_key
PYTHON_SERVER_URL=http://localhost:7000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

#### AI Service (.env)

```env
GEMINI_API_KEY=your_google_gemini_api_key
FLASK_ENV=development
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint rules for JavaScript
- Use Black formatter for Python
- Write comprehensive unit tests
- Update documentation for new features
- Maintain code coverage above 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

- **Email**: support@agrofy.in
- **Documentation**: [Full API Docs](./api-docs/)
- **Issues**: [GitHub Issues](https://github.com/Suhaspr31/AgroUnify-Smart-Farming-and-Agricultural-Platform-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Suhaspr31/AgroUnify-Smart-Farming-and-Agricultural-Platform-/discussions)

## 🙏 Acknowledgments

- Google Gemini API for AI-powered analysis
- YOLOv8 for computer vision capabilities
- Open-source community for invaluable tools and libraries

---

**Last Updated**: November 26, 2025
**Version**: 2.0
