import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Truck, 
  Users, 
  FileText, 
  Activity,
  MapPin,
  DollarSign,
  Clock
} from "lucide-react";

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    {
      title: "Active Bids",
      value: "12",
      change: "+3 this week",
      icon: FileText,
      color: "text-blue-accent"
    },
    {
      title: "Registered Carriers",
      value: "847",
      change: "+28 this month",
      icon: Truck,
      color: "text-primary"
    },
    {
      title: "Total Lanes",
      value: "1,264",
      change: "+45 active",
      icon: MapPin,
      color: "text-navy"
    },
    {
      title: "Cost Savings",
      value: "$2.4M",
      change: "vs last quarter",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "bid_created",
      title: "Q1 2024 Regional Lanes Bid",
      description: "Created bid for 156 lanes covering Midwest region",
      time: "2 hours ago",
      status: "active"
    },
    {
      id: 2,
      type: "carrier_invited",
      title: "Carrier Invitations Sent",
      description: "45 carriers invited to Southeast TL bid",
      time: "4 hours ago",
      status: "pending"
    },
    {
      id: 3,
      type: "bid_analysis",
      title: "Bid Analysis Completed",
      description: "West Coast contract rates analysis finalized",
      time: "1 day ago",
      status: "completed"
    },
    {
      id: 4,
      type: "award_issued",
      title: "Contract Awards Issued",
      description: "23 carriers awarded contracts for Eastern region",
      time: "2 days ago",
      status: "completed"
    }
  ];

  const quickActions = [
    {
      title: "Create New Bid",
      description: "Start a new bidding process for transportation lanes",
      action: () => onNavigate?.("create-bid"),
      icon: FileText,
      color: "bg-primary"
    },
    {
      title: "Analyze Network",
      description: "Review current network performance and optimization",
      action: () => onNavigate?.("network-analysis"),
      icon: Activity,
      color: "bg-blue-accent"
    },
    {
      title: "Invite Carriers",
      description: "Manage carrier invitations for active bids",
      action: () => onNavigate?.("invite-carriers"),
      icon: Users,
      color: "bg-navy"
    },
    {
      title: "View Analytics",
      description: "Review bid performance and market insights",
      action: () => onNavigate?.("bid-analysis"),
      icon: TrendingUp,
      color: "bg-green-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transportation Procurement Dashboard</h1>
          <p className="text-muted-foreground">Monitor your procurement activities and performance metrics</p>
        </div>
        <Button 
          onClick={() => onNavigate?.("create-bid")}
          className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-200"
        >
          <FileText className="w-4 h-4 mr-2" />
          Create New Bid
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card hover:shadow-hover transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer transition-colors duration-200"
                    onClick={action.action}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground">{action.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates from your procurement processes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                      <Clock className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
                        <Badge 
                          variant={activity.status === "completed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}