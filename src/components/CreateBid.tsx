import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Plus, 
  Calendar,
  MapPin,
  Truck,
  Package,
  DollarSign,
  Clock,
  Save,
  Send
} from "lucide-react";

export function CreateBid() {
  const [bidName, setBidName] = useState("");
  const [selectedLanes, setSelectedLanes] = useState<string[]>([]);

  const availableLanes = [
    { id: "1", origin: "Chicago, IL", destination: "Atlanta, GA", volume: "1,247 loads", distance: "467 miles" },
    { id: "2", origin: "Los Angeles, CA", destination: "Phoenix, AZ", volume: "987 loads", distance: "372 miles" },
    { id: "3", origin: "Dallas, TX", destination: "Houston, TX", volume: "1,156 loads", distance: "239 miles" },
    { id: "4", origin: "New York, NY", destination: "Philadelphia, PA", volume: "834 loads", distance: "95 miles" },
    { id: "5", origin: "Miami, FL", destination: "Orlando, FL", volume: "692 loads", distance: "235 miles" }
  ];

  const bidTemplates = [
    { id: "regional", name: "Regional TL Contract", description: "Standard template for regional contract lanes" },
    { id: "spot", name: "Spot Market Bid", description: "Template for spot market procurement" },
    { id: "seasonal", name: "Seasonal Contract", description: "Template with seasonal rate variations" }
  ];

  const toggleLane = (laneId: string) => {
    setSelectedLanes(prev => 
      prev.includes(laneId) 
        ? prev.filter(id => id !== laneId)
        : [...prev, laneId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Bid</h1>
          <p className="text-muted-foreground">Set up a new bidding process for transportation lanes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow">
            <Send className="w-4 h-4" />
            Publish Bid
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bid Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Bid Information
              </CardTitle>
              <CardDescription>Basic configuration for your bid package</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bidName">Bid Name</Label>
                  <Input 
                    id="bidName" 
                    placeholder="Q1 2024 Regional Lanes"
                    value={bidName}
                    onChange={(e) => setBidName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bidType">Bid Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bid type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract Bid</SelectItem>
                      <SelectItem value="spot">Spot Market</SelectItem>
                      <SelectItem value="seasonal">Seasonal Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the scope and requirements of this bid..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Bid Start Date</Label>
                  <Input type="date" id="startDate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Bid End Date</Label>
                  <Input type="date" id="endDate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern (EST)</SelectItem>
                      <SelectItem value="cst">Central (CST)</SelectItem>
                      <SelectItem value="mst">Mountain (MST)</SelectItem>
                      <SelectItem value="pst">Pacific (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lane Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lane Selection
              </CardTitle>
              <CardDescription>Select the lanes to include in this bid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedLanes.length} of {availableLanes.length} lanes selected
                  </span>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Lane
                  </Button>
                </div>

                <div className="space-y-3">
                  {availableLanes.map((lane) => (
                    <div 
                      key={lane.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedLanes.includes(lane.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleLane(lane.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            {lane.origin} → {lane.destination}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {lane.volume}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {lane.distance}
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedLanes.includes(lane.id)
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {selectedLanes.includes(lane.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Requirements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Bid Requirements
              </CardTitle>
              <CardDescription>Define equipment, service levels, and special requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="equipmentType">Equipment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry-van">Dry Van 53'</SelectItem>
                      <SelectItem value="reefer">Refrigerated 53'</SelectItem>
                      <SelectItem value="flatbed">Flatbed 48'</SelectItem>
                      <SelectItem value="container">Container 20'/40'</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceLevel">Service Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="expedited">Expedited</SelectItem>
                      <SelectItem value="white-glove">White Glove</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Handling Instructions</Label>
                <Textarea 
                  id="specialInstructions" 
                  placeholder="Any special requirements, handling instructions, or compliance needs..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Bid Templates</CardTitle>
              <CardDescription>Start from a pre-configured template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bidTemplates.map((template) => (
                <Button 
                  key={template.id}
                  variant="outline" 
                  className="w-full text-left h-auto p-4 flex flex-col items-start gap-2"
                >
                  <span className="font-medium text-foreground">{template.name}</span>
                  <span className="text-xs text-muted-foreground">{template.description}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Bid Summary</CardTitle>
              <CardDescription>Overview of current configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Selected Lanes</span>
                <Badge>{selectedLanes.length}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Volume</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedLanes.length > 0 ? '3,456 loads' : '0 loads'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Equipment Types</span>
                <span className="text-sm font-medium text-foreground">1</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-xs text-muted-foreground">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Bid
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Clock className="w-4 h-4" />
                Set Reminders
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <DollarSign className="w-4 h-4" />
                Set Rate Targets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}