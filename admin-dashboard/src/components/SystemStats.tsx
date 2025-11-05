"use client";

/**
 * System Statistics Component
 * Displays system health, monitoring, and administrative statistics
 */

import { useState, useEffect } from "react";

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  activeApplications: number;
  systemUptime: string;
  lastBackup: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  type: "info" | "warning" | "error" | "success";
}

const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    action: "User Login",
    user: "admin@platform.com",
    details: "Successful admin login",
    type: "success",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: "User Created",
    user: "admin@platform.com",
    details: "Created new user: john@example.com",
    type: "info",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    action: "System Backup",
    user: "system",
    details: "Automated backup completed successfully",
    type: "success",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    action: "App Access Modified",
    user: "admin@platform.com",
    details: "Updated app access for user: jane@example.com",
    type: "info",
  },
];

export default function SystemStats() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalApplications: 3,
    activeApplications: 3,
    systemUptime: "0 days, 0 hours",
    lastBackup: new Date().toISOString(),
    diskUsage: 45,
    memoryUsage: 68,
    cpuUsage: 23,
  });
  const [activityLogs, setActivityLogs] =
    useState<ActivityLog[]>(MOCK_ACTIVITY_LOGS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemMetrics();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchSystemMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("access_token");

      // Fetch users data
      const usersResponse = await fetch(
        "http://localhost:5005/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const users = usersData.data || [];

        // Calculate system uptime (mock calculation)
        const uptimeHours = Math.floor(Math.random() * 24) + 1;
        const uptimeDays = Math.floor(uptimeHours / 24);
        const remainingHours = uptimeHours % 24;

        setMetrics((prev) => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter((user: any) => user.status !== "inactive")
            .length,
          systemUptime: `${uptimeDays} days, ${remainingHours} hours`,
          // Simulate varying system metrics
          diskUsage: Math.floor(Math.random() * 30) + 40,
          memoryUsage: Math.floor(Math.random() * 40) + 50,
          cpuUsage: Math.floor(Math.random() * 50) + 10,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch system metrics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSystemMetrics();
  };

  const handleBackup = async () => {
    try {
      // Simulate backup process
      setMetrics((prev) => ({
        ...prev,
        lastBackup: new Date().toISOString(),
      }));

      // Add activity log
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action: "Manual Backup",
        user: "admin@platform.com",
        details: "Manual backup initiated successfully",
        type: "success",
      };

      setActivityLogs((prev) => [newLog, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Backup failed:", error);
    }
  };

  const getStatusColor = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✗";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-blue-600";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading system statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Statistics</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <span className="mr-2">🔄</span>
                Refresh
              </>
            )}
          </button>
          <button
            onClick={handleBackup}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            <span className="mr-2">💾</span>
            Backup Now
          </button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.activeUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Applications</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.activeApplications}/{metrics.totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">⏱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">System Uptime</p>
              <p className="text-lg font-semibold text-gray-900">
                {metrics.systemUptime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            System Health
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-medium">{metrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(
                    metrics.cpuUsage
                  )}`}
                  style={{ width: `${metrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memory Usage</span>
                <span className="font-medium">{metrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(
                    metrics.memoryUsage
                  )}`}
                  style={{ width: `${metrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Disk Usage</span>
                <span className="font-medium">{metrics.diskUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getStatusColor(
                    metrics.diskUsage
                  )}`}
                  style={{ width: `${metrics.diskUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Last Backup:</span>
              <span className="text-gray-900">
                {new Date(metrics.lastBackup).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    log.type === "success"
                      ? "bg-green-100"
                      : log.type === "error"
                      ? "bg-red-100"
                      : log.type === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  <span className={getActivityColor(log.type)}>
                    {getActivityIcon(log.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  <p className="text-xs text-gray-500">by {log.user}</p>
                </div>
              </div>
            ))}
          </div>

          {activityLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          System Actions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="mr-2">📊</span>
            Generate Report
          </button>

          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="mr-2">🔍</span>
            View Audit Logs
          </button>

          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="mr-2">⚙️</span>
            System Settings
          </button>
        </div>
      </div>
    </div>
  );
}
