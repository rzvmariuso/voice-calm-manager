import { Bot } from "lucide-react";
import { useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", image: "w-6 h-6", text: "text-base" },
  md: { container: "w-10 h-10", image: "w-8 h-8", text: "text-lg" },
  lg: { container: "w-20 h-20", image: "w-16 h-16", text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes.container} bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden`}>
        {!imageError ? (
          <img
            src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png"
            alt="Voxcal Logo"
            className={`${sizes.image} object-contain`}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <Bot className={`${sizes.image} text-white`} />
        )}
      </div>
      {showText && (
        <div>
          <h1 className={`${sizes.text} font-bold text-foreground`}>Voxcal</h1>
          {size === "lg" && (
            <p className="text-xs text-muted-foreground">KI-Praxisverwaltung</p>
          )}
        </div>
      )}
    </div>
  );
}
