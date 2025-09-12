import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: "h",
      altKey: true,
      action: () => navigate("/"),
      description: "Alt + H: Zum Dashboard"
    },
    {
      key: "k",
      altKey: true,
      action: () => navigate("/calendar"),
      description: "Alt + K: Zum Kalender"
    },
    {
      key: "p",
      altKey: true,
      action: () => navigate("/patients"),
      description: "Alt + P: Zu Patienten"
    },
    {
      key: "t",
      altKey: true,
      action: () => navigate("/appointments"),
      description: "Alt + T: Zu Terminen"
    },
    {
      key: "a",
      altKey: true,
      action: () => navigate("/analytics"),
      description: "Alt + A: Zu Analytics"
    },
    {
      key: "s",
      altKey: true,
      action: () => navigate("/settings"),
      description: "Alt + S: Zu Einstellungen"
    },
    // Search shortcut
    {
      key: "f",
      ctrlKey: true,
      action: () => {
        // Trigger global search
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLElement;
        if (searchButton) {
          searchButton.click();
        }
      },
      description: "Ctrl + F: Suche öffnen"
    },
    // Help shortcut
    {
      key: "?",
      action: () => showShortcutsHelp(),
      description: "?: Tastenkürzel anzeigen"
    }
  ];

  const showShortcutsHelp = () => {
    toast({
      title: "Tastenkürzel",
      description: (
        <div className="space-y-1 text-xs">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-mono bg-muted px-1 rounded text-xs">
                {shortcut.ctrlKey && "Ctrl + "}
                {shortcut.altKey && "Alt + "}
                {shortcut.shiftKey && "Shift + "}
                {shortcut.key.toUpperCase()}
              </span>
              <span className="ml-2 text-muted-foreground">
                {shortcut.description.split(': ')[1]}
              </span>
            </div>
          ))}
        </div>
      ),
      duration: 8000,
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = shortcuts.find(s => 
        s.key === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.altKey === event.altKey &&
        !!s.shiftKey === event.shiftKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, toast]);

  return { shortcuts, showShortcutsHelp };
}