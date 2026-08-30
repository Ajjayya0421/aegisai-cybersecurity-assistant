# AegisAI - AI-Powered Cybersecurity Assistant & Threat Triager 🛡️

A production-ready, enterprise-grade AI Cybersecurity Defense application powered by **Google Gemini 2.5 Flash**, **React 19**, **TypeScript**, **Express**, and **Tailwind CSS**. 

AegisAI empowers security analysts, developers, and everyday users to inspect suspicious phishing messages, deconstruct deceptive URLs, triage complex security logs, and receive real-time blue-team defensive guidance with strict zero-trust user data isolation.

---

## 🚀 Key Features

### 1. 🌐 Modern Cybersecurity HUD & 3D-Inspired UI
- Cyber-themed dark aesthetic with glowing perimeter shields, real-time threat radar sweeps, and responsive typography (`Chakra Petch`, `JetBrains Mono`, `Plus Jakarta Sans`).
- Visual dynamic **Risk Meters** (LOW, MEDIUM, HIGH, CRITICAL) with animated telemetry gauges.
- Interactive checklist for step-by-step defensive remediation actions.

### 2. 🤖 Ask Gemini Security Advisor
- Interactive conversational AI assistant specialized in defensive cybersecurity.
- Explains complex concepts (Zero Trust, Kerberos, Ransomware prevention, OAuth PKCE, OWASP Top 10) in accessible, intuitive language.
- Enforces strict ethical guardrails: automatically rejects offensive exploit requests, password cracking, or unauthorized penetration instructions, pivoting directly to detection and hardening.

### 3. 🔍 Comprehensive Threat Analysis Studio
Allows users to enter and triage four distinct threat vectors:
- **Suspicious Messages**: Detects Business Email Compromise (BEC), spear-phishing lures, urgent wire transfer fraud, and spoofed headers.
- **Suspicious URLs**: Identifies homograph attacks, typosquatted domains, obfuscated Base64 query parameters, and staging payloads.
- **Security Logs**: Triages Linux `auth.log` SSH brute-force attempts, Apache Log4j (CVE-2021-44228) exploit attempts, and SQL Injection strings.
- **Cybersecurity Threat Inquiries**: Formulates defensive architecture reviews and threat models.

Each analysis returns:
- Risk Level (LOW, MEDIUM, HIGH, CRITICAL)
- Threat Classification & Executive Summary
- Deep Technical Explanation
- Warning Signs & Red Flags List
- Recommended Defensive Actions Playbook
- Indicators of Compromise (IOCs)
- MITRE ATT&CK Mapping

### 4. 🗄️ Zero-Trust User Data Isolation & Audit History
- Every authenticated user's questions, AI responses, and incident analysis records are isolated per user ID (`uid`).
- Comprehensive audit log with category filtering, risk-level sorting, full-text search, Markdown report export, and CSV/JSON data snapshots.

### 5. 👤 Security Posture & Profile
- Calculates a dynamic **Defensive Readiness Score** (0–100%) based on threat analyses performed and remediation actions completed.
- Tracks earned blue-team achievement badges (*Phishing Sentinel*, *Log Analyst*, *URL Inspector*, *Zero Trust Guard*).

---

## 🛠️ Technologies & Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, ESBuild
- **AI Engine:** Google Gemini API via `@google/genai` SDK (`gemini-2.5-flash`)
- **Authentication & Persistence:** Google Identity / Firebase Auth & Firestore isolation architecture
- **Deployment:** Google Cloud Run (Containerized Node.js with Vite SPA fallback)

---

## 🔐 Security Considerations

1. **Server-Side API Key Isolation:**
   - The `GEMINI_API_KEY` is loaded strictly on the Express backend (`server.ts`) via environment variables. It is never exposed in client bundles or network requests.
2. **Defensive Blue-Team Guardrails:**
   - Strict system instructions mandate that the AI model must never supply malware, exploit payloads, credential harvesting scripts, or illegal attack instructions.
3. **Data Segregation:**
   - User sessions and data are segregated using Zero-Trust principles; users can only read and write to their own private partitions.
4. **Input Sanitization & Safe Display:**
   - Suspicious payloads, code blocks, and URLs are displayed in safe formatted containers with click-to-copy capability without executing arbitrary scripts.

---

## ⚙️ Configuration & Setup

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
# Gemini API Key (Server-side secret)
GEMINI_API_KEY="your-gemini-api-key-here"

# Port (Cloud Run binds to 3000)
PORT=3000
```

### 2. Local Development
```bash
# Install dependencies
npm install

# Start development server with tsx and Vite middleware
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🔥 Firebase & Firestore Setup (Optional Full Cloud Sync)

If connecting directly to Google Cloud Firestore and Firebase Authentication:

### 1. Firestore Data Structure
```
/users/{userId}
  ├── displayName: string
  ├── email: string
  ├── securityScore: number
  ├── chats/
  │    └── {chatId}: { sender, content, timestamp, tags }
  └── analyses/
       └── {analysisId}: { category, rawInput, riskLevel, threatType, summary, explanation, warningSigns, defensiveActions, timestamp }
```

### 2. Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /chats/{chatId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /analyses/{analysisId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: false;
    }
  }
}
```

---

## ☁️ Google Cloud Run Deployment

This application is fully containerized and production-ready for Google Cloud Run.

### 1. Build Production Bundle
```bash
npm run build
```
This compiles the Vite frontend into `dist/` and bundles `server.ts` into a self-contained CommonJS server at `dist/server.cjs`.

### 2. Deploy to Cloud Run via gcloud CLI
```bash
# Build & Deploy
gcloud run deploy aegis-cybersecurity-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="your-gemini-api-key"
```

---

## 📜 License
Apache-2.0 License. Built with Google AI Studio.
