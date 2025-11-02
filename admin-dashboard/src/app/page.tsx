"use client";

/**
 * Admin Dashboard Main Page
 * Comprehensive administrative interface for the Unified Multi-App Platform
 */

import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserManagement from "../components/UserManagement";
import ApplicationManagement from "@/components/ApplicationManagement";
import SystemStats from "@/components/SystemStats";
import RouteGuard from "../components/RouteGuard";

type ActiveTab = "overview" | "users" | "system";

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalApps: 3,
    systemHealth: "Good",
  });

  // call verify token api
  const verifyToken = async () => {
    try {
      const response = await fetch("/api/admin/verify-token", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data.isValid) {
          return true;
        }
      }
    } catch (error) {
      console.error("Failed to verify token:", error);
    }
    return false;
  };

  useEffect(() => {
    // Fetch system stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.data || stats);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600">
          <h1>Please login</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="">
          <a href="/login" className="text-blue-600 hover:text-blue-800">Please login</a>
        </div>
      </div>)
  }

  const tabs = [
    { id: "overview" as ActiveTab, name: "Overview", icon: "📊" },
    { id: "users" as ActiveTab, name: "User Management", icon: "👥" },
    { id: "system" as ActiveTab, name: "System", icon: "⚙️" },
  ];

  return (
    <RouteGuard requireAuth={true} requireSuperAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user?.email}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {activeTab === "overview" && (
              <div>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">👥</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Users
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.totalUsers}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">✅</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Active Users
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.activeUsers}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">🚀</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Applications
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.totalApps}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">💚</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              System Health
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {stats.systemHealth}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All the Application will be here.  */}
                <ApplicationManagement />
              </div>
            )}

            {activeTab === "users" && <UserManagement />}
            {activeTab === "system" && <SystemStats />}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
