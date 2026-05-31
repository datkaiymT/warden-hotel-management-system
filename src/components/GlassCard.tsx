import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, tilt = true, glow = true, onClick }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(sy, [-50, 50], [4, -4]);
  const rotateY = useTransform(sx, [-50, 50], [-4, 4]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
    e.currentTarget.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      onClick={onClick}
      style={tilt ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
      className={cn(
        "group relative rounded-2xl glass overflow-hidden transition-shadow duration-500",
        glow && "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent),0_20px_60px_-15px_color-mix(in_oklab,var(--primary)_40%,transparent)]",
        onClick && "cursor-none",
        className
      )}
    >
      {glow && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--primary) 18%, transparent), transparent 60%)",
          }}
        />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
