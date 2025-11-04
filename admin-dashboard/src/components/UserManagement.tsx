/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * User Management Component
 * Comprehensive user management interface for admin dashboard
 */

import { useState, useEffect } from "react";

interface User {
  _id: string;
  email: string;
  role: string;
  assignedApps: string[];
  fileCategories?: string[]; // NEW
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface CreateUserForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  assignedApps: string[];
  fileCategories: string[]; // NEW
}

const AVAILABLE_APPS = [
  { id: "region14", name: "Region 14", url: "http://localhost:3000/region14" },
  { id: "region2", name: "Region 2", url: "http://localhost:3000/region2" },
  {
    id: "dashboard",
    name: "Dashboard",
    url: "http://localhost:3000/dashboard",
  },
];

const FILE_CATEGORIES = [
  { id: "reports", label: "Reports" },
  { id: "invoices", label: "Invoices" },
  { id: "contracts", label: "Contracts" },
];

const ROLES = [
  { value: "user", label: "Regular User" },
  { value: "gadhs-it-staff", label: "GADHS IT STAFF" },
  { value: "director", label: "Director" },
  { value: "manager", label: "Manager" },
  { value: "clerk", label: "Clerk" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // NEW
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    assignedApps: [],
    fileCategories: [], // NEW
  });

  const [formErrors, setFormErrors] = useState<Partial<CreateUserForm>>({});
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<CreateUserForm> = {};

    if (!createForm.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) {
      errors.email = "Invalid email format";
    }

    if (!createForm.password) {
      errors.password = "Password is required";
    } else if (createForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (createForm.assignedApps.length === 0) {
      // note: preserve same type shape for message rendering
      (errors as any).assignedApps = ["At least one app must be assigned"];
    }

    if (createForm.fileCategories.length === 0) {
      (errors as any).fileCategories = [
        "At least one file category must be selected",
      ];
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("fileCategories", createForm.fileCategories);

    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: createForm.email,
            password: createForm.password,
            role: createForm.role,
            assignedApps: createForm.assignedApps,
            fileCategories: createForm.fileCategories, // NEW
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create user");
      }

      await response.json();
      setNotification({
        type: "success",
        message: "User created successfully!",
      });
      setShowCreateForm(false);
      setCreateForm({
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        assignedApps: [],
        fileCategories: [], // reset
      });
      setFormErrors({});
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create user",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setNotification({
        type: "success",
        message: "User deleted successfully!",
      });
      fetchUsers(); // Refresh the user list
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete user",
      });
    }
  };

  const handleAppToggle = (appId: string) => {
    setCreateForm((prev) => ({
      ...prev,
      assignedApps: prev.assignedApps.includes(appId)
        ? prev.assignedApps.filter((id) => id !== appId)
        : [...prev.assignedApps, appId],
    }));
  };

  const handleFileCategoryToggle = (catId: string) => {
    setCreateForm((prev) => ({
      ...prev,
      fileCategories: prev.fileCategories.includes(catId)
        ? prev.fileCategories.filter((id) => id !== catId)
        : [...prev.fileCategories, catId],
    }));
  };

  console.log("Users", users);

  const filteredUsers =
    users &&
    users.filter((user) => {
      const matchesSearch = user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesCategory =
        !filterCategory ||
        (user.fileCategories && user.fileCategories.includes(filterCategory));
      return matchesSearch && matchesRole && matchesCategory;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`rounded-md p-4 ${
            notification.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-red-400">✗</span>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create New User"}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Create New User
          </h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="user@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Minimum 6 characters"
                />
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500 ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Applications *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AVAILABLE_APPS.map((app) => (
                  <label
                    key={app.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={createForm.assignedApps.includes(app.id)}
                      onChange={() => handleAppToggle(app.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{app.name}</span>
                  </label>
                ))}
              </div>
              {formErrors.assignedApps && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors as any).assignedApps}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Categories *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FILE_CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={createForm.fileCategories.includes(cat.id)}
                      onChange={() => handleFileCategoryToggle(cat.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{cat.label}</span>
                  </label>
                ))}
              </div>
              {formErrors.fileCategories && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors as any).fileCategories}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-500"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All Roles</option>
              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="">All Categories</option>
              {FILE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            All Users ({filteredUsers.length})
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Apps
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.email}
                          </div>
                          {user.lastLogin && (
                            <div className="text-sm text-gray-500">
                              Last login:{" "}
                              {new Date(user.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </div>
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
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.assignedApps.map((appId) => {
                          const app = AVAILABLE_APPS.find(
                            (a) => a.id === appId
                          );
                          return (
                            <span
                              key={appId}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {app?.name || appId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(user.fileCategories || []).map((catId) => {
                          const cat = FILE_CATEGORIES.find(
                            (c) => c.id === catId
                          );
                          return (
                            <span
                              key={catId}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                            >
                              {cat?.label || catId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No users found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
