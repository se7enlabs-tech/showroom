import { Project } from "../types";
import { motion } from "motion/react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { getProjectDetail } from "../data/projectsData";

interface ProjectCardProps {
  key?: string;
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const detail = getProjectDetail(project.id) || project;
  const displayImage = detail.thumbnail || project.thumbnail;

  return (
    <motion.div
      layoutId={`project-container-${project.id}`}
      onClick={onClick}
      className="glass-panel project-card-glass group rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 hover:border-aurora-teal/30 hover:shadow-[0_0_30px_rgba(0,255,209,0.15)] hover-sweep flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={displayImage}
          alt={detail.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ imageRendering: "high-quality" as any, transform: "translateZ(0)" }}
        />

        {/* Categories / Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="text-[10px] tracking-widest uppercase bg-aurora-bg/80 backdrop-blur-md text-aurora-teal font-mono px-2.5 py-1 rounded-full border border-aurora-teal/30 flex items-center gap-1.5 shadow-sm">
            {detail.category}
          </span>
          {detail.featured && (
            <span className="text-[10px] tracking-widest uppercase bg-aurora-magenta/80 backdrop-blur-md text-white font-mono px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 group-hover:text-aurora-teal transition-colors gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-white">
              {detail.title}
            </h3>
            <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-aurora-teal group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
          </div>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            {detail.tagline}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
