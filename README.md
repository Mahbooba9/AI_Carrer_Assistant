# AI Career Assistant 

A powerful full-stack MERN application that helps users with career development using AI (Gemini API + JSsearch API).

## 🚀 New Features (V2)

### 1. **Job Search - Enhanced with Filters**
- Integration with **JSsearch RapidAPI** for real job listings
- Advanced filters:
  - Job Title
  - Location
  - Salary Range (Min-Max)
  - Experience Level
  - Company Name
  - Skills (comma-separated)
- Real-time search results with job details

### 2. **Resume Improver - JD-Based Analysis**
- Resume analysis based on job role
- **Optional: Upload Job Description (JD)**
- AI provides:
  - Gap Analysis (missing skills)
  - Matching Skills
  - Improvement Suggestions
  - Priority Areas
  - Keywords to Add
- Powered by **Gemini API**

### 3. **Advanced Interview Preparation**
- **JD-Based Topic Suggestions** (based on job description + resume)
- **Structured Learning Path:**
  - Beginner Level Topics
  - Intermediate Level Topics
  - Advance Level Topics
- **Full Course Modules:**
  - Key Concepts & Definitions
  - Important Points & Best Practices
  - Real-world Examples
  - Common Interview Questions
  - Practice Tips
- **Quiz System:**
  - 15-20 questions per quiz
  - Question tracking (no repeats across quizzes)
  - Difficulty-based questions
  - Score calculation & feedback
  - Quiz history in MongoDB

### 4. **Enhanced Chat Bot**
- **Gemini API Integration** for smarter responses
- **Career-Topic Filtering:**
  - Accepts career-related questions
  - Politely refuses non-career topics (movies, sports, etc.)
  - Redirects to career focus
- **Better Conversational AI**
- Real-time chat with floating widget

## 🛠 Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- **Gemini API** (for AI responses)
- **JSsearch RapidAPI** (for job listings)
- JWT Authentication
- Multer for file uploads
- PDF-parse & Mammoth for document parsing

### Frontend
- React + Vite
- React Router
- Axios for API calls
- TailwindCSS for styling

## 📋 New Models

```javascript
// JobDescription - Stores uploaded JDs
{
  userId, jdText, jobRole, company, uploadedAt
}

// CourseModule - Stores course content
{
  userId, role, topic, difficulty, content, 
  estimatedTime, completed, jdBased, createdAt
}

// QuizQuestion - Tracks asked questions
{
  userId, role, topic, question, options, 
  correctAnswer, difficulty, askedCount, createdAt
}
```

## 📦 Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB
- **Gemini API Key**: https://ai.google.dev/
- **JSsearch API Key**: https://rapidapi.com/jsearch/api/jsearch

### Backend Setup

1. Navigate to backend:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-career-assistant
   JWT_SECRET=careerassistant2026supersecret
   GEMINI_API_KEY=your-gemini-api-key
   JSEARCH_API_HOST=jsearch.p.rapidapi.com
   JSEARCH_API_KEY=your-jsearch-api-key
   PORT=5000
   ```

3. Start backend:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   npm install
   ```

2. Start frontend:
   ```bash
   npm run dev
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`

### Resume
- `POST /api/resume/upload`
- `GET /api/resume`
- `POST /api/resume/improve` (with optional JD)

### Job Search
- `POST /api/jobs/search` (with filters)

### Interview Preparation (Advanced)
- `POST /api/interview-advanced/topics` (with optional JD)
- `POST /api/interview-advanced/course`
- `POST /api/interview-advanced/quiz-questions` (15-20 questions)
- `POST /api/interview-advanced/quiz/submit`

### Chat
- `POST /api/chat/ask` (with topic filtering)

## 💡 Usage Workflow

1. **Register/Login**
2. **Upload Resume** (PDF/DOCX)
3. **Search Jobs** with advanced filters
4. **Improve Resume** (optionally with JD)
5. **Prepare for Interview:**
   - Paste JD (optional)
   - Select topics by difficulty
   - Study full course modules
   - Take quiz (never repeat questions)
6. **Chat Bot** for career guidance (available on all pages)

## 🎯 Key Features

✅ Real job listings via JSsearch API
✅ JD-based suggestions & analysis
✅ Structured learning paths (Beginner → Advance)
✅ Advanced quiz system (15-20 questions, no repeats)
✅ Gemini AI for smart responses
✅ Career-topic filtering in chat bot
✅ Quiz history tracking
✅ Responsive UI with TailwindCSS
✅ MongoDB persistence

## 📌 Notes

- Both backend and frontend must be running
- Gemini API provides AI-generated content
- JSsearch API provides real job listings
- All features require JWT authentication
- Chat bot filters non-career topics politely"# AI_Career_Assistant" 
