import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Users, 
  Target, 
  CheckCircle,
  Send,
  TrendingUp,
  Clock
} from "lucide-react";

const menuItems = [
  {
    path: "/grs/dashboard",
    label: "Dashboard",
    icon: BarChart3,
    badge: null
  },
  {
    path: "/grs/planejamentos",
    label: "Planejamentos",
    icon: FileText,
    badge: "3"
  },
  {
    path: "/grs/calendario-editorial",
    label: "Calendário",
    icon: Calendar,
    badge: null
  },
  {
    path: "/grs/agendamento-social",
    label: "Agendamento",
    icon: Send,
    badge: "NEW"
  },
  {
    path: "/grs/relatorios",
    label: "Relatórios",
    icon: TrendingUp,
    badge: "NEW"
  },
  {
    path: "/grs/aprovacoes",
    label: "Aprovações",
    icon: CheckCircle,
    badge: "2"
  }
];

export function SubMenuGRS() {
  const location = useLocation();

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/30 border-b">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <Badge 
                  variant={item.badge === "NEW" ? "default" : "secondary"} 
                  className="ml-1 h-5 px-1.5 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}