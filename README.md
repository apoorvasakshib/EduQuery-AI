# 🎓 Advanced EduQuery AI – RAG-Based College Chatbot Platform

EduQuery AI 2.0 is a production-quality, multi-department Retrieval-Augmented Generation (RAG) platform. It allows college administrators to upload official PDF documents (guidelines, regulations, timetables, FAQs), which are processed through text extraction, OCR checks, chunking, and vector embedding generation. Students can query the knowledge base in **English, Kannada, or Hindi** via text or voice, receiving grounded answers with confidence percentage scores and interactive source page highlighting.

---

## 🚀 Key Feature Highlights

1. **Role-Based Access Control (RBAC)**:
   - **Super Admin**: Full platform control, department/collection management, user access, system audit logs.
   - **Department Admin**: Department-level document management, PDF uploads, version control, AI summary generation, AI FAQ approval.
   - **Student**: Access to permitted knowledge bases, multilingual streaming chat, voice input/output, conversation export.

2. **Advanced Hybrid RAG Pipeline**:
   - **Hybrid Search**: Combines Gemini vector embeddings cosine similarity with BM25 keyword matching.
   - **Re-Ranking**: Candidate chunks (Top 20) are re-ranked down to Top 5-8 relevant chunks.
   - **Confidence Scoring**: High (90-100%), Medium (70-89%), Low (<70%).
   - **Strict Grounding Fallback**: *"I couldn't find this information in the available official college documents."*

3. **Document Lifecycle & Version Control**:
   - Multi-version support (V1, V2, active/archived status).
   - Document Summaries: Short summary, key points, main rules, important dates.
   - Processing Pipeline Stepper: `Upload` → `Text Extraction` → `OCR Check` → `Chunking` → `Embedding` → `Indexing` → `Ready`.

4. **Multilingual & Voice Experience**:
   - Language selector: **English**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिन्दी)**.
   - Web Speech API **Voice Input** (microphone speech-to-text) & **Voice Output** (text-to-speech reader).
   - Interactive Source Drawer displaying page number, relevance score, and highlighted chunk text.
   - Response Feedback: 👍 Helpful / 👎 Not Helpful (with reason categories).
   - Conversation Export: **TXT**, **JSON**, **PDF**.

5. **SaaS Admin Dashboard & Analytics**:
   - Recharts charts: Queries per day, per department, top searched topics, feedback distribution.
   - AI FAQ Generator: Extract, edit, approve, and publish FAQs for students.
   - Dark and Light Theme toggle persisting across sessions.

---

## 📋 Prerequisites & Requirements

1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI string.
3. **Google Gemini API Key**: Free API Key from [Google AI Studio](https://aistudio.google.com/).

---

## ⚡ Quick Start Instructions

### 1. Configure Backend Environment (`server/.env`)
Ensure your `server/.env` file contains:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/eduquery_db
JWT_SECRET=eduquery_super_secret_jwt_key_2026_change_in_production
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

### 2. Seed Initial Demo Database
Navigate to the `server` folder and run the seed script:

```bash
cd "c:/Users/Lenovo/Desktop/project folder/server"
npm run seed
```

This creates initial departments (CSE, Data Science, ECE, Mechanical, Exam Cell, Student Affairs), default collections, demo documents with Version 1, approved FAQs, and initial demo accounts:

- **Super Admin**: `superadmin@college.edu` / `superadmin123`
- **Dept Admin**:  `cseadmin@college.edu` / `deptadmin123`
- **Student**:     `student@college.edu` / `student123`

### 3. Start Backend Server
```bash
npm run dev
```
Backend will start on `http://localhost:5000`.

### 4. Start Frontend Client
Open a **new terminal window** and run:

```bash
cd "c:/Users/Lenovo/Desktop/project folder/client"
npm install
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 🧪 Manual Acceptance Checklist

- [x] Super Admin, Dept Admin, and Student authentication and RBAC.
- [x] Department and Collection management.
- [x] Multi-PDF upload with processing pipeline stepper.
- [x] Document version management (V1 / V2 active & archived status).
- [x] Hybrid Search (Vector + Keyword) and chunk re-ranking.
- [x] Strict Grounding: Fallback message returned when information is absent.
- [x] Multilingual chat in English, Kannada, and Hindi.
- [x] Microphone voice input and speech synthesis audio reader.
- [x] Source citation badges with page numbers and highlighted chunk modal.
- [x] Conversation export to TXT / JSON.
- [x] Thumbs up / Thumbs down feedback modal.
- [x] AI Document Summary generation.
- [x] AI FAQ generation & approval flow.
- [x] Admin Analytics charts using Recharts.
- [x] Dark and Light theme toggle.
