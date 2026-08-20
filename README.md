# PadhAI — AI Exam Preparation Workspace

PadhAI turns a student's own PDFs and notes into a source-grounded AI tutor, exam summaries, flashcards, quizzes, timed mock tests, weak-topic analysis and an adaptive study plan.

## Product flow

PDF / notes → AI Tutor → Summary → Flashcards → Quiz → Mock Test → Weak Topics → Study Plan → Progress

## Founder Admin

The founder console lives at `/admin` and is protected by `ADMIN_EMAIL`. It shows real product usage and beta validation signals from the database: users, uploaded materials, attempts, quiz/mock usage, activation, feedback, return intent and willingness to pay.

## Local setup

1. Install Node.js 20+.
2. Create `.env` from `.env.example`.
3. Set `DATABASE_URL`, `AUTH_SECRET`, and your model/API settings.
4. Set `ADMIN_EMAIL` to the exact email used by your account.
5. Install dependencies:

```bash
npm install
```

6. Generate/apply Prisma schema:

```bash
npx prisma generate
npx prisma migrate dev
```

7. Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important PDF note

This project uses `pdf-parse` 2.x with its `PDFParse` API and keeps the package external to the Next.js server bundle. This avoids the old `pdf-parse` 1.x test-file resolution problem seen during PDF uploads.

## Hackathon positioning

PadhAI is not only a document chat clone. It closes the loop from **understanding → practice → evaluation → weakness detection → personalized revision**.

## Business model

- Free: NPR 0 — 3 materials, 20 AI questions/month, 3 quizzes/month, 1 mock test/month.
- Student Pro: NPR 199/month — unlimited materials, 300 AI questions/month, unlimited quizzes/flashcards, 10 mock tests/month and weak-topic planning.
- Exam Pass: NPR 999/3 months — Pro features plus unlimited mock tests and advanced progress insights.

The NPR 199 anchor is positioned around replacing fragmented study tools with one exam workspace. Variable model cost is controlled with retrieval-first prompts, usage caps and smaller models for routine generation. Treat the cost numbers as planning assumptions until real production telemetry is available.

### Practical unit-economics assumptions for the pitch

Use scenarios rather than pretending these are historical results: **Lean** (NPR 45 AI/infrastructure per active paid user/month), **Base** (NPR 70), **Heavy** (NPR 110). At NPR 199/month, gross contribution before support/payment fees is approximately NPR 154, 129 and 89 respectively. Replace these assumptions with actual provider invoices after launch.

### Validation

The admin console at `/admin` reports real database-backed signals: registrations, uploaded materials, practice attempts, activation, beta feedback, return intent and willingness to pay. Do not present empty or small samples as market proof; recruit 10–30 real students and report the actual sample size in the presentation.

## Submission checklist

- [ ] Production deployment
- [ ] Public GitHub repository
- [ ] Demo video with face + slides + product demo
- [ ] Presentation: problem, target user, differentiation, demo
- [ ] Pricing and revenue model
- [ ] LLM/infrastructure cost assumptions
- [ ] DAU/MAU and growth assumptions
- [ ] Real beta feedback / validation
- [ ] Build-in-public content
