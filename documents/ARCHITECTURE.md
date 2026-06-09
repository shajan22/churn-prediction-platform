# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                    http://localhost:5173                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP/HTTPS
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                         │
│  ┌────────────┬────────────┬────────────┬──────────────┐       │
│  │  HomePage  │ Preprocess │ Prediction │    Report    │       │
│  │            │    Page    │    Page    │     Page     │       │
│  └────────────┴────────────┴────────────┴──────────────┘       │
│  ┌────────────┬────────────┬────────────────────────────┐      │
│  │Recommend   │   Survey   │   Review   │  API Client   │      │
│  │   Page     │    Page    │   Page     │  (apiClient)  │      │
│  └────────────┴────────────┴────────────┴───────┬────────┘      │
└──────────────────────────────────────────────────┼──────────────┘
                                                   │
                                        REST API   │
                                        /api/*     │
┌──────────────────────────────────────────────────▼──────────────┐
│                  FLASK BACKEND (Python)                          │
│                  http://localhost:5000                           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes                            │   │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐     │   │
│  │  │  Upload  │Preprocess│Prediction│Recommendation│     │   │
│  │  │  Routes  │  Routes  │  Routes  │   Routes     │     │   │
│  │  └────┬─────┴────┬─────┴────┬─────┴──────┬───────┘     │   │
│  └───────┼──────────┼──────────┼────────────┼─────────────┘   │
│          │          │          │            │                   │
│  ┌───────▼──────────▼──────────▼────────────▼─────────────┐   │
│  │                    Services Layer                        │   │
│  │  ┌──────────────┬──────────────┬──────────────────┐    │   │
│  │  │Preprocessing │  Prediction  │  Recommendation  │    │   │
│  │  │   Service    │   Service    │     Service      │    │   │
│  │  └──────┬───────┴──────┬───────┴────────┬─────────┘    │   │
│  └─────────┼──────────────┼────────────────┼──────────────┘   │
│            │              │                │                    │
│  ┌─────────▼──────────────▼────────────────▼──────────────┐   │
│  │              Machine Learning Models                     │   │
│  │  XGBoost | Random Forest | SVM | Neural Net | LogReg   │   │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Data Storage                             │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐      │  │
│  │  │ Uploads  │ Sessions │Preprocessed│   Survey    │      │  │
│  │  │  Folder  │   Store  │    Data    │    Data     │      │  │
│  │  └──────────┴──────────┴──────────┴──────────────┘      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Upload CSV/Excel
     ▼
┌─────────────────┐
│   HomePage      │──────────┐
└────┬────────────┘          │
     │                       │ API: POST /upload
     │ 2. Continue           │
     ▼                       ▼
┌─────────────────┐    ┌──────────────┐
│PreprocessingPage│◄───│ Upload Route │
└────┬────────────┘    └──────┬───────┘
     │                        │
     │ API: POST /preprocess  │
     ▼                        ▼
┌──────────────┐      ┌────────────────────┐
│ Preprocessing│◄─────│Preprocessing Service│
│    Route     │      └────────┬───────────┘
└──────┬───────┘               │
       │                       │ Clean, Encode, Scale
       │ sessionId             ▼
       │               ┌───────────────┐
       └──────────────►│  Data Store   │
                       └───────┬───────┘
                               │
     ┌─────────────────────────┘
     │ 3. Run Predictions
     ▼
┌─────────────────┐    ┌──────────────┐
│ PredictionPage  │───►│Prediction RT │
└────┬────────────┘    └──────┬───────┘
     │                        │
     │                        ▼
     │               ┌────────────────┐
     │               │Prediction SVC  │
     │               └────────┬───────┘
     │                        │ Train Models
     │                        ▼
     │               ┌─────────────────────┐
     │               │ ML Models (5 types) │
     │               └────────┬────────────┘
     │                        │
     │ predictionResults      │ Best Model Results
     ▼                        ▼
┌─────────────────┐    ┌──────────────┐
│   ReportPage    │◄───┤Return Results│
└────┬────────────┘    └──────────────┘
     │
     │ 4. Get Recommendations
     ▼
┌─────────────────┐    ┌──────────────────┐
│Recommendations  │───►│Recommendation RT │
│     Page        │    └──────┬───────────┘
└────┬────────────┘           │
     │                        ▼
     │               ┌─────────────────────┐
     │               │Recommendation SVC   │
     │               └──────┬──────────────┘
     │                      │ Generate Insights
     │                      ▼
     │ recommendations ┌─────────────┐
     └────────────────►│Return Ideas │
                       └─────────────┘
     │
     │ 5. Build Survey
     ▼
┌─────────────────┐    ┌──────────────┐
│   SurveyPage    │───►│ Survey Route │
└────┬────────────┘    └──────┬───────┘
     │                        │
     │                        ▼
     │               ┌─────────────────┐
     │               │  Survey Service │
     │               └────────┬────────┘
     │ surveyUrl              │ Store Survey
     └───────────────────────►│
                              │
     │ 6. View Results        │
     ▼                        │
┌─────────────────┐           │
│   ReviewPage    │───────────┘
└─────────────────┘    Get Results & Analytics
```

## Component Structure

```
App.tsx
│
├── Navbar
│   ├── LoginModal (conditionally rendered)
│   └── User Info Display
│
├── ProgressStepper
│   └── 7 Step Indicators
│
└── Current Page (based on step)
    │
    ├── HomePage
    │   ├── File Upload Zone
    │   ├── Drag & Drop Handler
    │   └── File Info Display
    │
    ├── PreprocessingPage
    │   ├── Processing Steps List
    │   ├── Dataset Summary
    │   └── Data Preview Table
    │
    ├── PredictionPage
    │   ├── Training Progress
    │   ├── Key Metrics Cards
    │   ├── Model Comparison
    │   └── Confusion Matrix
    │
    ├── ReportPage
    │   ├── Executive Summary
    │   ├── Churn Distribution Chart
    │   ├── Model Performance Chart
    │   ├── Risk Segmentation
    │   └── Key Insights
    │
    ├── RecommendationsPage
    │   ├── Impact Summary
    │   ├── Recommendations List
    │   └── Implementation Order
    │
    ├── SurveyPage
    │   ├── Survey Details Form
    │   ├── Question Builder
    │   ├── Question Type Selector
    │   └── Survey URL Generator
    │
    └── ReviewPage
        ├── Overview Metrics
        ├── Rating Distribution
        ├── Response Analysis
        ├── Sentiment Analysis
        └── Action Items
```

## API Endpoint Structure

```
/api
│
├── /upload
│   └── POST - Upload dataset file
│
├── /preprocess
│   ├── POST - Preprocess uploaded data
│   └── GET /status - Check preprocessing status
│
├── /predict
│   ├── POST - Generate churn predictions
│   └── GET /models - Get available ML models
│
├── /recommendations
│   └── POST - Get AI recommendations
│
├── /survey
│   ├── POST /create - Create new survey
│   ├── GET /<id> - Get survey details
│   ├── POST /<id>/response - Submit response
│   └── GET /<id>/results - Get survey results
│
└── /health
    └── GET - Server health check
```

## Technology Stack

```
┌──────────────────────────────────────┐
│          FRONTEND STACK              │
├──────────────────────────────────────┤
│ React 18          │ UI Framework     │
│ TypeScript        │ Type Safety      │
│ Vite             │ Build Tool       │
│ Tailwind CSS     │ Styling          │
│ Lucide React     │ Icons            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│          BACKEND STACK               │
├──────────────────────────────────────┤
│ Flask 3.0        │ Web Framework    │
│ Python 3.8+      │ Language         │
│ Pandas           │ Data Processing  │
│ Scikit-learn     │ ML Library       │
│ XGBoost          │ ML Algorithm     │
│ NumPy            │ Numerical Ops    │
│ Flask-CORS       │ CORS Support     │
└──────────────────────────────────────┘
```

## ML Pipeline

```
┌─────────────┐
│  CSV/Excel  │
│   Dataset   │
└──────┬──────┘
       │
       │ Load Data
       ▼
┌─────────────────┐
│ Data Loading    │
│ (Pandas)        │
└──────┬──────────┘
       │
       │ Clean
       ▼
┌─────────────────┐
│ Handle Missing  │
│ Values (Median/ │
│ Mode)           │
└──────┬──────────┘
       │
       │ Deduplicate
       ▼
┌─────────────────┐
│ Remove          │
│ Duplicates      │
└──────┬──────────┘
       │
       │ Encode
       ▼
┌─────────────────┐
│ Label Encoding  │
│ (Categories →   │
│  Numbers)       │
└──────┬──────────┘
       │
       │ Scale
       ▼
┌─────────────────┐
│ Standard Scaling│
│ (Normalize)     │
└──────┬──────────┘
       │
       │ Split
       ▼
┌─────────────────┐
│ Train/Test Split│
│ (80/20)         │
└──────┬──────────┘
       │
       │ Train
       ▼
┌─────────────────────────────────┐
│     Model Training (Parallel)   │
│  ┌───────┬───────┬───────┬────┐│
│  │XGBoost│  RF   │  SVM  │ NN ││
│  └───────┴───────┴───────┴────┘│
└──────┬──────────────────────────┘
       │
       │ Evaluate
       ▼
┌─────────────────┐
│ Calculate       │
│ Metrics         │
│ (Acc, Prec,     │
│  Recall, F1)    │
└──────┬──────────┘
       │
       │ Select Best
       ▼
┌─────────────────┐
│ Return Best     │
│ Model Results   │
└─────────────────┘
```

## File Structure Details

```
project/
│
├── client/                    # Frontend Application
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.ts  # API integration layer
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   └── ProgressStepper.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── PreprocessingPage.tsx
│   │   │   ├── PredictionPage.tsx
│   │   │   ├── ReportPage.tsx
│   │   │   ├── RecommendationsPage.tsx
│   │   │   ├── SurveyPage.tsx
│   │   │   └── ReviewPage.tsx
│   │   ├── App.tsx           # Main app component
│   │   ├── main.tsx          # Entry point
│   │   └── index.css         # Global styles
│   └── package.json
│
├── server/                    # Backend Application
│   ├── routes/               # API endpoints
│   │   ├── upload_routes.py
│   │   ├── preprocessing_routes.py
│   │   ├── prediction_routes.py
│   │   ├── recommendation_routes.py
│   │   └── survey_routes.py
│   ├── services/             # Business logic
│   │   ├── preprocessing_service.py
│   │   ├── prediction_service.py
│   │   ├── recommendation_service.py
│   │   └── survey_service.py
│   ├── utils/                # Helper functions
│   │   ├── file_handler.py
│   │   ├── decorators.py
│   │   └── response_handler.py
│   ├── uploads/              # File storage
│   ├── app.py                # Flask application
│   ├── config.py             # Configuration
│   └── requirements.txt      # Dependencies
│
└── sample_data/              # Test data
    └── customer_churn_sample.csv
```
