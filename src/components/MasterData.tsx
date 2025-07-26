import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Database, 
  Plus, 
  Download,
  RefreshCw,
  MapPin,
  Truck,
  Package,
  Route,
  Settings
} from "lucide-react";

export function MasterData() {
  const [activeTab, setActiveTab] = useState("overview");

  const dataCategories = [
    {
      id: "carriers",
      title: "Carrier Master",
      description: "Manage carrier information and performance metrics",
      icon: Truck,
      count: "847 carriers",
      status: "Updated 2h ago",
      actions: ["Upload Excel", "Import from XYZ", "Add New"]
    },
    {
      id: "locations",
      title: "Locations",
      description: "Network locations and facilities data",
      icon: MapPin,
      count: "1,264 locations",
      status: "Updated 4h ago",
      actions: ["Upload Excel", "Import from XYZ", "Add New"]
    },
    {
      id: "lanes",
      title: "Lanes",
      description: "Transportation lanes and routing information",
      icon: Route,
      count: "3,892 lanes",
      status: "Updated 1h ago",
      actions: ["Auto-create", "Upload Excel", "Edit"]
    },
    {
      id: "commodities",
      title: "Commodities",
      description: "Product and commodity definitions",
      icon: Package,
      count: "156 commodities",
      status: "Updated 1d ago",
      actions: ["Add New", "Import"]
    },
    {
      id: "contracts",
      title: "Current Contracts",
      description: "Active transportation contracts and rates",
      icon: Database,
      count: "89 contracts",
      status: "Updated 3h ago",
      actions: ["Upload Excel", "Import from XYZ"]
    },
    {
      id: "equipment",
      title: "Equipment Types",
      description: "Vehicle and equipment specifications",
      icon: Settings,
      count: "24 types",
      status: "Updated 1w ago",
      actions: ["Add New", "Configure"]
    }
  ];

  const recentUploads = [
    {
      id: 1,
      name: "Q4_Carrier_Performance.xlsx",
      type: "Carrier Data",
      size: "2.4 MB",
      status: "completed",
      records: "847 records processed",
      time: "2 hours ago"
    },
    {
      id: 2,
      name: "Network_Locations_2024.xlsx",
      type: "Location Data",
      size: "1.8 MB",
      status: "processing",
      records: "1,264 records",
      time: "3 hours ago"
    },
    {
      id: 3,
      name: "Contract_Rates_Regional.xlsx",
      type: "Contract Data",
      size: "945 KB",
      status: "completed",
      records: "89 contracts updated",
      time: "1 day ago"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Master Data Management</h1>
          <p className="text-muted-foreground">Manage your transportation network data and configurations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Templates
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow">
            <Upload className="w-4 h-4" />
            Upload Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="uploads">Recent Uploads</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Data Categories Grid */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {dataCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.id} className="shadow-card hover:shadow-hover transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                        <Icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{category.title}</CardTitle>
                        <CardDescription className="text-sm">{category.count}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {category.actions.map((action, index) => (
                        <Button key={index} variant="outline" size="sm" className="text-xs">
                          {action}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">{category.status}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Data Uploads</CardTitle>
              <CardDescription>Track the status of recent data imports and uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                        <Upload className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{upload.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{upload.type}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{upload.size}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{upload.records}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={upload.status === "completed" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {upload.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{upload.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>Configure data integrations with external systems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-accent">
                    <RefreshCw className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">XYZ Transportation Execution</h4>
                    <p className="text-sm text-muted-foreground">Real-time data sync for loads, carriers, and performance</p>
                    <Badge variant="default" className="mt-2 text-xs">Connected</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-navy">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">TruckStop API</h4>
                    <p className="text-sm text-muted-foreground">Access carrier network and market data</p>
                    <Badge variant="secondary" className="mt-2 text-xs">Available</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">Setup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Excel Templates</CardTitle>
              <CardDescription>Download pre-configured templates for data uploads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {dataCategories.slice(0, 4).map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary">
                          <Icon className="w-5 h-5 text-foreground" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{category.title} Template</h4>
                          <p className="text-xs text-muted-foreground">Excel format with validation</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}