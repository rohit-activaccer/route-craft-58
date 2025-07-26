import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu,
  Truck,
  Database,
  Network,
  FileText,
  Users,
  Presentation,
  BarChart3,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "master-data", label: "Master Data", icon: Database },
  { id: "network-analysis", label: "Network Analysis", icon: Network },
  { id: "create-bid", label: "Create Bid", icon: FileText },
  { id: "invite-carriers", label: "Invite Carriers", icon: Users },
  { id: "manage-bids", label: "Manage Bids", icon: Presentation },
  { id: "bid-analysis", label: "Bid Analysis", icon: BarChart3 },
  { id: "bid-awards", label: "Bid Awards", icon: Award },
];

export function Layout({ children, currentPage = "dashboard", onNavigate }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (page: string) => {
    onNavigate?.(page);
    setIsMobileMenuOpen(false);
  };

  const NavigationContent = () => (
    <>
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
          <Truck className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">TransPro</h1>
          <p className="text-sm text-muted-foreground">Transportation Procurement</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-secondary text-foreground"
                )}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card">
        <NavigationContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">TransPro</span>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <NavigationContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}