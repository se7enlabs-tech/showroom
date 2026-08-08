import leadEnrichmentImg from "../assets/images/regenerated_image_1785600329065.png";
import aiVoiceImg from "../assets/images/regenerated_image_1785404501451.png";
import aiAssistantImg2 from "../assets/images/regenerated_image_1785404504001.png";
import customerTriageImg from "../assets/images/regenerated_image_1785600326680.png";

export interface ProjectStep {
  title: string;
  description: string;
  details?: string[];
  image?: string;
}

export interface ProjectStage {
  stageNumber: number;
  stageTitle: string;
  steps: ProjectStep[];
}

export interface ScenarioSlide {
  image: string;
  description: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  subtitle?: string;
  tagline: string;
  category: string;
  tags: string[];
  thumbnail: string;
  images: string[];
  videoDemo?: string;
  overview: string;
  challenge: string;
  solution: string;
  results: string;
  tools: string[];
  liveUrl?: string;
  featured: boolean;
  date: string;
  stages?: ProjectStage[];
  scenarioSlides?: ScenarioSlide[];
}

export const PROJECTS_DATA: ProjectDetail[] = [
  {
    id: "multi-agent-lead-enrichment",
    title: "Financial Document Processing Pipeline",
    subtitle: "with Intelligent OCR, Validation & Slack Routing",
    tagline: "Automates invoice processing with Google Drive detection, AI data extraction, automated validation, and team alerts.",
    category: "WORKFLOW AUTOMATION",
    tags: ["n8n", "Google Drive", "Google Sheets", "Gemini", "Slack"],
    thumbnail: leadEnrichmentImg,
    images: [
      leadEnrichmentImg,
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "This workflow automates invoice processing by detecting new uploads in Google Drive, validating files, preventing duplicate entries, extracting invoice data with AI, verifying confidence levels, routing uncertain invoices for manual approval, recording validated data in Google Sheets, organizing processed files, and notifying the team through Slack.",
    challenge: "Manual invoice processing is slow and error-prone, leaving finance teams vulnerable to duplicate payments, corrupted files, and costly data entry mistakes.",
    solution: "This automated pipeline delivers a resilient, hands-free payables engine that verifies document integrity and extracts high-accuracy financial data. By combining AI precision with human-in-the-loop validation for edge cases, it guarantees 100% data reliability without operational bottlenecks.",
    results: "Saved 12 hours/week on manual data entry, eliminated duplicate and invalid invoice submissions, reduced document processing time from days to seconds, and achieved a 99%+ automated data extraction accuracy rate with fail-safe human review.",
    tools: ["n8n", "Google Drive", "Google Sheets", "Gemini", "Slack"],
    videoDemo: "https://player.vimeo.com/video/1213603546?title=0&byline=0&portrait=0&badge=0&autopause=0&dnt=1",
    liveUrl: "https://n8n.io",
    featured: true,
    date: "2024-05",
    stages: [
      {
        stageNumber: 1,
        stageTitle: "STAGE 1: INBOUND CAPTURE & AI RESEARCH",
        steps: [
          {
            title: "Step 1: Webhook Trigger from Form Submission",
            description: "The n8n workflow triggers instantaneously when a prospect submits a contact form on the website.",
            details: [
              "Lead Name & Work Email",
              "Company Name & Website",
              "Self-reported Budget & Primary Pain Points"
            ]
          },
          {
            title: "Step 2: Automated Profile & Company Enrichment",
            description: "Queries Apollo.io and Google Search APIs to retrieve verified company revenue, headcount, tech stack, and executive LinkedIn URLs.",
            details: [
              "Verified Executive Title & Seniority",
              "Company Size & Funding Stage",
              "Tech Stack Tags"
            ]
          },
          {
            title: "Step 3: Claude AI Fit Scoring & Pain-Point Analysis",
            description: "Claude 3.5 Sonnet evaluates enriched data against Ideal Customer Profile (ICP) criteria and assigns a numeric score (0-100).",
            details: [
              "Calculates ICP match percentage",
              "Extracts top 3 strategic pain points",
              "Flags high-priority Enterprise opportunities"
            ]
          }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: "STAGE 2: CRM ROUTING & SLACK APPROVAL",
        steps: [
          {
            title: "Step 4: Hyper-Personalized Intro Email Draft",
            description: "Generates a bespoke outreach draft tailored specifically to the prospect's company size, tech stack, and industry challenges.",
            details: [
              "Natural, non-robotic tone",
              "Direct references to company pain points",
              "Context-aware call to action"
            ]
          },
          {
            title: "Step 5: Interactive Slack Notification for Account Executives",
            description: "Delivers an instant card in Slack with full enriched context and interactive buttons [Approve & Send] [Edit Draft] [Reject].",
            details: [
              "Enriched Lead Dossier in Slack",
              "One-click approval sending via Gmail/Outlook",
              "Automatic sync to HubSpot CRM deals pipeline"
            ]
          }
        ]
      }
    ],
    scenarioSlides: [
      { image: leadEnrichmentImg, description: "Lead submits an inbound form on the website, triggering the n8n webhook listener." },
      { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", description: "Enrichment engines query Apollo.io & LinkedIn to gather company headcount and tech stack." },
      { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", description: "Claude AI analyzes prospect data, scores the lead, and drafts a personalized response." },
      { image: "/img/4.png", description: "Account executives receive a Slack dossier with prospect intelligence and a 1-click approve button." },
      { image: "/img/3.png", description: "Upon approval, email is dispatched and lead profile is automatically synchronized with HubSpot." }
    ]
  },
  {
    id: "ai-social-media-publishing",
    title: "Social Media Publishing Automation",
    subtitle: "with AI Caption Generation & Scheduled Facebook Publishing",
    tagline: "Automates scheduled Facebook publishing with AI caption generation, automatic posting, and status logging.",
    category: "WORKFLOW AUTOMATION",
    tags: ["Make.com", "Google Sheets", "OpenAI GPT-5 Nano", "Facebook Pages API"],
    thumbnail: aiVoiceImg,
    images: [
      aiVoiceImg,
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80"
    ],
    videoDemo: "https://player.vimeo.com/video/1212693671?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479",
    overview: "A Make.com workflow that automates Facebook publishing from a Google Sheets calendar. It generates AI captions, publishes posts, and logs status updates. Contributors supply artwork and core messaging, enabling consistent publishing without requiring direct page access.",
    challenge: "Managing shared social media requires multiple contributors to access the primary Facebook account. This compromises security, increases manual effort, and leads to inconsistent publishing schedules.",
    solution: "Centralized content planning in Google Sheets to eliminate the need for direct Facebook access. The workflow automatically generates AI captions, publishes scheduled posts, and records status updates.",
    results: "Eliminated 100% of shared credential risks and reduced manual posting time by 80% by automating Facebook caption generation and scheduling, shifting full team focus to content creation.",
    tools: ["Make.com", "Google Sheets", "OpenAI GPT-5 Nano", "Facebook Pages API"],
    featured: true,
    date: "2024-06"
  },
  {
    id: "personal-ai-assistant",
    title: "AI Personal Assistant & Knowledge Chatbot",
    subtitle: "with Intelligent Context, Multi-Model AI Routing & Automated Actions",
    tagline: "An intelligent conversational AI agent that provides context-aware answers, automates inquiry handling, and routes action requests seamlessly.",
    category: "AI AGENTS",
    tags: ["Gemini AI", "Express.js", "AI Agent", "Resend API", "Cal.com"],
    thumbnail: aiAssistantImg2,
    images: [
      aiAssistantImg2,
      "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "An intelligent AI assistant designed to handle visitor inquiries, answer questions using a grounded knowledge base, and trigger automated workflows such as contact forms and calendar scheduling.",
    challenge: "Answering recurring visitor questions and capturing qualified leads manually takes significant time and delays response times for potential clients.",
    solution: "Deployed a conversational AI assistant powered by Gemini models that delivers instant context-aware answers, routes complex inquiries, and automatically triggers action flows for scheduling and contact requests.",
    results: "Reduced first-response times to under 3 seconds, automated recurring inquiry handling by 85%, and streamlined client booking through direct AI action triggers.",
    tools: ["Gemini AI", "Express.js", "React", "Resend", "Cal.com"],
    videoDemo: "https://player.vimeo.com/video/1212693671?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479",
    liveUrl: "https://chat.openai.com",
    featured: false,
    date: "2024-08",
    stages: [
      {
        stageNumber: 1,
        stageTitle: "STAGE 1: CONVERSATIONAL AGENT & KNOWLEDGE RETRIEVAL",
        steps: [
          {
            title: "Step 1: Context-Aware Query Processing",
            description: "The AI agent receives user questions and evaluates conversational history against the grounded knowledge base.",
            details: [
              "Natural language understanding & context tracking",
              "Multi-turn conversation memory",
              "Customized persona & knowledge grounding"
            ]
          },
          {
            title: "Step 2: Multi-Model AI Routing & Fallback",
            description: "Routes inquiries through high-capacity AI models with automated fallback logic to ensure uninterrupted response availability.",
            details: [
              "Multi-model AI hierarchy routing",
              "Rate limit management & load handling",
              "Fail-safe response delivery engine"
            ]
          }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: "STAGE 2: INTENT RECOGNITION & ACTION TRIGGERING",
        steps: [
          {
            title: "Step 3: Intelligent Intent Recognition",
            description: "Detects user intent during conversation, such as interest in booking a discovery call or sending a project inquiry.",
            details: [
              "Lead intent classification & routing",
              "Automated action token generation",
              "Interactive UI modal triggers"
            ]
          },
          {
            title: "Step 4: Automated Communication & Scheduling",
            description: "Triggers direct integrations with email dispatch and calendar scheduling based on user requests.",
            details: [
              "Automated email dispatch via Resend API",
              "Seamless calendar booking via Cal.com",
              "Real-time conversation logging"
            ]
          }
        ]
      }
    ],
    scenarioSlides: [
      { image: aiAssistantImg2, description: "User initiates conversation with the AI assistant." },
      { image: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=1200&q=80", description: "AI processes query against the grounded knowledge base." },
      { image: "/img/2.png", description: "Multi-model routing generates a context-aware response." },
      { image: "/img/5.png", description: "AI identifies scheduling intent and triggers booking workflow." },
      { image: "/img/8.png", description: "Confirmation dispatched automatically via email and calendar sync." }
    ]
  },
  {
    id: "customer-triage-rag-bot",
    title: "AI-Powered Lead Management System",
    subtitle: "with Intelligent Email Automation & Daily Reporting",
    tagline: "Automatically captures leads, analyzes lead quality, drafts AI-powered email responses, and generates daily lead activity reports.",
    category: "WORKFLOW AUTOMATION",
    tags: ["JotForm", "Zapier", "Google Sheets", "Gmail", "Slack", "Google Drive"],
    thumbnail: customerTriageImg,
    images: [
      customerTriageImg,
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80"
    ],
    overview: "This workflow in Zapier automates end-of-day sales reporting by collecting daily lead activity, calculating key sales metrics, generating an AI-powered performance summary, recording the results, and delivering a formatted report to the team through Slack.",
    challenge: "Sales teams often spend time manually compiling daily lead data, calculating performance metrics, and preparing end-of-day reports, making the process repetitive and prone to delays or errors.",
    solution: "This workflow automatically consolidates daily lead activity, generates key sales insights with AI, records the results, and delivers a formatted report to Slack, providing the team with a timely and consistent summary each day.",
    results: "Automated 65% of common queries with 100% accuracy, dropping average first-response times from 24 hours to under 5 minutes.",
    tools: ["JotForm", "Zapier", "Google Sheets", "Gmail", "Slack", "Google Drive"],
    liveUrl: "https://n8n.io",
    featured: true,
    date: "2024-04",
    stages: [
      {
        stageNumber: 1,
        stageTitle: "STAGE 1: TRIGGER AND AI ANALYSIS",
        steps: [
          {
            title: "Step 1: New Submission in JotForm",
            description: "The system triggers when a lead submits a form. In this example, the lead is asking if a specific property is available in the Bisaya language.",
            details: [
              "Name, Email, Phone Number",
              "Interest, Property Type, Preferred Location",
              "Budget & Custom Notes"
            ]
          },
          {
            title: "Step 2: AI Quality Assessment & Filtering",
            description: "AI assesses lead quality and structures the data, then a filter removes spam. Valid leads are logged in a Google Sheet and categorized by intent and score.",
            details: [
              "Spam & Bot Detection",
              "Google Sheets Record Logging",
              "Categorization by Intent & Lead Score"
            ]
          },
          {
            title: "Step 3: Intent Triage & Branching",
            description: "The AI identifies inquiry intent (Hot Lead vs Cold Lead vs General Inquiry) and branches the execution path.",
            details: [
              "Hot Leads routed to instant Slack alert & immediate draft reply",
              "Cold Leads categorized for nurturing sequence",
              "Spam entries archived silently"
            ]
          }
        ]
      },
      {
        stageNumber: 2,
        stageTitle: "STAGE 2: AUTOMATED EMAIL DRAFTING & SLACK APPROVAL",
        steps: [
          {
            title: "Step 4: Interactive Slack Notification",
            description: "A detailed notification card is delivered to the sales Slack channel.",
            details: [
              "Prospect profile summary & score",
              "Proposed AI-crafted email reply",
              "Interactive [Approve] and [Decline] action buttons"
            ]
          },
          {
            title: "Step 5: Message Approval & Email Dispatch",
            description: "Upon approval, the system dispatches the email via Gmail and updates lead status to 'Replied' in master spreadsheet.",
            details: [
              "Instant Gmail dispatch",
              "Master spreadsheet status update",
              "Audit log trail recorded"
            ]
          }
        ]
      },
      {
        stageNumber: 3,
        stageTitle: "STAGE 3: DAILY SUMMARY & KPI REPORTING",
        steps: [
          {
            title: "Step 6: End-of-Day Daily Digest Generation",
            description: "At end of day, the workflow aggregates total leads captured, conversion percentages, and metrics.",
            details: [
              "Calculates lead volume & response metrics",
              "Updates 'Day Summary' master spreadsheet",
              "Posts daily performance report in Slack team channel"
            ]
          }
        ]
      }
    ],
    scenarioSlides: [
      { image: "/img/6.png", description: "The system triggers when a lead submits a form. In this example, the lead is asking if a specific property is available in the Bisaya language." },
      { image: "/img/1.png", description: "The AI assesses the lead quality and structures the data, then a filter removes spam. Valid leads are logged in a Google Sheet and categorized by intent and score." },
      { image: "/img/2.png", description: "In this scenario, the AI identifies the inquiry as a hot lead. It routes the data to the 'Hot Lead' path, which notifies the team via Slack and immediately drafts a reply to the customer." },
      { image: "/img/4.png", description: "This is what the notification will look like in Slack for a hot lead." },
      { image: "/img/5.png", description: "A draft reply is sent to a Slack channel for review. The user can approve the message or click 'Decline' to make edits. In this scenario, the drafted message was approved." },
      { image: "/img/3.png", description: "Once approved, the system sends the email to the lead and automatically updates their status to 'Replied' in the master spreadsheet." },
      { image: "/img/email ss.png", description: "This is the automated email sent to the lead, tailored specifically to address their inquiry." },
      { image: "/img/excel ss.png", description: "Finally, all records are logged into a comprehensive spreadsheet for tracking and reporting." },
      { image: "/img/8.png", description: "At the end of each day, the system automatically compiles a comprehensive daily digest, summarizing the total number of leads captured and categorized." },
      { image: "/img/7.png", description: "This data is automatically recorded into a 'Day Summary' spreadsheet, creating a reliable historical log of daily lead performance." },
      { image: "/img/9.png", description: "A complete report is simultaneously routed to a dedicated Slack channel, giving the entire team an instant overview of the day's metrics to track progress against KPIs and strategic goals." }
    ]
  }
];

export function getProjectDetail(id: string): ProjectDetail | undefined {
  return PROJECTS_DATA.find((p) => p.id === id);
}
