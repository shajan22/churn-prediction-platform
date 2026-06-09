# Customer Churn Prediction Platform

A full-stack machine learning application for predicting customer churn, providing actionable insights, and building customer feedback surveys.

## 🚀 Features

- **File Upload**: Support for CSV and Excel datasets
- **Data Preprocessing**: Automated data cleaning, encoding, and scaling
- **ML Predictions**: Multiple algorithms (XGBoost, Random Forest, Logistic Regression, SVM, Neural Network)
- **Interactive Dashboard**: Visual reports with charts and metrics
- **AI Recommendations**: Actionable insights to reduce churn
- **Survey Builder**: Create and analyze customer feedback surveys
- **Real-time Analytics**: Sentiment analysis and response tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Flask 3.0** - Python web framework
- **Pandas** - Data manipulation
- **Scikit-learn** - Machine learning
- **XGBoost** - Gradient boosting
- **NumPy** - Numerical computing

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **pip** (Python package installer)

## 🔧 Quick Setup

### Option 1: Automated Setup (Windows)

Run the setup script:
```bash
setup-all.bat
```

This will:
1. Create Python virtual environment
2. Install backend dependencies
3. Install frontend dependencies

### Option 2: Manual Setup

#### Backend Setup

```bash
cd server
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend Setup

```bash
cd client
npm install
```

## ▶️ Running the Application

### Option 1: Using Scripts (Windows)

**Terminal 1 - Backend:**
```bash
start-backend.bat
```

**Terminal 2 - Frontend:**
```bash
start-frontend.bat
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd server
venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/

## 📁 Project Structure

```
project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Flask backend
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── uploads/           # File storage
│   ├── app.py             # Main Flask app
│   ├── config.py          # Configuration
│   └── requirements.txt   # Python dependencies
│
├── img/                    # Application screenshots
├── setup-all.bat          # Full setup script
├── start-backend.bat      # Backend start script
└── start-frontend.bat     # Frontend start script
```

## 🔄 Application Workflow

1. **Upload** - Upload customer dataset (CSV/Excel)
2. **Preprocess** - Automated data cleaning and preparation
3. **Predict** - Train ML models and generate predictions
4. **Report** - View comprehensive dashboard and metrics
5. **Recommendations** - Get AI-powered retention strategies
6. **Survey** - Build custom customer feedback surveys
7. **Review** - Analyze survey responses with sentiment analysis

## 📊 ML Algorithms

The platform trains and compares 5 different algorithms:

1. **XGBoost** - Gradient Boosting (typically best performer)
2. **Random Forest** - Ensemble learning
3. **Logistic Regression** - Linear classification
4. **Support Vector Machine** - SVM classifier
5. **Neural Network** - Multi-layer perceptron

The system automatically selects the best performing model based on accuracy.

## 🔌 API Endpoints

### Upload
- `POST /api/upload` - Upload dataset

### Preprocessing
- `POST /api/preprocess` - Preprocess data
- `GET /api/preprocess/status` - Get status

### Prediction
- `POST /api/predict` - Generate predictions
- `GET /api/predict/models` - List available models

### Recommendations
- `POST /api/recommendations` - Get recommendations

### Survey
- `POST /api/survey/create` - Create survey
- `GET /api/survey/<id>` - Get survey
- `POST /api/survey/<id>/response` - Submit response
- `GET /api/survey/<id>/results` - Get results

### Health
- `GET /api/health` - Server health check

## 🎨 Frontend Pages

- **HomePage** - File upload interface
- **PreprocessingPage** - Data preprocessing status
- **PredictionPage** - ML model training and results
- **ReportPage** - Visual dashboard with charts
- **RecommendationsPage** - AI-powered insights
- **SurveyPage** - Survey builder interface
- **ReviewPage** - Survey analytics and sentiment analysis

## 🔐 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=10485760
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Backend Issues

**Import errors:**
```bash
cd server
venv\Scripts\activate
pip install -r requirements.txt
```

**Port already in use:**
- Change port in `app.py` (default: 5000)

### Frontend Issues

**Dependencies not installed:**
```bash
cd client
npm install
```

**CORS errors:**
- Ensure backend is running on port 5000
- Check CORS settings in `server/app.py`

## 📝 Development

### Backend Development
- Code is modular with separate routes, services, and utils
- Follow Flask best practices
- Add new routes in `routes/` directory
- Add new services in `services/` directory

### Frontend Development
- TypeScript for type safety
- Tailwind CSS for styling
- Add new pages in `src/pages/`
- Add new components in `src/components/`

## 🚀 Deployment

### Backend Deployment
- Use production WSGI server (gunicorn)
- Set environment variables properly
- Configure CORS for production domain

### Frontend Deployment
- Build: `npm run build`
- Deploy `dist/` folder to hosting service
- Update API URL in production

## 📄 License

This project is for educational and demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using React, Flask, and Machine Learning**
