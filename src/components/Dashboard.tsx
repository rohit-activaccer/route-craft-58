import { useState } from "react";
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
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { useDashboardOverview, useRecentActivity } from "@/hooks/useDashboard";
import { transformDashboardData, transformRecentActivities, getStatusVariant } from "@/lib/dashboard-utils";

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Fetch dashboard data
  const { 
    data: overviewData, 
    isLoading: overviewLoading, 
    error: overviewError,
    refetch: refetchOverview 
  } = useDashboardOverview();
  
  const { 
    data: activityData, 
    isLoading: activityLoading, 
    error: activityError,
    refetch: refetchActivity 
  } = useRecentActivity(10);

  // Transform data for display
  const stats = overviewData?.overview ? transformDashboardData(overviewData.overview) : [];
  const recentActivities = activityData?.activities ? transformRecentActivities(activityData.activities) : [];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchOverview();
    refetchActivity();
  };

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

  const renderStats = () => {
    if (overviewLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ));
    }

    if (overviewError) {
      return (
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">Failed to load dashboard data</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return stats.map((stat, index) => (
      <Card key={index} className="shadow-card hover:shadow-hover transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </CardTitle>
          <span className="text-2xl">{stat.icon}</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
        </CardContent>
      </Card>
    ));
  };

  const renderRecentActivities = () => {
    if (activityLoading) {
      return Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
          <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ));
    }

    if (activityError) {
      return (
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load recent activities</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (!recentActivities.length) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No recent activities</p>
        </div>
      );
    }

    return recentActivities.map((activity) => (
      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
          <span className="text-lg">{activity.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-foreground">{activity.title}</h4>
            <Badge 
              variant={getStatusVariant(activity.status)}
              className="text-xs"
            >
              {activity.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
          <p className="text-xs text-muted-foreground">{activity.time}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transportation Procurement Dashboard</h1>
          <p className="text-muted-foreground">Monitor your procurement activities and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={overviewLoading || activityLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${(overviewLoading || activityLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => onNavigate?.("create-bid")}
            className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-200"
          >
            <FileText className="w-4 h-4 mr-2" />
            Create New Bid
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {renderStats()}
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
                {renderRecentActivities()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}