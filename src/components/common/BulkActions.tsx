import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChevronDown, X, Trash2, Calendar, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsProps<T> {
  items: T[];
  selectedItems: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  actions: {
    id: string;
    label: string;
    icon: React.ReactNode;
    variant?: "default" | "destructive";
    action: (selectedItems: T[]) => Promise<void> | void;
  }[];
  className?: string;
  getItemId: (item: T) => string;
}

export function BulkActions<T>({
  items,
  selectedItems,
  onSelectionChange,
  actions,
  className,
  getItemId
}: BulkActionsProps<T>) {
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const selectedCount = selectedItems.size;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const someSelected = selectedCount > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map(getItemId)));
    }
  };

  const handleClearSelection = () => {
    onSelectionChange(new Set());
  };

  const executeAction = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const selectedItemsList = items.filter(item => selectedItems.has(getItemId(item)));
    
    setIsExecuting(actionId);
    try {
      await action.action(selectedItemsList);
      onSelectionChange(new Set()); // Clear selection after action
    } finally {
      setIsExecuting(null);
    }
  };

  if (!someSelected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Alle auswählen"
        />
        <span className="text-sm text-muted-foreground">
          {items.length} Einträge
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg", className)}>
      <Checkbox
        checked={allSelected}
        ref={(el) => {
          if (el && someSelected && !allSelected) {
            // Access the underlying input element for indeterminate state
            const input = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
            if (input) {
              input.indeterminate = true;
            }
          }
        }}
        onCheckedChange={handleSelectAll}
        aria-label="Auswahl ändern"
      />
      
      <Badge variant="secondary" className="font-medium">
        {selectedCount} ausgewählt
      </Badge>

      <div className="flex items-center gap-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Aktionen
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.map((action) => (
              <AlertDialog key={action.id}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className={cn(
                      "cursor-pointer gap-2",
                      action.variant === "destructive" && "text-destructive focus:text-destructive"
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {action.label} bestätigen
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie diese Aktion für {selectedCount} ausgewählte Einträge ausführen? 
                      {action.variant === "destructive" && " Diese Aktion kann nicht rückgängig gemacht werden."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => executeAction(action.id)}
                      disabled={isExecuting !== null}
                      className={cn(
                        action.variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      )}
                    >
                      {isExecuting === action.id ? "Wird ausgeführt..." : "Bestätigen"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearSelection}
          className="h-8 w-8 p-0"
          aria-label="Auswahl aufheben"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}