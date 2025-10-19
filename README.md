Project Proposal: Noobie — AI Mentor for New Hires
1. Problem Statement

When new hires or interns join a company, they often struggle to adapt to internal coding styles, architectural conventions, and security policies.
Even experienced developers need time to learn how things are done here.

This causes:

Slower onboarding

Increased review workload for senior developers

Inconsistent code quality across teams

Existing AI assistants (like Copilot or ChatGPT) are generic — they don’t teach how to code the company’s way.

2. Solution Overview

Noobie is an AI-powered coding mentor built specifically for new hires.
It helps them learn, train, and adapt to the company’s coding standards — through personalized feedback, score tracking, and realistic training.

Noobie allows companies to:

Upload internal coding and policy rules

Generate personalized invite links for interns/new hires

Let each new hire train on the web platform and receive AI evaluations + personal adaptation score

3. Workflow
🏢 For Companies

Company contacts Noobie privately and purchases access.

Product team creates a company admin account.

Company admin:

Uploads rule sets (style, structure, security, etc.)

Adds intern emails

Generates personal invite links (with one-time passwords)

Each intern’s progress can be viewed on a company dashboard (average adaptation scores, training completion rate, etc.)

👩‍💻 For Interns

Intern receives a unique invite link via email.

Registers → logs into Noobie Web Training Platform.

Starts training by submitting code examples or completing tasks.

The AI analyzes their code against company rules and gives:

Personalized feedback

Adaptation Score (0–100)

Suggestions on how to make the code more company-like

Over time, as they improve, their personal score history shows their growth and readiness.

4. Technical Overview
Layer	Technology	Description
Frontend	React / Next.js	Web dashboard for companies + training portal for interns
Backend	Node.js (Express) / FastAPI	Handles rule management, user auth, and AI communication
AI Model	Gemini / OpenAI API	Analyzes submitted code vs company rule set
Database	PostgreSQL / MongoDB	Stores companies, rules, users, and training data
Auth	JWT + One-time invite codes	Secure login for companies and interns
Scoring Engine	Custom logic + AI	Evaluates accuracy vs rule set and assigns adaptation score
5. Personalized Scoring System

Each intern’s code submission receives an Adaptation Score based on:

 . Style match (naming, formatting, conventions)

 . Correct use of company libraries/modules

 . Workflow consistency (file structure, imports)

 . Policy adherence (no disallowed patterns)

 . Code clarity and structure

Every intern has:

Score History Graph — tracks improvement over time

AI Feedback Summary — shows what to focus on next

Company Fit Level — “Beginner → Adapting → Company-Like → Ready”

6. Company Dashboard Features

View all interns and their scores

Track training activity and completion

Export adaptation reports

Add/remove rules dynamically

Regenerate new invite links


7. Innovation & Value

 Personalized AI mentorship — each intern gets their own adaptive score and growth plan
 Company-awareness — rules and policies are unique to each company
 Faster onboarding — new hires learn standards before they touch real code
 Measurable progress — companies can quantify readiness before assigning real tasks
 Easy to adopt — no need to integrate with production; training happens safely on the web

8. Future Potential

In the long term, Noobie can:

Integrate into IDEs for live review

Add gamified learning (badges, levels, leaderboards)

Support multiple roles per company (e.g., React, Django, QA)

Export intern performance reports for HR evaluation

Connect to company GitHub for real-time adaptation scoring

9. Summary

Noobie = The private AI mentor for new hires.
It’s where new developers learn how to think and code like the company — before they ever make a commit.
