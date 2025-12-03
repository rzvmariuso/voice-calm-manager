import { Bot } from "lucide-react";
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  variant?: "default" | "minimal";
}

const sizeMap = {
  sm: { container: "w-8 h-8", image: "w-5 h-5", text: "text-sm", radius: "rounded-lg" },
  md: { container: "w-10 h-10", image: "w-6 h-6", text: "text-base", radius: "rounded-xl" },
  lg: { container: "w-14 h-14", image: "w-9 h-9", text: "text-xl", radius: "rounded-xl" },
  xl: { container: "w-20 h-20", image: "w-12 h-12", text: "text-2xl", radius: "rounded-2xl" },
};

export function Logo({ size = "md", showText = true, className = "", variant = "default" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className={`
          ${sizes.container} 
          ${sizes.radius}
          bg-primary
          flex items-center justify-center 
          overflow-hidden
          shadow-sm
          transition-all duration-300
          ${variant === "default" ? "hover:shadow-md hover:scale-[1.02]" : ""}
        `}
      >
        {!imageError ? (
          <img
            src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png"
            alt="Voxcal Logo"
            className={`${sizes.image} object-contain brightness-0 invert`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Bot className={`${sizes.image} text-primary-foreground`} />
        )}
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes.text} font-semibold text-foreground leading-tight`}>
            Voxcal
          </span>
          {(size === "lg" || size === "xl") && (
            <span className="text-xs text-muted-foreground">KI-Praxisverwaltung</span>
          )}
        </div>
      )}
    </div>
  );
}
