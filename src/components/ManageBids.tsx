import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Edit, Trash2, Download, Filter } from "lucide-react";

interface Bid {
  id: string;
  bidNumber: string;
  carrierName: string;
  lane: string;
  status: "Active" | "Pending" | "Awarded" | "Rejected" | "Expired";
  bidAmount: number;
  submissionDate: string;
  expiryDate: string;
  responseTime: string;
}

const ManageBids = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all-bids");

  // Mock data
  const bids: Bid[] = [
    {
      id: "1",
      bidNumber: "BID-2024-001",
      carrierName: "Swift Transport",
      lane: "Los Angeles, CA → Houston, TX",
      status: "Active",
      bidAmount: 2500,
      submissionDate: "2024-01-15",
      expiryDate: "2024-02-15",
      responseTime: "2 hours"
    },
    {
      id: "2",
      bidNumber: "BID-2024-002",
      carrierName: "Freight Masters",
      lane: "Chicago, IL → Miami, FL",
      status: "Pending",
      bidAmount: 1800,
      submissionDate: "2024-01-16",
      expiryDate: "2024-02-16",
      responseTime: "4 hours"
    },
    {
      id: "3",
      bidNumber: "BID-2024-003",
      carrierName: "Express Logistics",
      lane: "Seattle, WA → Denver, CO",
      status: "Awarded",
      bidAmount: 1200,
      submissionDate: "2024-01-14",
      expiryDate: "2024-02-14",
      responseTime: "1 hour"
    },
    {
      id: "4",
      bidNumber: "BID-2024-004",
      carrierName: "National Freight",
      lane: "New York, NY → Phoenix, AZ",
      status: "Rejected",
      bidAmount: 3200,
      submissionDate: "2024-01-13",
      expiryDate: "2024-02-13",
      responseTime: "6 hours"
    },
    {
      id: "5",
      bidNumber: "BID-2024-005",
      carrierName: "Cross Country",
      lane: "Atlanta, GA → Portland, OR",
      status: "Expired",
      bidAmount: 2800,
      submissionDate: "2024-01-10",
      expiryDate: "2024-01-20",
      responseTime: "3 hours"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Awarded": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.bidNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.carrierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bid.lane.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || bid.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getTabBids = (tabStatus: string) => {
    if (tabStatus === "all-bids") return filteredBids;
    return filteredBids.filter(bid => bid.status.toLowerCase() === tabStatus);
  };

  const BidTable = ({ bids }: { bids: Bid[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bid Number</TableHead>
          <TableHead>Carrier</TableHead>
          <TableHead>Lane</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Response Time</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bids.map((bid) => (
          <TableRow key={bid.id}>
            <TableCell className="font-medium">{bid.bidNumber}</TableCell>
            <TableCell>{bid.carrierName}</TableCell>
            <TableCell>{bid.lane}</TableCell>
            <TableCell>${bid.bidAmount.toLocaleString()}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(bid.status)}>
                {bid.status}
              </Badge>
            </TableCell>
            <TableCell>{bid.submissionDate}</TableCell>
            <TableCell>{bid.expiryDate}</TableCell>
            <TableCell>{bid.responseTime}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
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
          <h1 className="text-3xl font-bold">Manage Bids</h1>
          <p className="text-muted-foreground">Track and manage all your transportation bids</p>
        </div>
        <Button>Create New Bid</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bids.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bids.filter(b => b.status === "Active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {bids.filter(b => b.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Awarded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bids.filter(b => b.status === "Awarded").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bids.reduce((sum, bid) => sum + bid.bidAmount, 0).toLocaleString()}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bids Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Bid Management</CardTitle>
          <CardDescription>View and manage all transportation bids</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all-bids">All Bids ({filteredBids.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({getTabBids("active").length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({getTabBids("pending").length})</TabsTrigger>
              <TabsTrigger value="awarded">Awarded ({getTabBids("awarded").length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all-bids" className="mt-4">
              <BidTable bids={getTabBids("all-bids")} />
            </TabsContent>

            <TabsContent value="active" className="mt-4">
              <BidTable bids={getTabBids("active")} />
            </TabsContent>

            <TabsContent value="pending" className="mt-4">
              <BidTable bids={getTabBids("pending")} />
            </TabsContent>

            <TabsContent value="awarded" className="mt-4">
              <BidTable bids={getTabBids("awarded")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBids;