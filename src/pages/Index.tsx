import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { MasterData } from "@/components/MasterData";
import { NetworkAnalysis } from "@/components/NetworkAnalysis";
import { CreateBid } from "@/components/CreateBid";
import { BidAnalysis } from "@/components/BidAnalysis";
import { InsuranceClaims } from "@/components/InsuranceClaims";
import { InviteCarriers } from "@/components/InviteCarriers";
import ManageBids from "@/components/ManageBids";
import BidAwards from "@/components/BidAwards";
import { Login } from "@/components/Login";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "master-data":
        return <MasterData />;
      case "network-analysis":
        return <NetworkAnalysis />;
      case "create-bid":
        return <CreateBid />;
      case "invite-carriers":
        return <InviteCarriers />;
      case "manage-bids":
        return <ManageBids />;
      case "bid-analysis":
        return <BidAnalysis />;
      case "bid-awards":
        return <BidAwards />;
      case "insurance-claims":
        return <InsuranceClaims />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
