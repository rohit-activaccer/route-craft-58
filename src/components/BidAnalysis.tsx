import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Filter,
  Download,
  Eye,
  Award,
  Users,
  DollarSign,
  Target,
  Zap
} from "lucide-react";

export function BidAnalysis() {
  const [selectedBid, setSelectedBid] = useState("q1-regional");
  
  const activeBids = [
    { id: "q1-regional", name: "Q1 2024 Regional Lanes", status: "active", responses: 23, deadline: "5 days" },
    { id: "seasonal-lanes", name: "Holiday Season Lanes", status: "closed", responses: 18, deadline: "Closed" },
    { id: "spot-market", name: "Spot Market - West Coast", status: "active", responses: 31, deadline: "2 days" }
  ];

  const bidResponses = [
    {
      id: 1,
      carrier: "Swift Transportation",
      totalBid: "$2,340,000",
      avgRate: "$2.45/mile",
      lanesQuoted: 23,
      totalLanes: 25,
      score: 92,
      onTimePerf: "94%",
      status: "complete"
    },
    {
      id: 2,
      carrier: "J.B. Hunt Transport",
      totalBid: "$2,290,000",
      avgRate: "$2.39/mile",
      lanesQuoted: 25,
      totalLanes: 25,
      score: 89,
      onTimePerf: "96%",
      status: "complete"
    },
    {
      id: 3,
      carrier: "Schneider National",
      totalBid: "$2,420,000",
      avgRate: "$2.52/mile",
      lanesQuoted: 24,
      totalLanes: 25,
      score: 87,
      onTimePerf: "92%",
      status: "complete"
    },
    {
      id: 4,
      carrier: "Werner Enterprises",
      totalBid: "$2,380,000",
      avgRate: "$2.48/mile",
      lanesQuoted: 22,
      totalLanes: 25,
      score: 85,
      onTimePerf: "89%",
      status: "partial"
    }
  ];

  const optimizationScenarios = [
    {
      id: "lowest-cost",
      name: "Lowest Cost",
      description: "Minimize total transportation cost",
      totalCost: "$2,290,000",
      carriers: 1,
      savings: "Baseline",
      riskLevel: "High"
    },
    {
      id: "balanced",
      name: "Balanced Approach",
      description: "Balance cost, performance, and risk",
      totalCost: "$2,356,000",
      carriers: 3,
      savings: "-$66K",
      riskLevel: "Medium"
    },
    {
      id: "performance",
      name: "Performance Focused",
      description: "Prioritize on-time performance",
      totalCost: "$2,398,000",
      carriers: 2,
      savings: "-$108K",
      riskLevel: "Low"
    },
    {
      id: "diversified",
      name: "Carrier Diversification",
      description: "Spread risk across multiple carriers",
      totalCost: "$2,445,000",
      carriers: 4,
      savings: "-$155K",
      riskLevel: "Very Low"
    }
  ];

  const participationStats = [
    { metric: "Invited Carriers", value: "45", change: "+12%" },
    { metric: "Response Rate", value: "73%", change: "+8%" },
    { metric: "Complete Responses", value: "28", change: "+15%" },
    { metric: "Avg Response Time", value: "3.2 days", change: "-0.5 days" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bid Analysis</h1>
          <p className="text-muted-foreground">Analyze carrier responses and optimize award decisions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Analysis
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-primary-glow">
            <Award className="w-4 h-4" />
            Award Contracts
          </Button>
        </div>
      </div>

      {/* Bid Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Select Bid for Analysis</CardTitle>
          <CardDescription>Choose which bid you want to analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {activeBids.map((bid) => (
              <div 
                key={bid.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedBid === bid.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedBid(bid.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-foreground">{bid.name}</h4>
                  <Badge variant={bid.status === 'active' ? 'default' : 'secondary'}>
                    {bid.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Responses:</span>
                    <span className="text-foreground">{bid.responses}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="text-foreground">{bid.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participation Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {participationStats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.metric}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change} vs last bid</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="responses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="responses">Carrier Responses</TabsTrigger>
          <TabsTrigger value="analysis">Rate Analysis</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="awards">Award Preparation</TabsTrigger>
        </TabsList>

        <TabsContent value="responses" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Carrier Responses</CardTitle>
                  <CardDescription>Review and compare carrier bids and performance</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Select>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total-cost">Total Cost</SelectItem>
                      <SelectItem value="rate">Rate per Mile</SelectItem>
                      <SelectItem value="performance">Performance Score</SelectItem>
                      <SelectItem value="coverage">Lane Coverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bidResponses.map((response) => (
                  <div key={response.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h4 className="text-sm font-medium text-foreground">{response.carrier}</h4>
                        <Badge variant={response.status === 'complete' ? 'default' : 'secondary'}>
                          {response.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-4 h-4" />
                          Details
                        </Button>
                        <div className="text-right">
                          <div className="text-sm font-medium text-foreground">Score: {response.score}</div>
                          <Progress value={response.score} className="w-16 h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                      <div>
                        <span className="text-xs text-muted-foreground">Total Bid</span>
                        <div className="text-sm font-medium text-foreground">{response.totalBid}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Avg Rate</span>
                        <div className="text-sm font-medium text-foreground">{response.avgRate}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Lane Coverage</span>
                        <div className="text-sm font-medium text-foreground">
                          {response.lanesQuoted}/{response.totalLanes}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">On-Time Perf</span>
                        <div className="text-sm font-medium text-foreground">{response.onTimePerf}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Performance</span>
                        <div className="text-sm font-medium text-foreground">{response.score}/100</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Optimization Scenarios
              </CardTitle>
              <CardDescription>Compare different award strategies and their impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {optimizationScenarios.map((scenario) => (
                  <div key={scenario.id} className="p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-foreground">{scenario.name}</h4>
                      <Button variant="outline" size="sm">Select</Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">{scenario.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Total Cost</span>
                        <span className="text-sm font-medium text-foreground">{scenario.totalCost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Carriers</span>
                        <span className="text-sm font-medium text-foreground">{scenario.carriers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">vs Lowest Cost</span>
                        <span className={`text-sm font-medium ${scenario.savings.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
                          {scenario.savings}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Risk Level</span>
                        <Badge variant={scenario.riskLevel === 'High' ? 'destructive' : scenario.riskLevel === 'Low' ? 'default' : 'secondary'}>
                          {scenario.riskLevel}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Award Preparation</CardTitle>
              <CardDescription>Review and finalize contract awards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Awards</h4>
                  <p className="text-sm text-blue-800">
                    Based on the balanced optimization scenario, we recommend awarding contracts to 3 carriers 
                    for optimal cost-performance balance with manageable risk.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Selected Carriers for Award</h4>
                  {bidResponses.slice(0, 3).map((carrier) => (
                    <div key={carrier.id} className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <h5 className="text-sm font-medium text-foreground">{carrier.carrier}</h5>
                          <p className="text-xs text-muted-foreground">
                            {carrier.lanesQuoted} lanes • {carrier.totalBid} total
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Selected</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1 gap-2">
                    <Award className="w-4 h-4" />
                    Generate Award Letters
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Export Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}