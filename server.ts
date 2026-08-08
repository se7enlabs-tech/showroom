import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { Resend } from "resend";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up trust proxy for accurate IP identification behind a reverse proxy (like Cloud Run)
app.set("trust proxy", 1);

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 40, // 40 requests per minute is plenty for a few users
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please wait a minute." }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 contact submissions per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact requests sent. Please try again later." }
});

// Initialize Gemini Client server-side only
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;

if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
}

// Tool Declarations for Vincent AI Agent
const sendEmailToolDeclaration: FunctionDeclaration = {
  name: "sendEmail",
  description: "Send an email message or inquiry directly to Von / SE7ENLABS on behalf of a user or prospective client.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      senderName: { type: Type.STRING, description: "Full name of the sender/client" },
      senderEmail: { type: Type.STRING, description: "Email address of the sender/client" },
      subject: { type: Type.STRING, description: "Subject line of the email message" },
      message: { type: Type.STRING, description: "Detailed message or inquiry to deliver to Von" }
    },
    required: ["senderName", "senderEmail", "message"]
  }
};

const bookScheduleToolDeclaration: FunctionDeclaration = {
  name: "bookSchedule",
  description: "Generate a personalized booking URL for the user to schedule a 15-minute Discovery Call with Von.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      clientName: { type: Type.STRING, description: "Name of the client scheduling the call" },
      clientEmail: { type: Type.STRING, description: "Email address of the client" },
      notes: { type: Type.STRING, description: "Topic, project details, or preferred time for the call" }
    },
    required: ["clientName", "clientEmail"]
  }
};

// Tool Execution Logic
async function handleSendEmailTool({ senderName, senderEmail, subject, message }: any) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (!apiKey) {
    return { success: false, error: "Resend API key is missing." };
  }

  try {
    const resend = new Resend(apiKey);
    const safeName = (senderName || "User").replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const { data, error } = await resend.emails.send({
      from: `${safeName} via Vincent AI <onboarding@resend.dev>`,
      replyTo: senderEmail,
      to: toEmail,
      subject: `[Vincent AI Agent] ${subject || 'Inquiry from ' + senderName}`,
      text: `Inquiry via Vincent AI Chatbot:\n\nName: ${senderName}\nEmail: ${senderEmail}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">New Inquiry via Vincent AI Chatbot</h2>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #334155;"><strong>From:</strong> ${senderName} (&lt;<a href="mailto:${senderEmail}">${senderEmail}</a>&gt;)</p>
            <p style="margin: 4px 0; color: #334155;"><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          </div>
          <p style="white-space: pre-wrap; color: #1e293b; font-size: 15px; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Sent automatically by Vincent AI Agent on the SE7ENLABS website.</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend API Tool error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, id: data?.id, toEmail };
  } catch (err: any) {
    console.error("Error executing sendEmail tool:", err);
    return { success: false, error: err?.message || "Internal email delivery error" };
  }
}

async function handleBookScheduleTool({ clientName, clientEmail, notes }: any) {
  const calLink = process.env.CAL_EVENT_LINK || "https://cal.com/se7enlabs/discovery";
  const encodedName = encodeURIComponent(clientName || "");
  const encodedEmail = encodeURIComponent(clientEmail || "");
  const encodedNotes = encodeURIComponent(notes || "");

  const prefilledUrl = `${calLink}?name=${encodedName}&email=${encodedEmail}&notes=${encodedNotes}`;

  return {
    success: true,
    bookingUrl: prefilledUrl,
    calLink,
    clientName,
    clientEmail
  };
}

app.get("/api/availability", async (req, res) => {
  try {
    const fetchRes = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQsh1qCZM40SIpT0uIMHvzMbA9IMfFBCggpGglMujctqfI4YZyQmlBj0fq4TSS6OgttDaVgXdYvlNnn/pub?gid=678558272&single=true&output=csv");
    if (fetchRes.ok) {
      const text = await fetchRes.text();
      return res.send(text);
    } else {
      return res.status(fetchRes.status).json({ error: "Failed to fetch from Google Sheets" });
    }
  } catch (err: any) {
    console.error("Error in /api/availability:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Contact Form submission logic using nodemailer
app.post("/api/contact", contactLimiter, async (req, res) => {
  let { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields: name, email, message" });
  }

  // Sanitize and trim user inputs (prevents header injection)
  name = String(name).trim().replace(/[\r\n]+/g, ' ');
  email = String(email).trim().toLowerCase();
  subject = subject ? String(subject).trim().replace(/[\r\n]+/g, ' ') : '';
  message = String(message).trim();

  // Strict email regex validation
  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  // Reject disposable/temporary domains
  const disposableDomains = ['mailinator.com', 'tempmail.com', '10minutemail.com', 'throwawaymail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1];
  if (disposableDomains.includes(domain)) {
    return res.status(400).json({ error: "Disposable email addresses are not allowed." });
  }

  // Reject obvious spam signatures in message
  const spamSignatures = ['http://', 'https://', '<script', '</a>', 'viagra', 'crypto', 'casino'];
  const lowerMessage = message.toLowerCase();
  if (spamSignatures.some(sig => lowerMessage.includes(sig))) {
    return res.status(400).json({ error: "Message contains prohibited content or links." });
  }

  try {
    let emailSent = false;
    let emailError = null;

    // 1. Send via Resend if RESEND_API_KEY is available
    if (process.env.RESEND_API_KEY) {
      try {
        const toEmail = process.env.RESEND_TO_EMAIL;
        const resend = new Resend(process.env.RESEND_API_KEY);
        const safeName = (name || "User").replace(/[^a-zA-Z0-9\s]/g, "").trim();
        const { error } = await resend.emails.send({
          from: `${safeName} via Contact Form <onboarding@resend.dev>`,
          replyTo: email,
          to: toEmail,
          subject: `[Contact Form] ${subject}`,
          text: `You have received a new message from your website contact form.\n\nFrom: ${name} <${email}>\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; line-height: 1.5;">
              <h2>New Contact Form Message</h2>
              <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <hr />
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          `
        });

        if (error) {
          console.error("Resend API Error:", error);
          emailError = error;
        } else {
          emailSent = true;
        }
      } catch (err) {
        console.error("Error executing Resend API:", err);
        emailError = err;
      }
    } else {
      console.warn("RESEND_API_KEY not configured in environment.");
    }

    // 2. Trigger Make.com Webhook
    let makeWebhookTriggered = false;
    const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (makeWebhookUrl) {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json"
        };
        const makeApiKey = process.env.MAKE_API_KEY || process.env.MAKE_WEBHOOK_API_KEY;
        if (makeApiKey) {
          headers["x-make-apikey"] = makeApiKey;
        }

        const makeResponse = await fetch(makeWebhookUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
            submittedAt: new Date().toISOString(),
            source: "website_contact_form"
          })
        });

        if (makeResponse.ok) {
          makeWebhookTriggered = true;
          console.log("Successfully delivered contact form submission to Make.com Webhook.");
        } else {
          console.error("Make.com Webhook responded with HTTP status:", makeResponse.status);
        }
      } catch (webhookErr) {
        console.error("Error sending to Make.com Webhook:", webhookErr);
      }
    }

    // If neither service is configured or succeeded, but input is valid, respond with status details
    if (!emailSent && !makeWebhookTriggered && emailError) {
      return res.status(500).json({ error: "Failed to process message delivery. Please try again later." });
    }

    return res.json({
      success: true,
      message: "Your message has been received by Von! He'll get back to you within 24 hours.",
      resend: emailSent,
      makeWebhook: makeWebhookTriggered
    });
  } catch (error) {
    console.error("Unexpected error handling contact form:", error);
    return res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Incoming Webhook endpoint for Make.com callbacks or automation triggers
app.post("/api/webhook/make", async (req, res) => {
  const apiKeyHeader = req.headers["x-make-apikey"];
  const expectedApiKey = process.env.MAKE_API_KEY || process.env.MAKE_WEBHOOK_API_KEY;

  if (expectedApiKey && apiKeyHeader !== expectedApiKey) {
    return res.status(401).json({ error: "Unauthorized: Invalid x-make-apikey header." });
  }

  console.log("Received incoming webhook payload from Make.com:", req.body);

  return res.json({
    status: "success",
    receivedAt: new Date().toISOString(),
    message: "Webhook received successfully"
  });
});

// Incoming Webhook endpoint for Resend events
app.post("/api/webhook/resend", async (req, res) => {
  console.log("Received Resend webhook event:", req.body);
  return res.json({ status: "success" });
});


// Helper function for smart offline fallback when Gemini API hits quota limits or is unavailable
function getOfflineKnowledgeResponse(userQuery: string): string {
  const query = userQuery.toLowerCase().trim();

  // Contact / Hire
  if (query.includes("contact") || query.includes("email") || query.includes("hire") || query.includes("reach") || query.includes("available") || query.includes("rate") || query.includes("contract")) {
    return "You can reach **Von** directly via email at **se7enlabs.tech@gmail.com**!\n\n**Von** and **SE7ENLABS** are open for freelance AI automation contracts, workflow audits, custom AI agent builds, and full-stack integrations. Operating from the Philippines (PHT UTC+8), serving clients globally.";
  }

  // Projects / Portfolio / Automations
  if (query.includes("project") || query.includes("portfolio") || query.includes("automation") || query.includes("work") || query.includes("lead") || query.includes("invoice") || query.includes("voice") || query.includes("n8n")) {
    return "Here are **Von's** headline AI automation systems built at **SE7ENLABS**:\n\n- **Autonomous Lead Enrichment Engine**: Self-hosted n8n + Claude AI workflow that enriches inbound leads, scores company fit, and drafts personalized intros with 1-click Slack approval. Reclaimed **18 hours/week** and cut response times from 14h to 3min.\n- **AI Voice Booking Dispatcher**: 24/7 conversational voice receptionist (<800ms latency) built with Make.com, Vapi AI, and GPT-4o that captured **100% of out-of-hours calls** and booked 42 appointments in month 1.\n- **Production Invoice & Receipt Recorder**: Hardened n8n pipeline using Google Gemini for financial document extraction with SHA-256 duplicate hashing, confidence gating (>0.9), and human-in-the-loop Slack review.\n- **AI Thought Leadership System**: RSS aggregation pipeline using Zapier, Claude AI, and Airtable that grew LinkedIn impressions by **210% in 60 days**.\n- **Data Analysis Portfolio**: Tableau 5-Year Sales Dashboard ($85M revenue analysis), PostgreSQL End-to-End Sales DB, and Excel Sales Drivers Analysis.\n\nWhich workflow or system would you like to explore further?";
  }

  // Skills / Stack / Tools
  if (query.includes("skill") || query.includes("stack") || query.includes("tool") || query.includes("python") || query.includes("sql") || query.includes("tableau") || query.includes("code") || query.includes("agent")) {
    return "**Von's** technical stack and core competencies include:\n\n- **Automation & Orchestration**: **n8n** (self-hosted Docker v2.21.7), Make.com, Zapier, Webhooks, REST APIs\n- **AI & LLM Integration**: OpenAI GPT-4o, Claude AI, Gemini, RAG architectures, Vector Search (Pinecone/Supabase), Prompt Engineering\n- **Databases & Analytics**: SQL, PostgreSQL, Supabase, Excel, Tableau, Power BI\n- **AI Coding Tooling**: Claude Code, OpenCode (driving via GLM backends), MCP servers (e.g. n8n-mcp)\n- **Deployment**: Docker, self-hosted Linux container environments\n\nFeel free to ask about any specific tool or integration!";
  }

  // Experience / Career Arc / Background
  if (query.includes("experience") || query.includes("background") || query.includes("bio") || query.includes("career") || query.includes("history") || query.includes("d'orsogna") || query.includes("intermedia")) {
    return "**Von's** professional arc spans four key milestones:\n\n- **Data Analysis Era (Manufacturing & Logistics)**: ~3 years at D'Orsogna (Perth, Australia) managing warehouse operations, inventory accuracy (boosted logistics efficiency by **10%**), and building SQL databases and Tableau dashboards ($85M revenue analysis).\n- **Digital Marketing Era**: Currently at Intermedia handling data analysis, market research, ad creative strategy, AI-assisted competitor scraping, and Google Apps Script automations.\n- **Sales & Customer Support**: ~3 years at Ibex/Frontier Communications (ranked **top 5 in sales for 3 straight months**) and ~3 years as Social Media Evaluator at Meta/ByteDance.\n- **AI Workflow Engineering (Current Era)**: Architecting end-to-end automation pipelines, AI agents, RAG systems, and n8n workflows at **SE7ENLABS**.";
  }

  // Education
  if (query.includes("education") || query.includes("degree") || query.includes("college") || query.includes("school") || query.includes("certificate") || query.includes("cs50")) {
    return "**Von's** education and certifications include:\n\n- **Bachelor of Science in Business Administration, Major in Marketing** — Holy Name University\n- **CS50: Introduction to Computer Science** — Harvard University / edX\n- **Data Analyst Bootcamp** — Alex Freberg";
  }

  // Easter Egg: Automate me / roast
  if (query.includes("automate me") || query.includes("roast")) {
    return "SYSTEM AUDIT INITIATED: Scanning manual workflows... WARNING! Detected high levels of manual spreadsheet copying, repetitive CRM data entry, and browser tabs overloaded with unread notifications. Diagnosis: You need an **n8n** autonomous pipeline immediately! Let's automate those manual tasks before your copy-paste keys wear out!";
  }

  // Off-topic guardrail
  if (query.includes("recipe") || query.includes("weather") || query.includes("math") || query.includes("crypto") || query.includes("joke") || query.includes("movie")) {
    return "I am only configured to answer questions about **SE7ENLABS** or about **Von**! How can I help you learn about his AI automation projects, tech stack, or services?";
  }

  // Default welcome response
  return "Hello! I'm **Vincent**, **Von's** AI automation assistant at **SE7ENLABS**. Von is an AI Workflow Engineer specializing in building autonomous n8n pipelines, AI voice dispatchers, and lead enrichment engines.\n\nYou can ask me about:\n- **Von's Portfolio Projects** (n8n, Claude AI, Gemini, Make.com)\n- **Core Tech Stack & Skills**\n- **Career History & Background**\n- **Contact & Service Availability** (**se7enlabs.tech@gmail.com**)\n\nHow can I help you today?";
}

// AI Assistant Chat endpoint
app.post("/api/chat", chatLimiter, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid request payload. Expected 'messages' array." });
  }

  // Get last user message text
  const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";

  if (!aiClient) {
    // Graceful fallback when API key is missing
    const fallbackText = getOfflineKnowledgeResponse(lastUserMsg);
    return res.json({
      role: "model",
      text: fallbackText,
    });
  }

  try {
    // Prepare multi-turn conversation history for Gemini API
    let conversation = messages.map((m: any) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content || "" }],
    }));

    // Ensure conversation starts with a user turn
    const firstUserIndex = conversation.findIndex((m: any) => m.role === "user");
    if (firstUserIndex !== -1) {
      conversation = conversation.slice(firstUserIndex);
    }

    if (conversation.length === 0) {
      return res.status(400).json({ error: "No user messages provided." });
    }

    const systemInstruction = `You are "Vincent", an efficient, sharp AI automation assistant representing Von and SE7ENLABS.

IDENTITY & PERSONA:
- Bot Name: Vincent. (NEVER call yourself "Aura-Bot" or any other name).
- Tone: Professional, friendly, natural, and sleek. Avoid robotic, corny, or generic greetings. Sound like an efficient, sharp technical assistant representing Von.
- Portfolio Owner: Refer to the portfolio owner strictly as "Von".
- Do NOT mention "Boon Mercado" or "Boon" in any initial responses or standard greetings unless the user explicitly asks about his full legal name or identity background.
- Brand / Agency: SE7ENLABS.
- Role of Von: AI Workflow Engineer | AI Automation Developer | Business Process Automation Specialist.
- Contact Email: se7enlabs.tech@gmail.com
- Timezone: Philippines (PHT UTC+8), serving clients globally.
- Status: Open for freelance automation contracts, workflow audits, custom AI agent builds, and full-stack integrations.

CRITICAL GUARDRAILS & SCOPE LIMIT:
- You MUST ONLY answer questions about SE7ENLABS, Von, his portfolio, AI automation workflows, projects, background, skills, experience, education, pricing/availability, or contact details.
- DO NOT ADD OR INVENT ANYTHING besides what is explicitly in this system prompt and website content (e.g., contact email is STRICTLY se7enlabs.tech@gmail.com).
- DO NOT answer questions about unrelated topics (e.g., general world trivia, math homework, recipes, news, weather, unrelated coding, or general AI topics outside of SE7ENLABS and Von).
- If a user asks an off-topic or unrelated question, decline politely and state:
"I am only here if you have questions about SE7ENLABS or about Von! How can I help you learn about his AI automation projects or services?"

FORMATTING RULES:
- Use double asterisks (**text**) SMARTLY and SELECTIVELY:
  * For names & brands: e.g. **Von**, **Vincent**, **SE7ENLABS**
  * For bullet point titles/labels: e.g. - **Autonomous Lead Enrichment**: ...
  * For select key metrics or primary tools when relevant: e.g. **n8n**, **18 hours/week**
- DO NOT over-bold full sentences, entire clauses, or long blocks of text. Keep emphasis subtle, elegant, and sparse.
- DO NOT use hash symbols (#) or markdown headers.
- Use simple dash bullet points (- item) for lists.

CAREER HISTORY & ARC:
1. Data Analysis Era (Manufacturing & Logistics): Worked ~3 years at D'Orsogna (Perth, Western Australia) in Operations/Despatch managing warehouse, stock accuracy (boosted logistics efficiency by 10% using Excel audits), and HACCP/GMP compliance. Built end-to-end SQL databases in PostgreSQL, Tableau 5-year sales performance dashboards ($85M revenue analysis), and Excel sales drivers analysis.
2. Digital Marketing Era: Works at Intermedia handling data analysis, market research, campaign strategy, ad creatives, and AI-assisted competitor scraping/monitoring. Automates Google Workspace workflows using Google Apps Script.
3. Sales & Customer Support: ~3 years at Ibex / Frontier Communications (ranked top 5 in sales for 3 straight months). ~3 years as Social Media Evaluator at Meta & ByteDance tagging digital content and analyzing platform trends.
4. AI Workflow Engineering & Automation (Current Era): Builds intelligent end-to-end automation pipelines, AI agents, RAG systems, vector search solutions, and scalable backend integrations using n8n (self-hosted Docker v2.21.7), Make.com, Zapier, OpenAI GPT-4o, Claude AI, Gemini, Supabase, Pinecone, and REST APIs.
5. AI Coding Tooling: Proficient with agentic CLI tools including Claude Code, OpenCode (driving via alternative backends like GLM), and MCP servers (e.g. n8n-mcp).

PORTFOLIO PROJECTS & WORKFLOWS SHOWCASE:
1. Financial Document Processing Pipeline (n8n, Google Drive, Google Sheets, Gemini, Slack): Automates invoice processing by detecting new uploads in Google Drive, validating files, preventing duplicate entries, extracting invoice data with AI, verifying confidence levels, routing uncertain invoices for manual approval, recording validated data in Google Sheets, organizing processed files, and notifying the team through Slack.
2. Social Media Publishing Automation (Make.com, Google Sheets, OpenAI GPT-5 Nano, Facebook Pages API): Automates Facebook publishing from a Google Sheets calendar. It generates AI captions, publishes posts, and logs status updates. Contributors supply artwork and core messaging, enabling consistent publishing without requiring direct page access.
3. AI Personal Assistant & Knowledge Chatbot (Gemini AI, Express.js, React, Resend, Cal.com): An intelligent AI assistant designed to handle visitor inquiries, answer questions using a grounded knowledge base, and trigger automated workflows such as contact forms and calendar scheduling.
4. AI-Powered Lead Management System (JotForm, Zapier, Google Sheets, Gmail, Slack, Google Drive): This workflow in Zapier automates end-of-day sales reporting by collecting daily lead activity, calculating key sales metrics, generating an AI-powered performance summary, recording the results, and delivering a formatted report to the team through Slack.
5. Data Analysis Projects (Prior Era): Sales Report Analysis (Excel customer drivers & commute analysis), End-to-End SQL Sales Database (PostgreSQL database for sales queries), and 5-Year Sales Performance Analysis (Tableau interactive dashboard tracking $85M revenue).

PROFESSIONAL PHILOSOPHY:
- Good automation isn't about wiring AI into every step — it's about knowing exactly where AI adds value and where it doesn't. Workflows should be architected so AI processing is applied only where judgment or unstructured understanding is genuinely required, with deterministic logic, filters, and rule-based steps handling everything else.
- Reliability matters as much as intelligence. Every workflow should assume things will go wrong and handle it gracefully. That means validation at every handoff, confidence thresholds before anything is trusted automatically, human-in-the-loop review for edge cases, and clear alerting.
- Ultimately, the measure of good automation isn't how advanced the AI is — it's whether it saves real time, real money, and real headcount without introducing new risk.

AI AGENT TOOL CAPABILITIES & ACTIONS:
- If a user wants to send an email, message, or contact Von: output the exact text [ACTION: SHOW_CONTACT_FORM] and nothing else for that part of the request.
- If a user wants to book a schedule, meeting, or discovery call: output the exact text [ACTION: SHOW_CALENDAR_FORM] and nothing else for that part of the request.
- Do NOT attempt to ask for their email or name inside the chat. The form will handle that for you. Just explain you are opening the form, and append the exact [ACTION] token.

INTERACTION & STYLE GUIDELINES:
- Be concise, articulate, tech-savvy, and natural. Avoid corporate fluff or sales hype.
- EASTER EGG: If the user says/types "automate me" or requests an "automation roast", deliver a fun, witty, sci-fi-themed "automation roast" targeting manual spreadsheet copying, manual CRM entry, or repetitive copy-pasting (without using * or #)!`;

    // Try valid Gemini models in sequence
    const modelsToTry = ["gemini-3.6-flash", "gemini-3.1-pro-preview", "gemini-flash-latest"];
    let responseText: string | null = null;
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: conversation,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            tools: [],
          },
        });

        if (response?.text) {
          responseText = response.text;
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${modelName} returned error:`, err?.message || err);
      }
    }

    if (!responseText) {
      // If all Gemini API calls fail (e.g. Quota Exceeded 429), use offline knowledge base engine
      console.warn("All Gemini models exhausted or quota exceeded. Falling back to offline knowledge engine.", lastError);
      const offlineReply = getOfflineKnowledgeResponse(lastUserMsg);
      return res.json({
        role: "model",
        text: offlineReply,
      });
    }

    return res.json({
      role: "model",
      text: responseText,
    });
  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    const offlineReply = getOfflineKnowledgeResponse(lastUserMsg);
    return res.json({
      role: "model",
      text: offlineReply,
    });
  }
});

// Setup Vite Dev server or serve static dist
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
