# Career Mentor Backend API

This is the backend API for the AI Career Mentor application.

## 📁 Folder Structure

```
backend/
├── config/
│   └── supabase.js      # Supabase database client configuration
├── routes/
│   ├── profile.js       # User profile routes (create, get)
│   ├── ai.js            # AI career recommendation routes
│   └── progress.js      # Progress update routes
├── server.js            # Main Express server entry point
├── package.json         # Dependencies and scripts
└── .env.example         # Environment variables template
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `N8N_WEBHOOK_URL` - Your n8n webhook URL
- `FRONTEND_URL` - Your frontend URL (for CORS)

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
- **GET** `/health`
- Returns server status

### 2. Create/Update Profile
- **POST** `/api/profile`
- **Body:**
  ```json
  {
    "email": "student@example.com",
    "branch": "CSE",
    "year": 2,
    "interest": "Web Dev",
    "daily_time": 45
  }
  ```

### 3. Get Profile
- **GET** `/api/profile/:email`
- Returns user profile

### 4. Get Career Recommendation
- **POST** `/api/ai/career`
- **Body:**
  ```json
  {
    "email": "student@example.com"
  }
  ```
- Returns AI-generated career path and roadmap

### 5. Update Progress
- **POST** `/api/progress`
- **Body:**
  ```json
  {
    "email": "student@example.com",
    "month_completed": 1,
    "is_completed": true
  }
  ```
- Returns updated roadmap and feedback

## 🔗 Integration Flow

1. **Frontend** → Sends profile data → **Backend API**
2. **Backend** → Saves to → **Supabase Database**
3. **Backend** → Sends profile → **n8n Webhook**
4. **n8n** → Processes with AI → Returns recommendation
5. **Backend** → Saves AI response → **Supabase**
6. **Backend** → Returns data → **Frontend**

## 📦 Deployment (Render)

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy!
