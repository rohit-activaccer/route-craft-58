import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Users, Truck, MapPin, Target, Send, Filter, Star, CheckCircle } from "lucide-react";

export const InviteCarriers = () => {
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>([]);
  const [incumbentRatio, setIncumbentRatio] = useState([70]);
  const [invitationSent, setInvitationSent] = useState(false);

  const mockCarriers = [
    { id: "1", name: "TransGlobal Logistics", type: "Incumbent", performance: 92, onTime: 89, billing: 95, dotRating: "Satisfactory", lanes: 15 },
    { id: "2", name: "Swift Transportation", type: "Incumbent", performance: 88, onTime: 91, billing: 93, dotRating: "Satisfactory", lanes: 12 },
    { id: "3", name: "FreightMaster Pro", type: "New", performance: 85, onTime: 87, billing: 90, dotRating: "Conditional", lanes: 8 },
    { id: "4", name: "Highway Express", type: "Incumbent", performance: 94, onTime: 96, billing: 97, dotRating: "Satisfactory", lanes: 18 },
    { id: "5", name: "Regional Haulers", type: "New", performance: 82, onTime: 84, billing: 88, dotRating: "Satisfactory", lanes: 6 },
  ];

  const mockLanes = [
    { id: "1", origin: "Chicago, IL", destination: "Atlanta, GA", volume: 120, distance: "717 miles" },
    { id: "2", origin: "Los Angeles, CA", destination: "Phoenix, AZ", volume: 85, distance: "372 miles" },
    { id: "3", origin: "Dallas, TX", destination: "Houston, TX", volume: 200, distance: "239 miles" },
    { id: "4", origin: "New York, NY", destination: "Boston, MA", volume: 95, distance: "215 miles" },
  ];

  const handleCarrierSelect = (carrierId: string) => {
    setSelectedCarriers(prev => 
      prev.includes(carrierId) 
        ? prev.filter(id => id !== carrierId)
        : [...prev, carrierId]
    );
  };

  const handleSendInvitations = () => {
    setInvitationSent(true);
    setTimeout(() => setInvitationSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invite Carriers</h1>
          <p className="text-muted-foreground mt-2">Select and invite carriers to participate in your transportation bids</p>
        </div>
        <Button 
          onClick={handleSendInvitations}
          disabled={selectedCarriers.length === 0}
          className="bg-gradient-to-r from-primary to-primary/80"
        >
          <Send className="mr-2 h-4 w-4" />
          Send Invitations ({selectedCarriers.length})
        </Button>
      </div>

      {invitationSent && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">
                Invitations sent successfully to {selectedCarriers.length} carriers!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="criteria" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="criteria">Selection Criteria</TabsTrigger>
          <TabsTrigger value="carriers">Available Carriers</TabsTrigger>
          <TabsTrigger value="lanes">Lane Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="criteria" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Performance Criteria</span>
                </CardTitle>
                <CardDescription>Define minimum performance requirements for carrier selection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acceptance-rate">Min Acceptance Rate (%)</Label>
                    <Input id="acceptance-rate" type="number" placeholder="85" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ontime-performance">Min On-Time Performance (%)</Label>
                    <Input id="ontime-performance" type="number" placeholder="90" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-accuracy">Min Billing Accuracy (%)</Label>
                    <Input id="billing-accuracy" type="number" placeholder="95" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dot-rating">DOT Rating</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satisfactory">Satisfactory</SelectItem>
                        <SelectItem value="conditional">Conditional</SelectItem>
                        <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Carrier Mix Strategy</span>
                </CardTitle>
                <CardDescription>Configure the ratio between incumbent and new carriers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Incumbent Carriers Ratio: {incumbentRatio[0]}%</Label>
                  <Slider
                    value={incumbentRatio}
                    onValueChange={setIncumbentRatio}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">
                    New Carriers: {100 - incumbentRatio[0]}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-carriers">Maximum Carriers per Lane</Label>
                  <Input id="max-carriers" type="number" placeholder="5" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special-instructions">Special Instructions</Label>
                  <Textarea 
                    id="special-instructions" 
                    placeholder="Add any special requirements or instructions for carriers..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carriers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Carrier Selection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  <Badge variant="secondary">{mockCarriers.length} Total</Badge>
                </div>
              </CardTitle>
              <CardDescription>Select carriers to invite based on performance metrics and criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCarriers.map((carrier) => (
                  <div 
                    key={carrier.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCarriers.includes(carrier.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleCarrierSelect(carrier.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox 
                          checked={selectedCarriers.includes(carrier.id)}
                          onChange={() => handleCarrierSelect(carrier.id)}
                        />
                        <div>
                          <h3 className="font-semibold">{carrier.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={carrier.type === 'Incumbent' ? 'default' : 'secondary'}>
                              {carrier.type}
                            </Badge>
                            <Badge variant="outline">{carrier.lanes} Lanes</Badge>
                            <Badge variant={carrier.dotRating === 'Satisfactory' ? 'default' : 'destructive'}>
                              DOT: {carrier.dotRating}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{carrier.performance}%</div>
                          <div className="text-muted-foreground">Performance</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{carrier.onTime}%</div>
                          <div className="text-muted-foreground">On-Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{carrier.billing}%</div>
                          <div className="text-muted-foreground">Billing</div>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lanes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Lane Assignments</span>
              </CardTitle>
              <CardDescription>Assign selected carriers to specific lanes based on coverage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLanes.map((lane) => (
                  <div key={lane.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{lane.origin} → {lane.destination}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>Volume: {lane.volume} loads/month</span>
                          <span>Distance: {lane.distance}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{selectedCarriers.length} Carriers Invited</Badge>
                        <Select>
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};