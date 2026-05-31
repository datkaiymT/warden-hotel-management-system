import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });
  const [variant, setVariant] = useState<"default" | "hover" | "text">("default");
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setHidden(false);
      const el = e.target as HTMLElement;
      if (el.closest("button, a, [role='button'], .interactive")) setVariant("hover");
      else if (el.closest("input, textarea")) setVariant("text");
      else setVariant("default");
    };
    const onLeave = () => setHidden(true);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[9999] left-0 top-0 mix-blend-difference"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          className="rounded-full bg-primary-light"
          animate={{
            width: variant === "hover" ? 44 : variant === "text" ? 2 : 8,
            height: variant === "hover" ? 44 : variant === "text" ? 22 : 8,
            x: variant === "hover" ? -22 : variant === "text" ? -1 : -4,
            y: variant === "hover" ? -22 : variant === "text" ? -11 : -4,
            opacity: variant === "hover" ? 0.4 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed z-[9998] left-0 top-0"
        style={{ x, y }}
      >
        <div
          className="rounded-full"
          style={{
            width: 32, height: 32, transform: "translate(-16px, -16px)",
            background: "radial-gradient(circle, color-mix(in oklab, var(--primary) 30%, transparent), transparent 70%)",
          }}
        />
      </motion.div>
    </>
  );
}
