# RootU - Agentic Campus Relocation & Local-Life Copilot

## Overview
RootU is a full-stack agentic platform to help relocating university students integrate into their new city and campus. The app is divided into:
- `client`: React (Vite) + Tailwind CSS application.
- `server`: Node.js (Express) + TypeScript server orchestrating Supabase DB and Gemini AI.
- `db`: Supabase PostgreSQL schema, RLS policies, and vector database seeding logic.

## Environment Variables
The `.env.example` file at the root provides required keys. Copy it to `.env` and fill in:
- Supabase Project URL & Keys (Anon key for client, Service Role key for server).
- Gemini API Key.
- Google Maps Browser API Key (restricted).

## Starting the Application
1. **Database setup**: Run `db/schema.sql` and `db/rls.sql` in your Supabase SQL Editor.
2. **Seed Local Knowledge**: Run `cd db/seed && npx tsx local_knowledge.seed.ts` (Requires environment variables to be set up).
3. **Run Server**:
   ```sh
   cd server
   npm install
   npm run dev
   ```
4. **Run Client**:
   ```sh
   cd client
   npm install
   npm run dev
   ```

## Key Features
- **Conversational Onboarding**: Replaces forms with an intelligent chat-based onboarding (driven by Gemini entity extraction).
- **Local Insider RAG Agent**: Answering queries exclusively from the curated `local_knowledge` using vector similarity search.
- **Proactive Daily Dashboard**: Generated morning briefings aggregating the user's schedule, commute preference, weather, and traffic.

## Architectural Notes
- The Gemini `@google/genai` SDK is used in the backend (`server/src/lib/gemini.ts`).
- Zod is used for structured output validation from Gemini and shared between backend/frontend.
- FullCalendar is used for schedule management.
- Real Google Maps is embedded for local exploration.
