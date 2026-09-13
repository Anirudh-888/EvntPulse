# EvntPulse Machine Learning Architecture Roadmap

> [!NOTE]
> **Production AI Roadmap & Scaffolding**
> As specified in the EvntPulse system architecture, ML models are **not executed in the Phase 1 MVP**.
> Currently, all Event Health Scores and intelligence insights are computed through an explainable, deterministic, rule-based engine.
> This directory provides the data contracts, pipeline specifications, and modular scaffolding for future ML integration without modifying core application logic.

---

## 1. Planned Predictive Capabilities

### A. Attendance Prediction Model
- **Objective**: Predict actual physical attendee turnout based on early registration velocity, event category, day of week, time of day, and student engagement history.
- **Algorithm**: Gradient Boosted Trees (LightGBM / XGBoost) or Neural Tabular Regressors.
- **Input Features**:
  - `days_until_event`
  - `registration_velocity` (registrations / day)
  - `capacity_fill_ratio`
  - `event_category_onehot`
  - `is_weekend`, `hour_of_day`
  - `historical_club_attendance_rate`
- **Output Target**: Expected attendance count and confidence interval ($\pm \sigma$).

### B. Event Recommendation Engine
- **Objective**: Deliver hyper-personalized event recommendations on the student home feed.
- **Algorithm**: Two-tower Hybrid Recommender (Collaborative Filtering + Content-Based Embeddings).
- **Input Features**:
  - Student major, graduation year, attended event tags.
  - Event title & description embeddings (SentenceTransformers / MiniLM).
- **Output Target**: Top-K ranked event recommendations.

### C. Feedback Sentiment & Topic Analysis
- **Objective**: Process unstructured student feedback comments to extract sentiment polarity and actionable topic clusters (e.g., "A/V issues", "Mentorship quality", "Venue temperature").
- **Algorithm**: Fine-tuned RoBERTa / DistilBERT sentiment classifier + BERTopic.
- **Output**: Sentiment score (-1.0 to +1.0) and key highlighted tags for organizer review.

---

## 2. Directory Structure

```
ml/
├── README.md               # Architecture documentation & roadmaps
├── data/                   # Feature store snapshots and training datasets
│   └── .gitkeep
├── preprocessing/          # Feature engineering, tokenization, scalers
│   └── .gitkeep
├── training/               # Model training scripts and hyperparameter tuning
│   └── .gitkeep
├── models/                 # Serialized model artifacts (ONNX / Joblib)
│   └── .gitkeep
└── inference/              # Lightweight FastAPI inference service wrappers
    └── .gitkeep
```

---

## 3. Future Integration Architecture

```
Frontend (React)
      │
      ▼
FastAPI Backend (Analytics Service)
      │
      ├──> SQLite / PostgreSQL (Core Event Tables)
      │
      └──> ML Inference Pipeline (ml/inference/)
                 │
                 ▼
          Predictive Score & Recommendations
```

When integrating ML, the `app/services/analytics_service.py` calls `ml/inference/` as an optional enrichment layer, keeping database and routing decoupled.
