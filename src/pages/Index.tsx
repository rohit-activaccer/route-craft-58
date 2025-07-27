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

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");

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
