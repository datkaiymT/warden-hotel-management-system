import { motion, useMotionValue, useSpring } from "framer-motion";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
}

export const MagneticButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, variant = "primary", size = "md", ...props }, ref) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 350, damping: 20 });
    const sy = useSpring(y, { stiffness: 350, damping: 20 });

    const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      x.set(mx * 0.25); y.set(my * 0.4);
    };
    const onLeave = () => { x.set(0); y.set(0); };

    const variants = {
      primary: "bg-gradient-primary text-primary-foreground shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--primary)_60%,transparent)] hover:shadow-[0_12px_32px_-8px_color-mix(in_oklab,var(--primary)_80%,transparent)]",
      ghost: "bg-white/5 text-foreground hover:bg-white/10 border border-white/10",
      outline: "border border-primary/40 text-primary hover:bg-primary/10",
      danger: "bg-destructive text-destructive-foreground hover:opacity-90",
    } as const;
    const sizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-12 px-8 text-base" } as const;

    return (
      <motion.button
        ref={ref as never}
        style={{ x: sx, y: sy }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-colors interactive disabled:opacity-50 disabled:pointer-events-none",
          variants[variant], sizes[size], className
        )}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </motion.button>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
