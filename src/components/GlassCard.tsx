import { ReactNode } from "react";
import { motion } from "motion/react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  onClick,
  hoverEffect = true,
}: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      onClick={onClick}
      className={`glass-panel rounded-3xl p-6 hover-sweep text-left transition-all duration-300 ${
        hoverEffect ? "glass-panel-hover" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick && hoverEffect ? { y: -4, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {children}
    </Component>
  );
}
