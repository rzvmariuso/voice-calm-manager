import { useState } from "react";
import { Calendar, Phone, Settings, Users, BarChart3, Bot, CreditCard, Zap, HelpCircle, Search } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/common/GlobalSearch";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Termine",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "Kalender",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Benachrichtigungen",
    url: "/notifications",
    icon: Bot,
  },
  {
    title: "Wiederkehrende Termine",
    url: "/recurring",
    icon: Calendar,
  },
  {
    title: "KI-Agent",
    url: "/ai-agent",
    icon: Bot,
  },
  {
    title: "Automation",
    url: "/automation",
    icon: Zap,
  },
  {
    title: "Telefonie",
    url: "/phone",
    icon: Phone,
  },
  {
    title: "Billing & Abos",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Patienten",
    url: "/patients",
    icon: Users,
  },
  {
    title: "FAQ",
    url: "/faq",
    icon: HelpCircle,
  },
  {
    title: "Einstellungen",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { state } = useSidebar();
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <>
    <Sidebar className="animate-slide-in-right hidden lg:flex">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <Link to="/" className="flex items-center gap-3 group hover:no-underline">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg overflow-hidden hover:shadow-glow transition-all duration-300 group-hover:scale-110">
            <img 
              src="/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png" 
              alt="Voxcal Logo"
              className="w-full h-full object-contain p-1"
            />
          </div>
          {!state || state === "expanded" ? (
            <div>
              <h2 className="font-bold text-lg text-sidebar-foreground group-hover:text-primary transition-colors duration-200">
                Voxcal
              </h2>
              <p className="text-sm text-sidebar-foreground/70">Stimme & Kalender</p>
            </div>
          ) : null}
        </Link>
        
        {(!state || state === "expanded") && (
          <Button 
            variant="outline" 
            className="mt-4 w-full justify-start"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4 mr-2" />
            Suchen...
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item, index) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title} className={`animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`
                          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
                          hover:bg-sidebar-accent hover:scale-105 hover:shadow-soft
                          ${isActive 
                            ? 'bg-gradient-primary text-white shadow-glow font-medium' 
                            : 'text-sidebar-foreground hover:text-sidebar-primary'
                          }
                        `}
                      >
                        <item.icon className={`
                          w-5 h-5 group-hover:scale-110 transition-transform duration-200
                          ${isActive ? 'text-white' : ''}
                        `} />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    
    <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}