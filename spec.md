Project Overview & Tech Stack
Project Overview
Build an AI-powered college information assistant called EduQuery AI that leverages Retrieval-Augmented Generation (RAG). The platform allows administrators to upload official college documents (PDFs, FAQs, and notices) and enables students to ask questions that are answered based exclusively on that knowledge base. The system must cite its sources, prevent hallucinations, and provide a professional operations-console feel.
Tech Stack
Frontend: Next.js (Pages Router), React 19, Tailwind CSS, Zustand, Axios, Lucide-React.
Backend: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT), Multer.
AI Integration: Google Generative AI SDK (Gemini), LangChain for RAG orchestration.
Vector Layer: Pinecone OR Supabase Vector for semantic search and storage.
Processing: PDF-parse for text extraction and LangChain Text Splitters for chunking.
-----
2. Core Features
⭐ Must-Have Features
User Authentication: Secure registration and login for both Students and Admins using JWT.
Admin Document Portal: A restricted area for uploading college documents, tracking ingestion status, and deleting outdated files.
RAG Pipeline: Automated text extraction, chunking (1000-char size), embedding generation, and vector storage.
Intelligent Chat Interface: A threaded conversation UI with loading skeletons and real-time AI responses.
Source Attribution: Every AI answer must display the name of the document(s) used as a reference.
Hallucination Control: Explicit "I don't know" handling when context is missing from the database.
Chat History: Persistence of user conversations in MongoDB for audit and continuity.
-----
3. Backend Architecture & Database
Backend Folder Structure
server/
└── src/
    ├── config/         # DB connection, Vector DB setup, Gemini API config
    ├── routes/         # authRoutes, chatRoutes, adminRoutes
    ├── controllers/    # Request handling and response mapping
    ├── services/       # ragService, pdfService, vectorService, authService
    ├── models/         # User.js, Document.js, Conversation.js
    ├── middleware/     # authMiddleware, roleCheck (Admin)
    └── index.js        # Entry point
Database Collections (MongoDB)
Users: name, email, password (hashed), role (admin | student), lastLogin.
Documents: title, uploadDate, vectorNamespace, fileUrl, status (processed | pending).
Conversations: userId, messages [{ role: 'user' | 'assistant', content, sources: [], timestamp }].
-----
4. The RAG Pipeline (Mandatory Logic)
Ingestion: Admin uploads a PDF via the /api/admin/upload endpoint.
Chunking: pdfService extracts text and splits it into 1000-character segments with 200-character overlap to preserve semantic context.
Embedding: vectorService sends chunks to Gemini's embedding model.
Retrieval: When a student queries /api/chat/ask, the system performs a similarity search in the Vector DB to find the top 3 most relevant chunks.
Generation: The ragService constructs a prompt: "Use the following context to answer: {context}. Question: {query}. If the answer isn't in the context, say: 'I couldn't find an answer in your current sources.'"
-----
5. API Endpoints
Health and Auth
GET /api/health – System heartbeat.
POST /api/auth/register – Create new student/admin account.
POST /api/auth/login – Authenticate and issue JWT.
Chat & RAG
POST /api/chat/ask – Primary RAG query (Retrieval + LLM Generation).
GET /api/chat/history – Retrieve user-specific conversation logs.
Admin Operations
POST /api/admin/upload – Process and vectorize new college PDFs.
GET /api/admin/documents – List all knowledge base files and their status.
DELETE /api/admin/documents/:id – Remove document from MongoDB and Vector DB.
-----
6. Development Phases
Phase 1: Project setup (Next.js, Express, MongoDB connection, and JWT Authentication).
Phase 2: Admin Dashboard & Document Ingestion (PDF upload, text extraction, and chunking).
Phase 3: Vector Integration (Connecting Pinecone/Supabase and performing similarity searches).
Phase 4: RAG Orchestration (Prompt engineering and Google Gemini LLM integration).
Phase 5: Student Chat UI (Threaded chat interface, source citation, and history loading).
Phase 6: Deployment (Backend to Render, Frontend to Vercel, and final verification).
-----
7. UI & Security Requirements
UI/UX: Clean, light-themed operator-console aesthetic. Use skeleton loaders for document processing and AI generation.
Security: Hash passwords with bcrypt (cost 12), encrypt API keys in .env, and implement role-based access to prevent students from accessing the upload portal.
Error Handling: Surface explicit errors for "PDF Too Large," "Unsupported File Type," or "Connection Timeout."
-----
8. Implementation Instructions for AI Agents
Strict Grounding: The AI coding agent must prioritize ragService.js for all retrieval logic.
Pure Services: Services must not have access to the res or req objects; they should only receive inputs and return data.
Verification: At the end of each phase, the agent must report the list of files created or modified.