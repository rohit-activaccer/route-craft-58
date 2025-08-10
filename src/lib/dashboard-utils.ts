import { DashboardOverview, RecentActivity } from './api';

export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'bid':
      return '📋';
    case 'bid_response':
      return '✍️';
    case 'carrier':
      return '🚛';
    case 'claim':
      return '📄';
    default:
      return '📊';
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'open':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
    case 'awarded':
    case 'successful':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'error':
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'open':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'completed':
    case 'awarded':
      return 'default';
    case 'closed':
    case 'cancelled':
      return 'outline';
    case 'error':
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const transformDashboardData = (overview: DashboardOverview) => {
  return [
    {
      title: "Active Bids",
      value: overview.bids.open.toString(),
      change: `${overview.bids.total} total`,
      icon: "📋",
      color: "text-blue-accent"
    },
    {
      title: "Registered Carriers",
      value: overview.carriers.total.toString(),
      change: `${overview.carriers.active} active`,
      icon: "🚛",
      color: "text-primary"
    },
    {
      title: "Total Lanes",
      value: overview.lanes.total.toString(),
      change: `${overview.lanes.active} active`,
      icon: "📍",
      color: "text-navy"
    },
    {
      title: "Total Value",
      value: formatCurrency(overview.financial.total_bid_value),
      change: `${formatCurrency(overview.financial.total_awarded_value)} awarded`,
      icon: "💰",
      color: "text-green-600"
    }
  ];
};

export const transformRecentActivities = (activities: RecentActivity[]) => {
  return activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: getActivityDescription(activity),
    time: formatTimestamp(activity.timestamp),
    status: activity.status,
    icon: getActivityIcon(activity.type)
  }));
};

const getActivityDescription = (activity: RecentActivity): string => {
  switch (activity.type) {
    case 'bid':
      return `Bid status: ${activity.status}`;
    case 'bid_response':
      return `Response received for bid`;
    case 'carrier':
      return `Carrier status: ${activity.status}`;
    case 'claim':
      return `Claim amount: $${activity.details.amount || 0}`;
    default:
      return 'Activity updated';
  }
}; 