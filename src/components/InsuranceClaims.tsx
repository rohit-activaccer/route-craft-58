import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  FileUp,
  Eye,
  Download
} from "lucide-react";

interface Claim {
  id: string;
  claimNumber: string;
  claimType: string;
  incidentDate: string;
  claimAmount: number;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'paid';
  submittedDate: string;
  description: string;
  documents: string[];
}

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  description: string;
}

const mockClaims: Claim[] = [
  {
    id: "1",
    claimNumber: "CLM-2024-001",
    claimType: "Vehicle Damage",
    incidentDate: "2024-01-15",
    claimAmount: 15000,
    status: "under-review",
    submittedDate: "2024-01-16",
    description: "Truck collision during delivery route",
    documents: ["incident_report.pdf", "photos.zip", "police_report.pdf"]
  },
  {
    id: "2", 
    claimNumber: "CLM-2024-002",
    claimType: "Cargo Loss",
    incidentDate: "2024-01-20",
    claimAmount: 8500,
    status: "approved",
    submittedDate: "2024-01-21",
    description: "Cargo theft at rest stop",
    documents: ["theft_report.pdf", "cargo_manifest.pdf"]
  }
];

const workflowSteps: WorkflowStep[] = [
  {
    id: "1",
    title: "Claim Submitted",
    status: "completed",
    date: "2024-01-16",
    description: "Initial claim and documents submitted"
  },
  {
    id: "2", 
    title: "Documentation Review",
    status: "completed",
    date: "2024-01-18",
    description: "All required documents verified"
  },
  {
    id: "3",
    title: "Investigation",
    status: "current",
    description: "Claim under investigation by adjuster"
  },
  {
    id: "4",
    title: "Approval Decision", 
    status: "pending",
    description: "Final approval/rejection decision"
  },
  {
    id: "5",
    title: "Payment Processing",
    status: "pending", 
    description: "Refund processing and payment"
  }
];

export function InsuranceClaims() {
  const [activeTab, setActiveTab] = useState("claims");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'under-review': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'approved': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'under-review': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Insurance Claims
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage insurance claims, upload documents, and track refund workflows
          </p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow shadow-lg">
          <FileUp className="w-4 h-4 mr-2" />
          New Claim
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="claims">Claims Overview</TabsTrigger>
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-6">
          <div className="grid gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Active Claims
                </CardTitle>
                <CardDescription>
                  Review and manage your insurance claims
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockClaims.map((claim) => (
                    <div key={claim.id} 
                         className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors cursor-pointer"
                         onClick={() => setSelectedClaim(claim)}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{claim.claimNumber}</span>
                          <Badge className={getStatusColor(claim.status)}>
                            {getStatusIcon(claim.status)}
                            <span className="ml-1 capitalize">{claim.status.replace('-', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{claim.claimType}</p>
                        <p className="text-sm font-medium">${claim.claimAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Incident: {claim.incidentDate}</p>
                        <p>Submitted: {claim.submittedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedClaim && (
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Claim Details - {selectedClaim.claimNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Claim Type</Label>
                      <p className="text-sm text-muted-foreground">{selectedClaim.claimType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Claim Amount</Label>
                      <p className="text-sm text-muted-foreground">${selectedClaim.claimAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Incident Date</Label>
                      <p className="text-sm text-muted-foreground">{selectedClaim.incidentDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge className={getStatusColor(selectedClaim.status)}>
                        {getStatusIcon(selectedClaim.status)}
                        <span className="ml-1 capitalize">{selectedClaim.status.replace('-', ' ')}</span>
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedClaim.description}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedClaim.documents.map((doc, index) => (
                        <Button key={index} variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          {doc}
                          <Download className="w-4 h-4 ml-2" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="submit" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Submit New Claim
              </CardTitle>
              <CardDescription>
                Provide claim details and upload supporting documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimType">Claim Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehicle-damage">Vehicle Damage</SelectItem>
                      <SelectItem value="cargo-loss">Cargo Loss</SelectItem>
                      <SelectItem value="cargo-damage">Cargo Damage</SelectItem>
                      <SelectItem value="liability">Liability</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Incident Date</Label>
                  <Input type="date" id="incidentDate" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="claimAmount">Estimated Claim Amount</Label>
                  <Input type="number" id="claimAmount" placeholder="$0.00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input type="text" id="policyNumber" placeholder="Enter policy number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Incident Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Provide detailed description of the incident..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <Label>Upload Documents & Evidence</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <Input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    id="fileUpload"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('fileUpload')?.click()}
                  >
                    Choose Files
                  </Button>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setUploadedFiles(files => files.filter((_, i) => i !== index))}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow shadow-lg">
                Submit Claim
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflow" className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Refund Workflow
              </CardTitle>
              <CardDescription>
                Track the progress of your claim through the refund process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        step.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : step.status === 'current'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-muted border-border text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <div className={`w-0.5 h-12 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-border'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{step.title}</h3>
                        {step.status === 'current' && (
                          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                      {step.date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {step.date}
                        </p>
                      )}
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
}