import { Project } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight, CheckCircle, Flame, Hammer, Trophy, PlayCircle, ChevronLeft, ChevronRight, Layout, Database, Bot } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Lenis from "lenis";
import { getProjectDetail, ProjectDetail } from "../data/projectsData";
import ChatPanel from "./ChatPanel";

interface ProjectModalProps {
  key?: string;
  project: Project | null;
  theme?: "dark" | "light";
  onClose: () => void;
}

const getCleanVimeoUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("vimeo.com")) {
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?title=0&byline=0&portrait=0&badge=0&autopause=0&dnt=1`;
  }
  return url;
};

export default function ProjectModal({ project, theme = "dark", onClose }: ProjectModalProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showInlineChat, setShowInlineChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSlide(0);
  }, [project]);

  useEffect(() => {
    if (!scrollRef.current) return;
    
    const content = scrollRef.current.firstElementChild as HTMLElement;
    if (!content) return;

    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: content,
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
      
      if (e.key === "Home") {
        e.preventDefault();
        lenis.scrollTo(0, { duration: 1.2 });
      } else if (e.key === "End") {
        e.preventDefault();
        lenis.scrollTo(scrollRef.current!.scrollHeight, { duration: 1.2 });
      } else if (e.key === "PageUp") {
        e.preventDefault();
        lenis.scrollTo(Math.max(0, scrollRef.current!.scrollTop - scrollRef.current!.clientHeight), { duration: 1.2 });
      } else if (e.key === "PageDown") {
        e.preventDefault();
        lenis.scrollTo(Math.min(scrollRef.current!.scrollHeight, scrollRef.current!.scrollTop + scrollRef.current!.clientHeight), { duration: 1.2 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [project]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoomedImage) {
        setZoomedImage(null);
      } else {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [zoomedImage, onClose]);

  if (!project) return null;

  const detail: ProjectDetail = getProjectDetail(project.id) || {
    ...project,
    thumbnail: project.thumbnail,
    images: project.images
  };

  const scenarioSlides = detail.scenarioSlides && detail.scenarioSlides.length > 0
    ? detail.scenarioSlides
    : [{ image: detail.thumbnail, description: detail.overview }];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === scenarioSlides.length - 1 ? 0 : prev + 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? scenarioSlides.length - 1 : prev - 1));
  };

  return (
    <>
      <div key="modal-content" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#050810]/95 backdrop-blur-md"
        />

        {/* Modal content container */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.98 }}
          transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
          className="glass-panel w-full max-w-5xl rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(0,255,209,0.15)] border-white/15 relative z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header Actions */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-aurora-bg/85 border border-white/10 text-slate-400 hover:text-white hover:border-aurora-teal/30 hover:scale-105 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-grow" ref={scrollRef}>
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hero Image Block */}
                  <div className="relative h-64 md:h-96 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={detail.thumbnail}
                      alt={detail.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover blur-sm opacity-30 scale-105 absolute inset-0"
                      style={{ imageRendering: "high-quality" as any, transform: "translateZ(0)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-aurora-bg" />
                    <div className="relative z-10 h-full max-w-4xl mx-auto px-6 md:px-10 flex flex-col justify-end pb-8">
                      <span className="text-xs uppercase tracking-widest text-aurora-teal font-mono border border-aurora-teal/30 bg-aurora-teal/10 px-3 py-1 rounded-full w-fit mb-3">
                        {detail.category}
                      </span>
                      <h2 className="font-display font-extrabold tracking-tight text-white mb-4 leading-tight flex flex-col gap-1">
                        <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white block">
                          {detail.title}
                        </span>
                        {detail.subtitle && (
                          <i className="italic text-base sm:text-lg md:text-2xl text-slate-400 font-medium block">
                            {detail.subtitle}
                          </i>
                        )}
                      </h2>
                    </div>
                  </div>

                  {/* Grid layout for Content */}
                  <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                      {/* Main Content Column (Left) */}
                      <div className="md:col-span-2 space-y-8 md:space-y-10">
                        {/* Overview */}
                        <section>
                          <div className="flex items-center gap-2.5 mb-3">
                            <CheckCircle className="w-5 h-5 text-aurora-teal" />
                            <h4 className="font-display font-bold text-lg text-white">Project Overview</h4>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-sans text-sm md:text-base">
                            {detail.overview}
                          </p>
                        </section>

                        {/* Challenge & Solution Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="glass-panel p-5 sm:p-6 rounded-[24px] bg-white/[0.02] flex flex-col">
                            <div className="flex items-center gap-2 mb-3 text-aurora-magenta shrink-0">
                              <Flame className="w-5 h-5" />
                              <h5 className="font-display font-bold text-sm uppercase tracking-wide">The Challenge</h5>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-grow">
                              {detail.challenge}
                            </p>
                          </div>

                          <div className="glass-panel p-5 sm:p-6 rounded-[24px] bg-white/[0.02] border-aurora-teal/10 flex flex-col">
                            <div className="flex items-center gap-2 mb-3 text-aurora-teal shrink-0">
                              <Hammer className="w-5 h-5" />
                              <h5 className="font-display font-bold text-sm uppercase tracking-wide">The Solution</h5>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-grow">
                              {detail.solution}
                            </p>
                          </div>
                        </div>

                        {/* Outcomes */}
                        <div className="glass-panel p-5 sm:p-6 rounded-[24px] bg-aurora-teal/5 border border-aurora-teal/20 flex flex-col">
                          <div className="flex items-center gap-2 mb-3 text-aurora-teal shrink-0">
                            <Trophy className="w-5 h-5" />
                            <h5 className="font-display font-bold text-sm uppercase tracking-wide">Project Outcomes</h5>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed flex-grow">
                            {detail.results}
                          </p>
                        </div>
                      </div>

                      {/* Sidebar Column (Right) */}
                      <div className="md:col-span-1">
                        <div className="glass-panel p-6 sm:p-8 rounded-[32px] bg-white/[0.01] md:sticky top-8">
                          <div className="space-y-8">
                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Layout className="w-3.5 h-3.5" />
                                Primary Category
                              </span>
                              <div className="text-slate-200 font-sans text-sm font-medium">{detail.category}</div>
                            </div>
                            
                            <div className="space-y-3">
                              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                                <Database className="w-3.5 h-3.5" />
                                Core Tech Stack
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {(detail.tools || detail.tags).map((tool) => (
                                  <span
                                    key={tool}
                                    className="text-[11px] font-mono font-medium text-aurora-teal bg-aurora-teal/5 border border-aurora-teal/10 px-3 py-1.5 rounded-md"
                                  >
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actual Scenario / Video Demonstration (Full Width) */}
                  {(detail.videoDemo || (scenarioSlides && scenarioSlides.length > 0)) && (
                    <div className="max-w-4xl mx-auto px-6 md:px-10 pb-16">
                      <div className="space-y-8 mt-4 border-t border-white/10 pt-12">
                        <div className="flex items-center gap-2.5 mb-2">
                          {detail.id === "personal-ai-assistant" ? (
                            <Bot className="w-6 h-6 text-aurora-teal" />
                          ) : (
                            <PlayCircle className="w-6 h-6 text-aurora-teal" />
                          )}
                          <h3 className="font-display font-bold text-2xl text-white tracking-wide">
                            {detail.id === "personal-ai-assistant" ? "INTERACTIVE DEMONSTRATION" : "WORKFLOW DEMONSTRATION"}
                          </h3>
                        </div>
                        
                        <div className="glass-panel rounded-[24px] bg-white/[0.02] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                          {detail.id === "personal-ai-assistant" ? (
                            <div className="w-full relative bg-slate-950/80 min-h-[520px] flex flex-col items-center justify-center overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-tr from-aurora-teal/10 via-transparent to-aurora-blue/5 opacity-50 pointer-events-none mix-blend-overlay z-0"></div>
                              {!showInlineChat ? (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="z-10 flex flex-col items-center text-center p-8 max-w-lg"
                                >
                                  <div className="w-20 h-20 rounded-full bg-aurora-teal/10 border-2 border-aurora-teal/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,209,0.2)]">
                                    <Bot className="w-10 h-10 text-aurora-teal" />
                                  </div>
                                  <h4 className="text-3xl font-display font-bold text-white mb-4">Try Vincent!</h4>
                                  <p className="text-slate-300 mb-8 text-sm md:text-base leading-relaxed">
                                    Interact with the live AI agent architecture. Vincent is grounded in SE7ENLABS knowledge and can guide you through Von's capabilities, handle scheduling, and demonstrate deterministic fallback mechanisms.
                                  </p>
                                  <button
                                    onClick={() => setShowInlineChat(true)}
                                    className="px-8 py-3.5 rounded-full bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 font-bold tracking-wide shadow-[0_0_20px_rgba(0,255,209,0.3)] hover:shadow-[0_0_30px_rgba(0,255,209,0.5)] hover:scale-105 active:scale-95 transition-all"
                                  >
                                    START CONVERSATION
                                  </button>
                                </motion.div>
                              ) : (
                                <div className="w-full h-[520px] z-10 flex flex-col">
                                  <ChatPanel theme={theme} showCloseButton={false} />
                                </div>
                              )}
                            </div>
                          ) : detail.videoDemo ? (
                            <div className="w-full relative bg-black/40 overflow-hidden">
                              <div style={{ padding: "56.25% 0 0 0", position: "relative" }}>
                                <iframe
                                  src={getCleanVimeoUrl(detail.videoDemo)}
                                  frameBorder="0"
                                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                  referrerPolicy="strict-origin-when-cross-origin"
                                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                  title={detail.title || "Vimeo Demonstration"}
                                ></iframe>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {/* Top: Image Slider */}
                              <div className="w-full flex items-center justify-center relative bg-black/40 min-h-[400px] md:min-h-[600px] overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-aurora-teal/5 via-transparent to-white/5 opacity-50 pointer-events-none mix-blend-overlay z-0"></div>
                                
                                <AnimatePresence mode="wait">
                                  <motion.img
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    src={scenarioSlides[currentSlide].image}
                                    alt={`Scenario step ${currentSlide + 1}`}
                                    className="w-full h-full absolute inset-0 object-contain cursor-pointer z-10"
                                    onClick={() => setZoomedImage(scenarioSlides[currentSlide].image)}
                                    style={{ imageRendering: "high-quality" as any }}
                                  />
                                </AnimatePresence>
        
                                {scenarioSlides.length > 1 && (
                                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 bg-black/20 backdrop-blur-md py-2 mx-auto w-fit rounded-full border border-white/10 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {scenarioSlides.map((_, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                                          idx === currentSlide ? "bg-aurora-teal scale-125" : "bg-white/30 hover:bg-white/70"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                )}
        
                                {scenarioSlides.length > 1 && (
                                  <>
                                    <button
                                      onClick={handlePrevSlide}
                                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white transition-all z-20 cursor-pointer backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 duration-300"
                                    >
                                      <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                                    </button>
        
                                    <button
                                      onClick={handleNextSlide}
                                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white transition-all z-20 cursor-pointer backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 duration-300"
                                    >
                                      <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                                    </button>
                                  </>
                                )}
                              </div>

                              {/* Bottom: Description */}
                              <div className="w-full p-6 md:p-10 flex flex-col justify-center border-t border-white/10 bg-white/[0.01]">
                                {scenarioSlides.length > 1 && (
                                  <div className="text-aurora-teal font-mono text-sm mb-4 tracking-widest">
                                    STEP {currentSlide + 1} OF {scenarioSlides.length}
                                  </div>
                                )}
                                
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                  >
                                    <p className="text-slate-200 text-lg md:text-xl font-light leading-relaxed">
                                      {scenarioSlides[currentSlide].description}
                                    </p>
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
            </div>
          </motion.div>
        </div>
    
      {/* Zoomed Image Overlay */}
      <AnimatePresence key="zoomed-overlay">
        {zoomedImage && (
          <div key="zoomed-image-div" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.8 }}
              className="relative z-10 max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
            >
              <img
                src={zoomedImage}
                alt="Zoomed view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                style={{ imageRendering: "high-quality" as any, transform: "translateZ(0)" }}
              />
              <button
                onClick={() => setZoomedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
