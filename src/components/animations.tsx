import { useEffect, useRef } from "react";

// Enhanced animation utility component
export function useAnimationOnMount(delay = 0) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.animationDelay = `${delay}ms`;
          ref.current.classList.add('animate-fade-in');
        }
      }, delay);
    }
  }, [delay]);

  return ref;
}

// Animation classes for Tailwind
export const animations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up", 
  slideInRight: "animate-slide-in-right",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
} as const;

// Add animation keyframes to index.css if not already present
export const animationCSS = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes slide-in-right {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes scale-in {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out forwards;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out forwards;
  }
  
  .animate-scale-in {
    animation: scale-in 0.2s ease-out forwards;
  }
`;