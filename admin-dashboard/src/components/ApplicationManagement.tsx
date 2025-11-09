"use client";

/**
 * Application Management Component
 * Interface for managing applications and user access control
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Application {
  id: string;
  name: string;
  url: string;
  description: string;
  status: "active" | "inactive";
  userCount: number;
  lastUpdated: string;
}

interface UserAppAccess {
  userId: string;
  email: string;
  role: string;
  assignedApps: string[];
}

const APPLICATIONS: Application[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    url: "http://localhost:3000/dashboard",
    description: "Administrative interface for system management",
    status: "active",
    userCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "region14",
    name: "Region 14",
    url: "http://localhost:3000/region14",
    description: "Primary business application for core operations",
    status: "active",
    userCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "region2",
    name: "Region 2",
    url: "http://localhost:3000/region2",
    description: "Secondary application for specialized workflows",
    status: "active",
    userCount: 0,
    lastUpdated: new Date().toISOString(),
  },
];

export default function ApplicationManagement() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>(APPLICATIONS);
  const [users, setUsers] = useState<UserAppAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [showAccessControl, setShowAccessControl] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchApplicationData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      // Fetch users to get app access information
      const usersResponse = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const usersList = usersData?.data?.users || [];
        console.log("🚀 ~ fetchApplicationData ~ usersList:", usersList);
        setUsers(usersList);

        // Update application user counts
        const updatedApps = applications.map((app) => ({
          ...app,
          userCount: usersList.filter((user: any) =>
            user.assignedApps.includes(app.id)
          ).length,
        }));
        setApplications(updatedApps);
      }
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      setNotification({
        type: "error",
        message: "Failed to load application data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppStatusToggle = async (appId: string) => {
    try {
      const app = applications.find((a) => a.id === appId);
      if (!app) return;

      const newStatus = app.status === "active" ? "inactive" : "active";

      // Update local state
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: newStatus, lastUpdated: new Date().toISOString() }
            : a
        )
      );

      setNotification({
        type: "success",
        message: `${app.name} ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to update application status",
      });
    }
  };

  const handleRemoveUserAccess = async (userId: string, appId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const user = users.find((u) => u.userId === userId);
      if (!user) return;

      const updatedApps = user.assignedApps.filter((id) => id !== appId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignedApps: updatedApps,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update user access");
      }

      setNotification({
        type: "success",
        message: "User access updated successfully",
      });
      fetchApplicationData(); // Refresh data
    } catch (error) {
      setNotification({
        type: "error",
        message: "Failed to update user access",
      });
    }
  };

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAppUsers = (appId: string) => {
    return users.filter((user) => user.assignedApps.includes(appId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Region Management</h2>
        {/* <button
          onClick={() => setShowAccessControl(!showAccessControl)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {showAccessControl ? 'Hide Access Control' : 'Manage Access Control'}
        </button> */}
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <input
          type="text"
          placeholder="Search regions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
        />
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((app) => (
          <div
            key={app.id}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {app.name}
                </h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    app.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{app.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">URL:</span>
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 truncate ml-2"
                  >
                    {app.url}
                  </a>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Users:</span>
                  <span className="font-medium">{app.userCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="text-gray-700">
                    {new Date(app.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleAppStatusToggle(app.id)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    app.status === "active"
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {app.status === "active" ? "Deactivate" : "Activate"}
                </button>
                {app.status === "active" && (
                  <button
                    onClick={() => {
                      // setSelectedApp(selectedApp === app.id ? null : app.id);
                      const access_token = localStorage.getItem("access_token");

                      window.location.href =
                        app.url + "?access_token=" + access_token;
                    }}
                    className="flex-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Go to Portal
                  </button>
                )}
              </div>

              {/* App Users List */}
              {selectedApp === app.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Users with Access ({getAppUsers(app.id).length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getAppUsers(app.id).map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <span className="text-gray-900">{user.email}</span>
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              user.role === "superadmin"
                                ? "bg-red-100 text-red-700"
                                : user.role === "admin"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        {user.role !== "superadmin" && (
                          <button
                            onClick={() =>
                              handleRemoveUserAccess(user.userId, app.id)
                            }
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    {getAppUsers(app.id).length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No users assigned to this application
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Access Control Panel */}
      {showAccessControl && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Application Access Control
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {applications.map((app) => (
                    <th
                      key={app.id}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {app.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "superadmin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "admin"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {applications.map((app) => (
                      <td
                        key={app.id}
                        className="px-6 py-4 whitespace-nowrap text-center"
                      >
                        {user.assignedApps.includes(app.id) ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-300">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {filteredApplications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No applications found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
