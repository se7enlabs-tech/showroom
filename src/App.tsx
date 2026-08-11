import React, { useState, useEffect } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Cpu,
  Workflow,
  Link,
  Bot,
  CheckCircle,
  Menu,
  X,
  PhoneCall,
  Mail,
  Linkedin,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText,
  Network,
  CalendarDays,
  Sun,
  Moon,
  Rocket
} from "lucide-react";
import { 
  SiZapier, SiN8N, SiMake, SiPython, SiAirtable, SiNotion, 
  SiGmail, SiHubspot, SiSupabase, SiCalendly, SiAnthropic,
  SiNgrok, SiDocker
} from "react-icons/si";
import { FaSlack } from "react-icons/fa6";
import { PROJECTS_DATA, getProjectDetail, ProjectDetail } from "./data/projectsData";
import { Project, ContactFormData } from "./types";
import GlassCard from "./components/GlassCard";
import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";
import ChatBubble from "./components/ChatBubble";
import NetworkBackground from "./components/NetworkBackground";
import CalEmbed from "./components/CalEmbed";
import { OpenAI } from '@lobehub/icons';

const ToolIcon = ({ name, className, style }: { name: string, className?: string, style?: React.CSSProperties }) => {
  const props = { className, style };
  switch (name) {
    case "n8n": return <SiN8N {...props as any} />;
    case "Make.com": return <SiMake {...props as any} />;
    case "Zapier": return <SiZapier {...props as any} />;
    case "GoHighLevel": return <Rocket {...props as any} />;
    case "Claude AI": return <SiAnthropic {...props as any} />;
    case "ChatGPT": return <OpenAI {...props as any} size={24} />;
    case "Python": return <SiPython {...props as any} />;
    case "Airtable": return <SiAirtable {...props as any} />;
    case "Notion": return <SiNotion {...props as any} />;
    case "Slack": return <FaSlack {...props as any} />;
    case "Gmail": return <SiGmail {...props as any} />;
    case "HubSpot": return <SiHubspot {...props as any} />;
    case "Supabase": return <SiSupabase {...props as any} />;
    case "Vapi AI": return <Bot {...props as any} />;
    case "Calendly": return <SiCalendly {...props as any} />;
    case "ngrok": return <SiNgrok {...props as any} />;
    case "Docker": return <SiDocker {...props as any} />;
    default: return <Sparkles {...props as any} />;
  }
};

const getToolBrandColor = (name: string) => {
  switch (name) {
    case "n8n": return "#FF6C37";
    case "Make.com": return "#8846FF";
    case "Zapier": return "#FF4A00";
    case "GoHighLevel": return "#006CFF";
    case "Claude AI": return "#D1B898";
    case "ChatGPT": return "var(--color-chatgpt)";
    case "Python": return "#3776AB";
    case "Airtable": return "#F82B60";
    case "Notion": return "#FFFFFF";
    case "Slack": return "#E01E5A"; 
    case "Gmail": return "#EA4335";
    case "HubSpot": return "#FF7A59";
    case "Supabase": return "#3ECF8E";
    case "Vapi AI": return "#6366F1";
    case "Calendly": return "#006BFF";
    case "ngrok": return "#031E3D";
    case "Docker": return "#2496ED";
    default: return "#00FFD1";
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "projects" | "contact">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null);
  const [projectFilter, setProjectFilter] = useState("All");
  const [availability, setAvailability] = useState<'available' | 'at_capacity' | 'loading'>('loading');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch("/api/availability");
        if (res.ok) {
          const text = await res.text();
          if (text.trim().toLowerCase() === 'not available') {
            setAvailability('at_capacity');
          } else {
            setAvailability('available');
          }
        } else {
          setAvailability('available');
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setAvailability('available');
      }
    };
    fetchAvailability();
  }, []);

  // Router effect to sync hash route (#project/id, #projects, #contact, #home)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#project/")) {
        const projId = hash.replace("#project/", "");
        const detail = getProjectDetail(projId);
        if (detail) {
          setSelectedProject(detail);
        } else {
          setSelectedProject(null);
        }
      } else if (hash === "#projects") {
        setActiveTab("projects");
        setSelectedProject(null);
      } else if (hash === "#contact") {
        setActiveTab("contact");
        setSelectedProject(null);
      } else if (hash === "#home") {
        setActiveTab("home");
        setSelectedProject(null);
      } else {
        setSelectedProject(null);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleOpenProject = (proj: Project) => {
    window.location.hash = `project/${proj.id}`;
  };

  const handleCloseProject = () => {
    if (activeTab === "projects") {
      window.location.hash = "projects";
    } else if (activeTab === "contact") {
      window.location.hash = "contact";
    } else {
      window.location.hash = "home";
    }
    setSelectedProject(null);
  };

  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      wheelMultiplier: 1.2,
      smoothWheel: true,
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      // Do not intercept if a modal (e.g. ProjectModal) is open
      if (document.querySelector('.fixed.inset-0.z-50')) return;

      if (e.key === "Home") {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.2 });
      } else if (e.key === "End") {
        e.preventDefault();
        lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.2 });
      } else if (e.key === "PageUp") {
        e.preventDefault();
        lenis.scrollTo(Math.max(0, window.scrollY - window.innerHeight), { duration: 1.2 });
      } else if (e.key === "PageDown") {
        e.preventDefault();
        lenis.scrollTo(Math.min(document.documentElement.scrollHeight, window.scrollY + window.innerHeight), { duration: 1.2 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  }, [theme]);

  // Scroll State for smaller nav bar
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Form State
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "Project Inquiry",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Stats Counters state
  const [stats, setStats] = useState({ automations: 0, hours: 0, tools: 0 });

  useEffect(() => {
    if (activeTab === "home") {
      const duration = 1200;
      const steps = 60;
      const stepTime = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setStats({
          automations: Math.min(Math.floor((5 / steps) * step), 5),
          hours: Math.min(Math.floor((500 / steps) * step), 500),
          tools: Math.min(Math.floor((10 / steps) * step), 10),
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setFormLoading(true);
    setFormSuccess(null);
    setFormError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setFormSuccess("Your message has been sent!");
        setFormData({ name: "", email: "", subject: "Project Inquiry", message: "" });
      } else {
        setFormError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setFormError("Failed to connect to the server. Please check your network and try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const projects: ProjectDetail[] = PROJECTS_DATA;
  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  const filteredProjects =
    projectFilter === "All"
      ? projects
      : projects.filter((p) => p.category === projectFilter);

  return (
    <div className="relative min-h-screen bg-aurora-bg text-slate-100 overflow-hidden font-sans">
      {/* Aurora Ambient Mesh Backdrops */}
      <div className="aurora-bg">
        <div className="aurora-glow-1" />
        <div className="aurora-glow-2" />
        <div className="aurora-glow-3" />
        
        {/* Animated Network Background */}
        <NetworkBackground theme={theme} />
      </div>

      {/* Global Navigation Header */}
      <div className="h-20 w-full relative z-50">
        <nav className={`fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300 ${scrolled ? "shadow-[0_4px_20px_rgba(15,23,42,0.15)]" : ""}`}>
          <div className={`max-w-6xl mx-auto px-6 flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-20"}`}>
          <motion.button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 font-display text-2xl font-black tracking-wider text-white hover:opacity-85 transition-opacity cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            SE7ENLABS<span className="text-aurora-teal">.</span>
            <span className="text-[10px] font-mono tracking-widest bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20 px-2 py-0.5 rounded-md uppercase ml-1">
              AI
            </span>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-full">
              {(["home", "projects", "contact"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`relative px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 capitalize cursor-pointer ${
                    activeTab === tab ? "text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.span
                      layoutId="active-tab-glow"
                      className="absolute inset-0 bg-gradient-to-r from-aurora-teal to-aurora-blue rounded-full shadow-[0_0_15px_rgba(0,255,209,0.3)]"
                      transition={{ type: "spring", stiffness: 200, damping: 25, mass: 0.5 }}
                    />
                  )}
                  <span className="relative z-10">{tab === "projects" ? "showroom" : tab}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="#ai-chat-bubble-toggle"
                onClick={(e) => {
                  e.preventDefault();
                  const btn = document.getElementById("ai-chat-bubble-toggle");
                  btn?.click();
                }}
                className="flex items-center gap-1.5 text-xs font-mono bg-aurora-teal/5 text-aurora-teal border border-aurora-teal/20 hover:border-aurora-teal/40 px-4 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(0,255,209,0.05)] cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" /> AI assistant
              </a>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-aurora-teal/30 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer flex items-center justify-center transition-all"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-aurora-teal" />
                ) : (
                  <Moon className="w-4 h-4 text-aurora-blue" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Theme Toggle & Menu */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer flex items-center justify-center transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-aurora-teal" />
              ) : (
                <Moon className="w-4 h-4 text-aurora-blue" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile slide-out glass drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`md:hidden absolute left-0 w-full glass-panel border-x-0 border-t-0 border-b border-white/10 px-6 py-6 space-y-4 z-40 shadow-2xl transition-all duration-300 ${scrolled ? "top-14" : "top-20"}`}
            >
              <div className="flex flex-col gap-2">
                {(["home", "projects", "contact"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`px-4 py-3 rounded-xl text-left font-display font-medium text-base transition-all ${
                      activeTab === tab
                        ? "bg-gradient-to-r from-aurora-teal/10 to-aurora-blue/10 text-aurora-teal border-l-4 border-aurora-teal pl-3"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    {tab === "projects" ? "SHOWROOM" : tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const btn = document.getElementById("ai-chat-bubble-toggle");
                    btn?.click();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-tr from-aurora-teal to-aurora-blue text-slate-950 font-bold"
                >
                  <Bot className="w-4 h-4" /> Ask Von's AI
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 md:py-16">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="home-tab"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-16 md:space-y-32"
            >
              {/* 1. HERO SECTION */}
              <section className="min-h-[60vh] flex flex-col justify-center items-center text-center relative py-10">
                {/* Visual Accent Badge */}
                {availability !== 'loading' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8 flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/20 text-sm text-white font-mono shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative flex h-3 w-3">
                        {availability === 'available' ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.9)]"></span>
                          </>
                        ) : (
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500 shadow-[0_0_12px_rgba(100,116,139,0.9)]"></span>
                        )}
                      </div>
                      <span className="font-semibold tracking-wide">
                        {availability === 'available' ? 'OPEN FOR PROJECTS & COLLABORATIONS' : 'CURRENTLY AT CAPACITY'}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Main Headline card */}
                <GlassCard className="max-w-3xl p-8 md:p-14 text-center rounded-[28px] relative overflow-hidden" hoverEffect={false}>
                  {/* Subtle layout pulse bg inside card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-aurora-teal/5 via-transparent to-transparent opacity-30 pointer-events-none" />

                  <h1 className="font-display text-4xl md:text-7xl font-extrabold tracking-tight text-white mb-4">
                    Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-teal via-aurora-blue to-aurora-violet">Von</span>
                  </h1>
                  <h3 className="font-display text-xl md:text-2xl font-semibold tracking-wide text-aurora-teal/95 mb-6">
                    AI Workflow Engineer
                  </h3>
                  <p className="text-slate-300 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 font-sans font-light">
                    I design cost-effective automation systems that connect your existing tools, eliminate repetitive work, and streamline daily operations. Every workflow is engineered to deliver measurable business outcomes, not unnecessary complexity. Skip the perpetual SaaS subscriptions, get a custom pipeline you actually own.
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => setActiveTab("projects")}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 font-display font-bold hover:shadow-[0_0_20px_rgba(0,255,209,0.35)] hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      View My Work
                    </button>
                    <button
                      onClick={() => setActiveTab("contact")}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display font-semibold transition-all cursor-pointer"
                    >
                      Let's Automate
                    </button>
                  </div>
                </GlassCard>
              </section>

              {/* 2. SERVICES / ABOUT */}
              <section className="space-y-10">
                <div className="text-center space-y-3">
                  <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-white">
                    What I Engineer
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
                    Practical automation systems designed to simplify operations, connect business software, and eliminate repetitive manual work.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pillar 1 */}
                  <GlassCard className="p-8 rounded-[24px]">
                    <div className="h-12 w-12 rounded-2xl bg-aurora-teal/10 border border-aurora-teal/20 text-aurora-teal flex items-center justify-center mb-6">
                      <Workflow className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">Intelligent Workflow Automation</h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans mb-4">
                      Transform repetitive business processes into reliable automated workflows that save time, reduce manual work, and improve operational efficiency.
                    </p>
                    <div className="text-[11px] font-mono text-aurora-teal/80 flex items-center gap-1 bg-aurora-teal/5 py-1 px-2 w-fit rounded border border-aurora-teal/10">
                      n8n / Make.com / Zapier / APIs
                    </div>
                  </GlassCard>

                  {/* Pillar 2 */}
                  <GlassCard className="p-8 rounded-[24px] border-aurora-violet/20 hover:border-aurora-violet/30">
                    <div className="h-12 w-12 rounded-2xl bg-aurora-violet/10 border border-aurora-violet/20 text-aurora-violet flex items-center justify-center mb-6">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">AI Document & Data Processing</h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans mb-4">
                      Extract, classify, summarize, and organize information from documents, forms, emails, and images using modern AI models.
                    </p>
                    <div className="text-[11px] font-mono text-aurora-violet/80 flex items-center gap-1 bg-aurora-violet/5 py-1 px-2 w-fit rounded border border-aurora-violet/10">
                      OpenAI / Claude / Gemini / OCR
                    </div>
                  </GlassCard>

                  {/* Pillar 3 */}
                  <GlassCard className="p-8 rounded-[24px] border-aurora-magenta/20 hover:border-aurora-magenta/30">
                    <div className="h-12 w-12 rounded-2xl bg-aurora-magenta/10 border border-aurora-magenta/20 text-aurora-magenta flex items-center justify-center mb-6">
                      <Network className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white mb-2">Business System Integrations</h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-sans mb-4">
                      Connect CRMs, Google Workspace, messaging platforms, spreadsheets, and custom APIs into a unified operational workflow.
                    </p>
                    <div className="text-[11px] font-mono text-aurora-magenta/80 flex items-center gap-1 bg-aurora-magenta/5 py-1 px-2 w-fit rounded border border-aurora-magenta/10">
                      Google Workspace / Webhook / HubSpot
                    </div>
                  </GlassCard>
                </div>
              </section>

              {/* 3. FEATURED WORK */}
              <section className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <span className="text-xs font-mono text-aurora-teal uppercase tracking-widest">SHOWCASE DEPLOYMENTS</span>
                    <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-white mt-1">
                      Featured Automations
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("projects");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1.5 text-xs font-mono text-aurora-teal hover:text-white transition-colors border-b border-aurora-teal/20 pb-0.5 cursor-pointer"
                  >
                    Explore all pipelines <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.filter((p) => p.featured).slice(0, 3).map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleOpenProject(project)}
                    />
                  ))}
                </div>
              </section>

              {/* 4. METRICS & COUNTERS */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.01] border border-white/5 rounded-[28px] p-8 text-center relative overflow-hidden">
                <div className="space-y-2">
                  <h4 className="font-display text-4xl md:text-5xl font-extrabold text-white">
                    {stats.automations}+
                  </h4>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Automations Deployed</p>
                </div>
                <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/5 py-6 md:py-0">
                  <h4 className="font-display text-4xl md:text-5xl font-extrabold text-aurora-teal">
                    {stats.hours}+
                  </h4>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Hours Saved</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-display text-4xl md:text-5xl font-extrabold text-white">
                    {stats.tools}+
                  </h4>
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-mono">Core Platforms Unified</p>
                </div>
              </section>

              {/* 5. SKILLS & TOOLS LOGO GRID */}
              <section className="space-y-8 text-center py-10">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">THE PLAYBOOK</span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Engineered Integrations
                  </h2>
                </div>

                <div className="relative flex flex-col gap-4 overflow-hidden w-full max-w-5xl mx-auto px-4 py-8 before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[80px] md:before:w-[150px] before:bg-gradient-to-r before:from-aurora-bg before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-[80px] md:after:w-[150px] after:bg-gradient-to-l after:from-aurora-bg after:to-transparent">
                  
                  {/* First Marquee Row */}
                  <div className="flex gap-4 w-max animate-marquee">
                    {[...["n8n", "Make.com", "Zapier", "GoHighLevel", "Claude AI", "ChatGPT", "Python", "Airtable", "Notion", "Slack", "Gmail", "HubSpot", "Supabase", "Vapi AI", "Calendly", "ngrok", "Docker"], ...["n8n", "Make.com", "Zapier", "GoHighLevel", "Claude AI", "ChatGPT", "Python", "Airtable", "Notion", "Slack", "Gmail", "HubSpot", "Supabase", "Vapi AI", "Calendly", "ngrok", "Docker"]].map((tool, idx) => (
                      <div
                        key={`row1-${tool}-${idx}`}
                        title={tool}
                        style={{
                          '--brand-color': getToolBrandColor(tool),
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        } as React.CSSProperties}
                        className="w-16 h-16 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-shrink-0 items-center justify-center cursor-default group hover:scale-110 hover:bg-white/[0.04] hover:shadow-[0_0_20px_var(--brand-color)] hover:border-[var(--brand-color)]"
                      >
                        <ToolIcon name={tool} className="w-7 h-7 text-[var(--brand-color)] group-hover:drop-shadow-[0_0_12px_var(--brand-color)]" style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    ))}
                  </div>

                  {/* Second Marquee Row (Reversed) */}
                  <div className="flex gap-4 w-max animate-marquee-reverse">
                    {[...["n8n", "Make.com", "Zapier", "GoHighLevel", "Claude AI", "ChatGPT", "Python", "Airtable", "Notion", "Slack", "Gmail", "HubSpot", "Supabase", "Vapi AI", "Calendly", "ngrok", "Docker"], ...["n8n", "Make.com", "Zapier", "GoHighLevel", "Claude AI", "ChatGPT", "Python", "Airtable", "Notion", "Slack", "Gmail", "HubSpot", "Supabase", "Vapi AI", "Calendly", "ngrok", "Docker"]].reverse().map((tool, idx) => (
                      <div
                        key={`row2-${tool}-${idx}`}
                        title={tool}
                        style={{
                          '--brand-color': getToolBrandColor(tool),
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        } as React.CSSProperties}
                        className="w-16 h-16 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-shrink-0 items-center justify-center cursor-default group hover:scale-110 hover:bg-white/[0.04] hover:shadow-[0_0_20px_var(--brand-color)] hover:border-[var(--brand-color)]"
                      >
                        <ToolIcon name={tool} className="w-7 h-7 text-[var(--brand-color)] group-hover:drop-shadow-[0_0_12px_var(--brand-color)]" style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              {/* 6. CTA BANNER */}
              <section className="relative rounded-[28px] overflow-hidden glass-panel border-white/10 p-8 md:p-14 text-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-aurora-teal/5 via-transparent to-aurora-violet/5 opacity-40 pointer-events-none" />
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Ready to Automate Your Operations?
                </h2>
                <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
                  Book a workflow scoping audit. We'll outline your top manual blockages and build an agent architecture map.
                </p>
                <button
                  onClick={() => {
                    setActiveTab("contact");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 font-display font-bold hover:shadow-[0_0_20px_rgba(0,255,209,0.35)] hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Schedule Your Audit
                </button>
              </section>
            </motion.div>
          )}

          {activeTab === "projects" && (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-10"
            >
              {/* Category Filter Title */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-aurora-teal uppercase tracking-widest">SHOWCASE DEPLOYMENTS</span>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                  Automation Systems
                </h1>
                <p className="text-xs md:text-sm text-slate-400 max-w-md">
                  Browse operational pipelines engineered for actual metrics and verified business savings.
                </p>
              </div>

              {/* Custom filter slider */}
              <div className="flex overflow-x-auto pb-3 gap-2 border-b border-white/5 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProjectFilter(cat)}
                    className={`px-5 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 flex-shrink-0 cursor-pointer ${
                      projectFilter === cat
                        ? "bg-aurora-teal text-slate-950 font-semibold shadow-[0_0_15px_rgba(0,255,209,0.25)]"
                        : "text-slate-400 hover:text-white bg-white/[0.02] border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleOpenProject(project)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div
              key="contact-tab"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start"
            >
              {/* Left Column: Booking Widget & Info */}
              <div className="space-y-8 h-full flex flex-col">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-aurora-teal uppercase tracking-widest">GET IN TOUCH</span>
                  <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                    Start Scoping
                  </h1>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                    Based in Philippines (PHT UTC+8), serving clients globally. Drop a note here, or schedule a direct calendar call below.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="space-y-3">
                  <div className="glass-panel p-4 rounded-2xl bg-white/[0.01] border-white/5 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Availability</span>
                    {availability !== 'loading' && (
                      <span className={`${availability === 'available' ? 'text-emerald-400' : 'text-slate-400'} flex items-center gap-1.5`}>
                        <span className={`h-2 w-2 rounded-full ${availability === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} /> 
                        {availability === 'available' ? '🟢 Live & Taking Projects' : 'Fully Booked For Now'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Column: Contact Form */}
                <GlassCard className="p-6 md:p-10 rounded-[28px] border-white/10 flex-grow" hoverEffect={false}>
                  <h3 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-aurora-teal" /> Shoot An Email
                  </h3>

                  <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">What should we call you?</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-aurora-teal/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Enter a valid email address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-aurora-teal/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  {/* Dropdown field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Choose a subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-900 border border-white/5 hover:border-white/10 focus:border-aurora-teal/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="Project Inquiry">Project Inquiry — Automate Workflow</option>
                      <option value="AI Agents">AI Agent Development</option>
                      <option value="General Question">General Question</option>
                      <option value="Collaboration">Collaboration / Partnership</option>
                    </select>
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Overview of your workflow or inquiry</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please provide a brief overview of your workflow, software needs, or inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-aurora-teal/50 rounded-xl px-4 py-3 text-white focus:outline-none transition-all placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  {/* Success indicator */}
                  {formSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed flex items-start gap-2 animate-fadeIn">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>{formSuccess}</div>
                    </div>
                  )}

                  {formError && (
                    <div className="p-4 rounded-xl bg-aurora-magenta/10 border border-aurora-magenta/20 text-aurora-magenta text-xs leading-relaxed flex items-start gap-2 animate-fadeIn">
                      <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>{formError}</div>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 font-display font-bold hover:shadow-[0_0_20px_rgba(0,255,209,0.35)] transition-all hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50 text-center flex items-center justify-center gap-2"
                  >
                    {formLoading ? "Sending..." : "Send Email"}
                  </button>
                </form>
              </GlassCard>

              </div>

              {/* Right Column: Booking Widget */}
              <div className="h-full">
                {/* Real Calendly Embedded Widget */}
                <div className="glass-panel p-4 md:p-6 rounded-[24px] bg-white/[0.01] border-white/10 space-y-4 relative overflow-hidden h-full flex flex-col">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-aurora-teal/10 text-aurora-teal">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-base text-white">Book a Free 30-Min Scoping Call</h4>
                        <p className="text-xs text-slate-400">Select an open slot directly via live Cal.com integration.</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20 rounded-full font-mono text-[10px] uppercase tracking-wider">
                      Live Scheduling
                    </div>
                  </div>

                  {/* Embedded Cal Frame */}
                  <div className="w-full flex-grow rounded-2xl overflow-hidden border border-white/10 bg-slate-950/30 backdrop-blur-sm min-h-[600px] shadow-inner flex flex-col mt-4">
                    <CalEmbed theme={theme} namespace="contact-discovery" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/40 backdrop-blur-md py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="font-display font-black text-white text-lg tracking-wider flex items-center justify-center md:justify-start gap-2">
              SE7ENLABS<span className="text-aurora-teal">.</span>
              <span className="text-[10px] font-mono tracking-widest bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20 px-2 py-0.5 rounded-md uppercase">
                AI
              </span>
            </h4>
            <p className="text-xs text-slate-500 font-mono">© {new Date().getFullYear()} All rights reserved.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("contact");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="p-3 rounded-full bg-white/5 hover:bg-aurora-teal/10 hover:text-aurora-teal border border-white/5 hover:border-aurora-teal/20 transition-all cursor-pointer text-slate-400"
              title="Contact"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence mode="wait">
        {selectedProject && (
          <ProjectModal
            key="project-modal"
            project={selectedProject}
            theme={theme}
            onClose={handleCloseProject}
          />
        )}
      </AnimatePresence>

      {/* Global intelligent AI Assistant chatbot floating bubble */}
      <ChatBubble theme={theme} />
    </div>
  );
}
