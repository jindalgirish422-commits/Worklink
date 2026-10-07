# WorkLink

> **"Right Labour. Right Work. Right Time."**
> 
> *WorkLink is not about finding the nearest worker. WorkLink is about finding the most suitable available worker.*
> *AI should explain itself before asking the user to trust it.*

---

## 🛠️ Overview & Core Product Idea

**WorkLink** is an AI-powered skilled-labour and service marketplace. It connects customers with verified real-world service professionals:
- **Plumbers**
- **Electricians**
- **Carpenters**
- **Painters**
- **AC Technicians**
- **Mechanics**
- **Appliance Repair Workers**
- **Cleaning / Service Professionals**
- **General Skilled Technicians**

> **Important Architecture Boundary:**
> WorkLink is **NOT** a data-science recruitment platform. The hackathon data-science and analytics datasets are used strictly as **WORKFORCE INTELLIGENCE** evidence and analytical foundations to formulate explainable matching principles.

---

## 🔄 Non-Negotiable Product Flow

```
Customer need
      ↓
Natural-language job request (Chatbot Intake)
      ↓
AI understands requirement (Slot Extraction)
      ↓
Location determined
      ↓
10 km dynamic service zone
      ↓
Hard eligibility filtering (5 Non-negotiable checks)
      ↓
Available workers
      ↓
Multi-factor soft ranking (Calibrated weights)
      ↓
Explainable recommendations ("Why this worker")
      ↓
Worker profile (Verification, License, Tools, Reviews)
      ↓
Booking & Dispatch
      ↓
Worker acceptance (Real-time dispatch)
      ↓
Job execution
      ↓
Working-hour tracking (Live timer)
      ↓
Final amount recalculation
      ↓
Payment settlement
      ↓
Rating & review
      ↓
Feedback loop (Telemetry signals into worker scores & priors)
```

---

## 🎯 Core Matching Logic

### Step 1: Hard Eligibility Filters (Non-Negotiable)
Before any ranking, candidates who cannot perform the job are eliminated:
1. **Worker Verified**: Govt ID & trade license background check confirmed.
2. **Required Skill Available**: Worker possesses all required trade skills for the specific issue.
3. **Worker Available**: Available at requested urgency (immediate vs scheduled slot).
4. **Worker within 10 km**: Resides within the dynamic 10 km customer service zone.
5. **Mandatory Conditions Satisfied**: Minimum trade experience threshold met.

### Step 2: Multi-Factor Soft Ranking
Eligible workers are scored using a weighted multi-factor formulation:
$$S = w_s \cdot S_{\text{skill}} + w_e \cdot S_{\text{experience}} + w_a \cdot S_{\text{availability}} + w_q \cdot S_{\text{quality}} + w_d \cdot S_{\text{distance}} + w_p \cdot S_{\text{price}} + S_{\text{personalization}}$$

- **$S_{\text{skill}}$**: Matched required skills / required skills + complementary trade skills.
- **$S_{\text{experience}}$**: Evaluated relative to the job's complexity tier (not blindly maximized).
- **$S_{\text{availability}}$**: Real-time slot match.
- **$S_{\text{quality}}$**: Verified star rating, completed job history, and completion rate.
- **$S_{\text{distance}}$**: Normalized proximity within the 10 km zone.
- **$S_{\text{price}}$**: Quote comparison against budget cap and local benchmarks.
- **$S_{\text{personalization}}$**: Repeat bookings and customer historical trade preferences.

> **Responsible AI Weight Principle:** Weights are business priors awaiting transaction calibration, not fitted constants. Calibrated via scenario benchmarks and learned from real booking outcomes.

---

## 📍 Dynamic 10 km Service Zone Logic

- **0–5 km**: **Free Travel Zone** — Normally zero travel surcharge.
- **5–10 km**: **Configurable Slab Zone** — Travel fee applied per km above 5 km.
- **>10 km**: **Ineligible Cutoff** — Worker cannot be matched.
- If the customer changes location: **The 10 km service zone moves dynamically, recalculating the eligible worker pool in real-time.**

---

## 🤖 Natural-Language AI Intake Chatbot

Converts free-form prompts (e.g. *"My AC isn't cooling and making a loud buzzing noise. I need someone right now! Budget is ₹800."*) into structured attributes:
- **Service**: AC Technician
- **Required Skills**: AC Diagnostics, Gas Leak Detection, PCB Inverter Repair
- **Experience Requirement**: 3+ Years
- **Urgency**: Immediate Emergency
- **Slot**: Now (Within 45 mins)
- **Budget**: Max ₹800
- **Dynamic Radius**: 10 km enforced

---

## 💳 Transparent Pricing & Working-Hour Tracking

### Pre-Booking Estimate:
$$\text{Labour Estimate} + \text{Estimated Travel} + \text{Platform Fee} - \text{Discounts} = \text{Estimated Total}$$

### Post-Service Actual Invoice:
$$\text{Actual Labour (Hourly Rate} \times \text{Actual Timer Hours)} + \text{Actual Travel} + \text{Approved Spares/Add-ons} + \text{Platform Fee} - \text{Discounts} = \text{Final Amount}$$

---

## 📊 Workforce Intelligence Foundations (Hackathon Data)

WorkLink maintains a strict conceptual separation:
$$\text{HACKATHON DATA} \longrightarrow \text{WORKFORCE INTELLIGENCE} \longrightarrow \text{MATCHING PRINCIPLES} \longrightarrow \text{WORKLINK MARKETPLACE}$$

### 4 Datasets Analyzed:
1. **Analytics Jobs** (15,841 records): Analyzes macro skill demand concentration (SQL in 1,582 postings, Python in 962) and data quality/missingness discipline.
2. **Data Science Jobs** (1,602 records): Analyzes role compensation hierarchy (₹5.71L to ₹25.09L) and experience correlation ($r = 0.66$).
3. **JDS Skill Traits** (139 records): Demonstrates technical capability separation across hike groups (Logistic Regression CV Accuracy $\approx 81.9\%$).
4. **SDS Personality Traits** (161 records): Analyzes Big Five behavioral traits (Random forest $\approx 95.6\%$).
   - **Strict Ethical Rule**: Personality traits are **NEVER** used as a standalone worker rejection/hiring criteria.

### Benchmark Validation (Appendix G Reproduction):
A dedicated **Scenario Simulator** reproduces the Emergency AC repair benchmark with synthetic workers W1 to W6:
- **Nearest Worker Strategy**: Naively picks W1 (1.2 km) $\longrightarrow$ **FAILS** (lacks skills & exp).
- **Highest-Rated Strategy**: Naively picks W2 (4.9★) $\longrightarrow$ **FAILS** (unavailable until tomorrow).
- **Skill-Match Only Strategy**: Results in an unranked 4-way tie (W2–W5) $\longrightarrow$ **FAILS** to discriminate.
- **WorkLink Multi-Factor**: Filters out W1, W2, W6; identifies W3 as dominating W4; explains trade-off between W3 and W5.

---

## 🚀 Running the Application

### Prerequisites:
- Node.js (v18+)

### Development Server:
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run dev
```

### Production Build:
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
npm run build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
