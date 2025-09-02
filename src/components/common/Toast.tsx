import { CheckCircle, AlertCircle, Info, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-success/10 border-success/20 text-success-foreground',
    iconClass: 'text-success'
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
    iconClass: 'text-destructive'
  },
  warning: {
    icon: AlertCircle,
    bgClass: 'bg-warning/10 border-warning/20 text-warning-foreground',
    iconClass: 'text-warning'
  },
  info: {
    icon: Info,
    bgClass: 'bg-info/10 border-info/20 text-info-foreground',
    iconClass: 'text-info'
  }
};

export function Toast({ 
  type, 
  title, 
  description, 
  onClose, 
  action, 
  className 
}: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-slide-in-right",
      config.bgClass,
      className
    )}>
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClass)} />
      
      <div className="flex-1 space-y-1">
        <div className="font-medium text-sm">{title}</div>
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="mt-2 h-auto p-1 text-xs hover-scale"
          >
            {action.label}
          </Button>
        )}
      </div>

      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-auto p-1 hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// Utility functions for consistent toast usage
export const showSuccessToast = (title: string, description?: string) => ({
  title,
  description,
  variant: 'default' as const
});

export const showErrorToast = (title: string, description?: string) => ({
  title,
  description,
  variant: 'destructive' as const
});

export const showInfoToast = (title: string, description?: string) => ({
  title,
  description,
  variant: 'default' as const
});

export const showWarningToast = (title: string, description?: string) => ({
  title,
  description,
  variant: 'default' as const
});