import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Map, 
  BarChart3, 
  TrendingUp, 
  Target,
  MapPin,
  Route,
  Truck,
  DollarSign,
  Calendar,
  Settings,
  Zap
} from "lucide-react";

export function NetworkAnalysis() {
  const [selectedScenario, setSelectedScenario] = useState("current");

  const networkStats = [
    {
      title: "Total Lanes",
      value: "3,892",
      change: "+12%",
      trend: "up",
      icon: Route
    },
    {
      title: "Active Locations",
      value: "1,264",
      change: "+5%",
      trend: "up",
      icon: MapPin
    },
    {
      title: "Volume (loads/month)",
      value: "45.2K",
      change: "-3%",
      trend: "down",
      icon: Truck
    },
    {
      title: "Avg Cost/Mile",
      value: "$2.45",
      change: "+8%",
      trend: "up",
      icon: DollarSign
    }
  ];

  const topLanes = [
    {
      id: 1,
      origin: "Chicago, IL",
      destination: "Atlanta, GA",
      volume: "1,247 loads",
      avgRate: "$2,340",
      utilization: 92,
      carriers: 12,
      status: "optimal"
    },
    {
      id: 2,
      origin: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      volume: "987 loads",
      avgRate: "$1,890",
      utilization: 78,
      carriers: 8,
      status: "underutilized"
    },
    {
      id: 3,
      origin: "Dallas, TX",
      destination: "Houston, TX",
      volume: "1,156 loads",
      avgRate: "$1,450",
      utilization: 95,
      carriers: 15,
      status: "optimal"
    },
    {
      id: 4,
      origin: "New York, NY",
      destination: "Philadelphia, PA",
      volume: "834 loads",
      avgRate: "$890",
      utilization: 65,
      carriers: 6,
      status: "needs_review"
    }
  ];

  const marketData = [
    {
      category: "Dry Van",
      currentRate: "$2.45",
      marketRate: "$2.52",
      variance: "-2.8%",
      forecast: "Stable",
      seasonal: "Low"
    },
    {
      category: "Reefer",
      currentRate: "$2.89",
      marketRate: "$2.76",
      variance: "+4.7%",
      forecast: "Increasing",
      seasonal: "High"
    },
    {
      category: "Flatbed",
      currentRate: "$2.67",
      marketRate: "$2.71",
      variance: "-1.5%",
      forecast: "Stable",
      seasonal: "Medium"
    }
  ];

  const optimizationScenarios = [
    {
      id: "current",
      name: "Current State",
      description: "Existing network configuration",
      totalCost: "$12.4M",
      savings: "Baseline",
      efficiency: 78
    },
    {
      id: "consolidated",
      name: "Lane Consolidation",
      description: "Optimize lane bundles and reduce fragmentation",
      totalCost: "$11.2M",
      savings: "$1.2M (9.7%)",
      efficiency: 85
    },
    {
      id: "carrier_opt",
      name: "Carrier Optimization",
      description: "Optimize carrier mix and utilization",
      totalCost: "$11.6M",
      savings: "$800K (6.5%)",
      efficiency: 82
    },
    {
      id: "seasonal",
      name: "Seasonal Adjustment",
      description: "Account for seasonal patterns and rates",
      totalCost: "$11.8M",
      savings: "$600K (4.8%)",
      efficiency: 80
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "bg-green-500";
      case "underutilized": return "bg-yellow-500";
      case "needs_review": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Network Analysis & Optimization</h1>
          <p className="text-muted-foreground">Analyze your transportation network and identify optimization opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configure Analysis
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow">
            <Zap className="w-4 h-4" />
            Run Optimization
          </Button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {networkStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="visualization" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visualization">Network View</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Network Visualization</CardTitle>
                  <CardDescription>Interactive map showing lanes, locations, and volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center border border-border">
                    <div className="text-center">
                      <Map className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">Interactive Network Map</h3>
                      <p className="text-muted-foreground">Visualize lanes, volumes, and carrier performance</p>
                      <Button className="mt-4" variant="outline">Load Map</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Top Performing Lanes</CardTitle>
                  <CardDescription>Highest volume and utilization lanes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topLanes.map((lane) => (
                    <div key={lane.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground">
                          {lane.origin} → {lane.destination}
                        </h4>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(lane.status)}`} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="text-foreground">{lane.volume}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Avg Rate:</span>
                          <span className="text-foreground">{lane.avgRate}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Utilization:</span>
                          <span className="text-foreground">{lane.utilization}%</span>
                        </div>
                        <Progress value={lane.utilization} className="h-1" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Market Rate Analysis</CardTitle>
              <CardDescription>Compare your rates with market benchmarks and forecasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Equipment Type</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Current Rate</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Market Rate</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Variance</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Forecast</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Seasonality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map((item, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="p-3 text-sm text-foreground font-medium">{item.category}</td>
                        <td className="p-3 text-sm text-foreground">{item.currentRate}</td>
                        <td className="p-3 text-sm text-foreground">{item.marketRate}</td>
                        <td className="p-3 text-sm">
                          <span className={item.variance.startsWith('+') ? 'text-red-600' : 'text-green-600'}>
                            {item.variance}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-foreground">{item.forecast}</td>
                        <td className="p-3 text-sm">
                          <Badge variant={item.seasonal === 'High' ? 'destructive' : item.seasonal === 'Medium' ? 'default' : 'secondary'}>
                            {item.seasonal}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {optimizationScenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedScenario === scenario.id 
                    ? 'ring-2 ring-primary shadow-hover' 
                    : 'shadow-card hover:shadow-hover'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                  <CardDescription className="text-sm">{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Total Cost</span>
                        <span className="font-medium text-foreground">{scenario.totalCost}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Savings</span>
                        <span className="font-medium text-green-600">{scenario.savings}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className="font-medium text-foreground">{scenario.efficiency}%</span>
                      </div>
                      <Progress value={scenario.efficiency} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}