import { useEffect } from "react";
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function CursorFollower() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { stiffness: 200, damping: 28 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      mouseX.set(event.clientX + 6);
      mouseY.set(event.clientY + 16);
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    }

  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 size-[10px] rounded-full bg-primary pointer-events-none z-50 transition-transform duration-100 ease-out will-change-transform" 
      style={{ translateX: smoothX, translateY: smoothY }}
    />      
  );
}