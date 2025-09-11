import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb() {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const items: BreadcrumbItem[] = [{ label: "Dashboard", href: "/" }];
    
    // Map routes to breadcrumb items
    const routeMap: Record<string, BreadcrumbItem[]> = {
      '/patients': [
        { label: "Dashboard", href: "/" },
        { label: "Patienten" }
      ],
      '/appointments': [
        { label: "Dashboard", href: "/" },
        { label: "Termine" }
      ],
      '/calendar': [
        { label: "Dashboard", href: "/" },
        { label: "Kalender" }
      ],
      '/recurring': [
        { label: "Dashboard", href: "/" },
        { label: "Wiederkehrende Termine" }
      ],
      '/analytics': [
        { label: "Dashboard", href: "/" },
        { label: "Analytics" }
      ],
      '/settings': [
        { label: "Dashboard", href: "/" },
        { label: "Einstellungen" }
      ],
      '/billing': [
        { label: "Dashboard", href: "/" },
        { label: "Abrechnung" }
      ],
      '/phone': [
        { label: "Dashboard", href: "/" },
        { label: "KI Integration" }
      ],
      '/ai-agent': [
        { label: "Dashboard", href: "/" },
        { label: "KI Agent" }
      ],
      '/automation': [
        { label: "Dashboard", href: "/" },
        { label: "Automatisierung" }
      ],
      '/notifications': [
        { label: "Dashboard", href: "/" },
        { label: "Benachrichtigungen" }
      ]
    };

    // Handle patient details routes
    if (path.startsWith('/patients/') && path.length > '/patients/'.length) {
      return [
        { label: "Dashboard", href: "/" },
        { label: "Patienten", href: "/patients" },
        { label: "Patientendetails" }
      ];
    }

    return routeMap[path] || items;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      <Home className="w-4 h-4" />
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}