import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Defensive System Instruction
const DEFENSIVE_SYSTEM_PROMPT = `
You are AegisAI, a tier-1 elite defensive cybersecurity advisor and threat analyst.
YOUR OBJECTIVE:
- Explain cybersecurity concepts in clear, intuitive, and accessible language for developers, security professionals, and everyday users.
- Provide safe, actionable, and defensive cybersecurity recommendations (Zero Trust, defense-in-depth, patching, hardening, MFA, incident response, SIEM triage, threat modeling).
- Help users detect, triage, analyze, and neutralize cyber threats.

STRICT SAFETY AND ETHICAL MANDATES (NON-NEGOTIABLE):
1. You MUST NEVER provide actionable exploit scripts, zero-day payloads, phishing templates, unauthorized penetration tools, credential harvesting code, or step-by-step guidance for attacking unconsenting targets or performing illegal activities.
2. If a user asks how to hack, crack passwords, exploit a vulnerability, or launch an attack, POLITELY REFUSE the offensive request and immediately pivot to explaining:
   - The underlying vulnerability concept
   - How defenders detect this activity
   - How to secure, patch, and harden systems against it
3. Always maintain a professional, vigilant, and supportive security guardian posture.
`;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    service: 'AegisAI Cybersecurity Engine',
  });
});

// Chat endpoint (Ask Gemini Cybersecurity Assistant)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const ai = getGenAI();

    // Build chat contents array
    const contents: any[] = [];

    // Add prior history if provided
    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory.slice(-8)) {
        if (item.sender === 'user') {
          contents.push({ role: 'user', parts: [{ text: item.content }] });
        } else if (item.sender === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: item.content }] });
        }
      }
    }

    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: DEFENSIVE_SYSTEM_PROMPT + `
Format your response using clear Markdown formatting with headers, bullet points, and code snippets where defensive configurations or command-line remediation are shown. 
At the end of your response, if relevant, suggest 2-3 short defensive follow-up questions or actions under a "### Suggested Next Steps" section.`,
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const replyText = response.text || 'I analyzed the security context, but received no response payload. Please try again.';

    res.json({
      reply: replyText,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    
    // Provide a helpful graceful fallback if API key is not configured or rate limited
    if (error.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please configure GEMINI_API_KEY in your environment.',
      });
    }

    res.status(500).json({
      error: error.message || 'An internal error occurred while processing the cybersecurity query.',
    });
  }
});

// Security Analysis endpoint (Structured Threat Triaging)
app.post('/api/analyze', async (req, res) => {
  try {
    const { category, rawInput } = req.body;

    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({ error: 'Payload data (rawInput) is required for analysis.' });
    }

    const validCategories = ['message', 'url', 'log', 'question'];
    const selectedCategory = validCategories.includes(category) ? category : 'question';

    const ai = getGenAI();

    const analysisPrompt = `
Perform a thorough cybersecurity threat analysis on the following submitted artifact.

CATEGORY: ${selectedCategory.toUpperCase()}
SUBMITTED CONTENT:
"""
${rawInput}
"""

Evaluate for:
1. Threat classification (e.g., Phishing / Social Engineering, Deceptive URL / Typosquatting, Unauthorized Access / Brute Force, Web Vulnerability, Malicious Script / Command Injection, Information Disclosure, or Safe / Low Risk).
2. Risk Level: MUST BE exactly one of: "LOW", "MEDIUM", "HIGH", "CRITICAL".
3. Summary: 1-2 sentence executive summary of the threat posture.
4. Explanation: Deep technical yet accessible breakdown of what is happening or what risks are present.
5. Warning Signs: Specific anomalies, red flags, syntax indicators, or deceptive tactics observed.
6. Defensive Actions: Concrete, step-by-step blue-team mitigation and remediation actions.
7. Technical Indicators (IOCs): Any suspicious IPs, domains, URL parameters, suspicious function names, or regex patterns detected.
8. MITRE ATT&CK / CVE References: Any relevant MITRE technique IDs (e.g., T1566 Phishing, T1110 Brute Force, T1059 Command and Scripting Interpreter) or CVE IDs.

Return ONLY a valid JSON object matching this exact schema:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "threatType": "string",
  "summary": "string",
  "explanation": "string",
  "warningSigns": ["string", "string"],
  "defensiveActions": ["string", "string"],
  "technicalIndicators": ["string", "string"],
  "mitreAttackTags": ["string", "string"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
      config: {
        systemInstruction: DEFENSIVE_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback JSON parsing
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI structured response.');
      }
    }

    // Format defensive actions with completion state
    const defensiveActions = (parsedData.defensiveActions || []).map((action: string) => ({
      action,
      completed: false,
    }));

    const result = {
      id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      category: selectedCategory,
      rawInput,
      riskLevel: parsedData.riskLevel || 'MEDIUM',
      threatType: parsedData.threatType || 'General Threat Analysis',
      summary: parsedData.summary || 'Threat analysis complete.',
      explanation: parsedData.explanation || 'No detailed explanation generated.',
      warningSigns: parsedData.warningSigns || [],
      defensiveActions,
      technicalIndicators: parsedData.technicalIndicators || [],
      mitreAttackTags: parsedData.mitreAttackTags || [],
      timestamp: Date.now(),
    };

    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({
      error: error.message || 'Failed to complete security threat analysis.',
    });
  }
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ AegisAI Security Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
