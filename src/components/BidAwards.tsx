import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Award, Eye, FileText, Download, CheckCircle, XCircle, Clock } from "lucide-react";

interface BidForAward {
  id: string;
  bidNumber: string;
  carrierName: string;
  carrierRating: number;
  lane: string;
  bidAmount: number;
  submissionDate: string;
  expiryDate: string;
  serviceLevel: string;
  transitTime: string;
  status: "Pending Award" | "Awarded" | "Rejected" | "Under Review";
  competitiveScore: number;
}

interface AwardedContract {
  id: string;
  contractNumber: string;
  bidNumber: string;
  carrierName: string;
  lane: string;
  awardedAmount: number;
  awardDate: string;
  contractStart: string;
  contractEnd: string;
  status: "Active" | "Completed" | "Cancelled";
  performance: number;
}

const BidAwards = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending-awards");
  const [selectedBid, setSelectedBid] = useState<BidForAward | null>(null);
  const [awardDialog, setAwardDialog] = useState(false);

  // Mock data for bids pending award
  const pendingBids: BidForAward[] = [
    {
      id: "1",
      bidNumber: "BID-2024-001",
      carrierName: "Swift Transport",
      carrierRating: 4.8,
      lane: "Los Angeles, CA → Houston, TX",
      bidAmount: 2500,
      submissionDate: "2024-01-15",
      expiryDate: "2024-02-15",
      serviceLevel: "Standard",
      transitTime: "3-4 days",
      status: "Pending Award",
      competitiveScore: 92
    },
    {
      id: "2",
      bidNumber: "BID-2024-002",
      carrierName: "Freight Masters",
      carrierRating: 4.5,
      lane: "Chicago, IL → Miami, FL",
      bidAmount: 1800,
      submissionDate: "2024-01-16",
      expiryDate: "2024-02-16",
      serviceLevel: "Express",
      transitTime: "2-3 days",
      status: "Under Review",
      competitiveScore: 88
    },
    {
      id: "3",
      bidNumber: "BID-2024-004",
      carrierName: "National Freight",
      carrierRating: 4.2,
      lane: "New York, NY → Phoenix, AZ",
      bidAmount: 3200,
      submissionDate: "2024-01-13",
      expiryDate: "2024-02-13",
      serviceLevel: "Standard",
      transitTime: "4-5 days",
      status: "Pending Award",
      competitiveScore: 85
    }
  ];

  // Mock data for awarded contracts
  const awardedContracts: AwardedContract[] = [
    {
      id: "1",
      contractNumber: "CTR-2024-001",
      bidNumber: "BID-2024-003",
      carrierName: "Express Logistics",
      lane: "Seattle, WA → Denver, CO",
      awardedAmount: 1200,
      awardDate: "2024-01-20",
      contractStart: "2024-02-01",
      contractEnd: "2024-12-31",
      status: "Active",
      performance: 95
    },
    {
      id: "2",
      contractNumber: "CTR-2024-002",
      bidNumber: "BID-2024-005",
      carrierName: "Cross Country",
      lane: "Atlanta, GA → Portland, OR",
      awardedAmount: 2800,
      awardDate: "2024-01-18",
      contractStart: "2024-02-01",
      contractEnd: "2024-06-30",
      status: "Completed",
      performance: 92
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Award": return "bg-yellow-100 text-yellow-800";
      case "Under Review": return "bg-blue-100 text-blue-800";
      case "Awarded": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAwardBid = (bid: BidForAward, action: "award" | "reject") => {
    console.log(`${action} bid:`, bid);
    setAwardDialog(false);
    setSelectedBid(null);
    // Here you would typically make an API call to award/reject the bid
  };

  const filteredPendingBids = pendingBids.filter(bid => {
    const matchesSearch = bid.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.lane.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status.toLowerCase().replace(" ", "-") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const PendingBidsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bid Number</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Lane</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Service Level</TableHead>
          <TableHead>Transit Time</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPendingBids.map((bid) => (
          <TableRow key={bid.id}>
            <TableCell className="font-medium">{bid.bidNumber}</TableCell>
            <TableCell>{bid.carrierName}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <span className="text-yellow-500">★</span>
                <span className="ml-1">{bid.carrierRating}</span>
              </div>
            </TableCell>
            <TableCell>{bid.lane}</TableCell>
            <TableCell>${bid.bidAmount.toLocaleString()}</TableCell>
            <TableCell>{bid.serviceLevel}</TableCell>
            <TableCell>{bid.transitTime}</TableCell>
            <TableCell>
              <span className={`font-semibold ${getScoreColor(bid.competitiveScore)}`}>
                {bid.competitiveScore}
              </span>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(bid.status)}>
                {bid.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Dialog open={awardDialog && selectedBid?.id === bid.id} onOpenChange={setAwardDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedBid(bid)}
                    >
                      <Award className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Award Decision</DialogTitle>
                      <DialogDescription>
                        Make a decision on bid {bid.bidNumber} from {bid.carrierName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Carrier</Label>
                          <p className="font-medium">{bid.carrierName}</p>
                        </div>
                        <div>
                          <Label>Bid Amount</Label>
                          <p className="font-medium">${bid.bidAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label>Rating</Label>
                          <p className="font-medium">★ {bid.carrierRating}</p>
                        </div>
                        <div>
                          <Label>Competitive Score</Label>
                          <p className={`font-medium ${getScoreColor(bid.competitiveScore)}`}>
                            {bid.competitiveScore}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Award Notes</Label>
                        <Textarea id="notes" placeholder="Add any notes about this award decision..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => handleAwardBid(bid, "reject")}>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button onClick={() => handleAwardBid(bid, "award")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Award
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const AwardedContractsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contract Number</TableHead>
          <TableHead>Bid Number</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Lane</TableHead>
          <TableHead>Awarded Amount</TableHead>
          <TableHead>Award Date</TableHead>
          <TableHead>Contract Period</TableHead>
          <TableHead>Performance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {awardedContracts.map((contract) => (
          <TableRow key={contract.id}>
            <TableCell className="font-medium">{contract.contractNumber}</TableCell>
            <TableCell>{contract.bidNumber}</TableCell>
            <TableCell>{contract.carrierName}</TableCell>
            <TableCell>{contract.lane}</TableCell>
            <TableCell>${contract.awardedAmount.toLocaleString()}</TableCell>
            <TableCell>{contract.awardDate}</TableCell>
            <TableCell>{contract.contractStart} - {contract.contractEnd}</TableCell>
            <TableCell>
              <span className={`font-semibold ${getScoreColor(contract.performance)}`}>
                {contract.performance}%
              </span>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(contract.status)}>
                {contract.status}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bid Awards</h1>
          <p className="text-muted-foreground">Review and award transportation bids to carriers</p>
        </div>
        <Button>Export Awards Report</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Awards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingBids.filter(b => b.status === "Pending Award").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pendingBids.filter(b => b.status === "Under Review").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Awarded Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {awardedContracts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Awarded Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${awardedContracts.reduce((sum, contract) => sum + contract.awardedAmount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bids, carriers, or lanes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending-award">Pending Award</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Awards Management with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Award Management</CardTitle>
          <CardDescription>Review bids and manage awarded contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending-awards">
                <Clock className="h-4 w-4 mr-2" />
                Pending Awards ({filteredPendingBids.length})
              </TabsTrigger>
              <TabsTrigger value="awarded-contracts">
                <CheckCircle className="h-4 w-4 mr-2" />
                Awarded Contracts ({awardedContracts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending-awards" className="mt-4">
              <PendingBidsTable />
            </TabsContent>

            <TabsContent value="awarded-contracts" className="mt-4">
              <AwardedContractsTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidAwards;