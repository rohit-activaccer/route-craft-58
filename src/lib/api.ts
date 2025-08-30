//const API_BASE_URL = 'http://localhost:8000/api/v1';
const API_BASE_URL = '/api/v1';
//const API_BASE_URL = "https://procure.activaccer.ai/api/v1";
//const API_BASE_URL = "http://34.131.14.55:8000/api/v1";

export interface DashboardOverview {
  users: {
    total: number;
  };
  carriers: {
    total: number;
    active: number;
    utilization_percentage: number;
  };
  lanes: {
    total: number;
    active: number;
    utilization_percentage: number;
  };
  bids: {
    total: number;
    open: number;
    awarded: number;
    success_rate_percentage: number;
  };
  responses: {
    total: number;
    pending: number;
  };
  claims: {
    total: number;
    pending: number;
  };
  financial: {
    total_bid_value: number;
    total_awarded_value: number;
    total_claims_value: number;
  };
}

export interface RecentActivity {
  type: string;
  id: string;
  title: string;
  status: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface PerformanceMetrics {
  period: string;
  total_bids: number;
  successful_bids: number;
  average_response_time: number;
  cost_savings: number;
  carrier_participation: number;
}

export interface CarrierPerformance {
  carrier_id: string;
  carrier_name: string;
  total_bids: number;
  successful_bids: number;
  success_rate: number;
  average_rating: number;
  total_value: number;
}

export interface FinancialSummary {
  period: string;
  total_spend: number;
  total_savings: number;
  cost_per_mile: number;
  budget_utilization: number;
  forecast: number;
}

export interface SystemHealth {
  status: string;
  uptime: number;
  response_time: number;
  error_rate: number;
  active_connections: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Dashboard endpoints (using development version without auth)
  async getDashboardOverview(): Promise<{ message: string; overview: DashboardOverview }> {
    return this.request('/dashboard-dev/overview');
  }

  async getRecentActivity(limit: number = 10): Promise<{ message: string; activities: RecentActivity[] }> {
    return this.request(`/dashboard-dev/recent-activity?limit=${limit}`);
  }

  async getPerformanceMetrics(period: string = '30d'): Promise<{ message: string; metrics: PerformanceMetrics }> {
    return this.request(`/dashboard/performance-metrics?period=${period}`);
  }

  async getCarrierPerformance(): Promise<{ message: string; carriers: CarrierPerformance[] }> {
    return this.request('/dashboard/carrier-performance');
  }

  async getFinancialSummary(period: string = '30d'): Promise<{ message: string; summary: FinancialSummary }> {
    return this.request(`/dashboard/financial-summary?period=${period}`);
  }

  async getSystemHealth(): Promise<{ message: string; health: SystemHealth }> {
    return this.request('/dashboard/system-health');
  }

  // Bids endpoints
  async getBids(): Promise<any> {
    return this.request('/bids/dev');
  }

  async getBidById(id: string): Promise<any> {
    return this.request(`/bids/${id}`);
  }

  async createBid(bidData: any): Promise<any> {
    return this.request('/bids/dev', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  // Carriers endpoints
  async getCarriers(): Promise<any> {
    return this.request('/carriers');
  }

  async getCarrierById(id: string): Promise<any> {
    return this.request(`/carriers/${id}`);
  }

  // Lanes endpoints
  async getLanes(): Promise<any> {
    return this.request('/lanes');
  }

  async getLaneById(id: string): Promise<any> {
    return this.request(`/lanes/${id}`);
  }
}

export const apiService = new ApiService(); 
