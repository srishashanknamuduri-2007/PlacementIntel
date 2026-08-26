# Architectural & Technical Decisions Log — Phase 5

### 1. Decoupled AI Analysis Engine Architecture
- **Isolation Strategy**: Dedicated service module `src/lib/ai-service.ts`.
- **Fault-Tolerance & Circuit Breaker**: All AI calls (Google Gemini API / OpenAI) are executed asynchronously outside of core profile CRUD and resume generation request-response loops.
- **Graceful Fallback & Degradation**: If `ENABLE_AI=false`, or if external AI API keys are missing/invalid, or if the AI provider times out (>3000ms), the system automatically returns rule-based heuristics & fallback structural feedback. Core CRUD operations, portfolio SSR, and PDF downloads operate with 0% latency penalty or downtime.

### 2. Entity Persistence for AI Feedback
- **Storage**: AI feedback is persisted directly to entity attributes (`Project.ai_score`, `Project.ai_suggestions`, `JDMatch` records). This allows students to review historical feedback without re-triggering AI API calls.

### 3. JD-to-Resume Keyword Matching Engine
- **Capability**: Compares a target Job Description (JD) against the student's entire profile (Skills, Projects, Education, Certifications) to calculate a 0-100% Match Score, extract matched keywords, and pinpoint exact missing technical skills required for placement success.
