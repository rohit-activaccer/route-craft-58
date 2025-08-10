import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TestData {
  overview: any;
  activities: any[];
}

export function DataTest() {
  const [data, setData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, activitiesRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/dashboard-dev/overview'),
        fetch('http://localhost:8000/api/v1/dashboard-dev/recent-activity?limit=5')
      ]);

      if (!overviewRes.ok || !activitiesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const overview = await overviewRes.json();
      const activities = await activitiesRes.json();

      setData({
        overview: overview.overview,
        activities: activities.activities
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading test data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error: {error}
            <Button onClick={fetchData} className="ml-4">Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MySQL Database Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Overview Data:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(data.overview, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Recent Activities:</h3>
              <div className="space-y-2">
                {data.activities.map((activity, index) => (
                  <div key={index} className="border p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.title}</span>
                      <Badge variant="outline">{activity.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.type}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={fetchData} className="mt-4">Refresh Data</Button>
        </CardContent>
      </Card>
    </div>
  );
} 