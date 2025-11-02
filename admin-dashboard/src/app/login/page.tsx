"use client";

/**
 * Unified Login Page
 * Handles authentication for all user types (superadmin, app1 users, app2 users)
 * Redirects users based on their role and assigned apps
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function UnifiedLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // log isAuthenticated
  // console.log('UnifiedLogin - isAuthenticated:', isAuthenticated, user);

  // console.log('UnifiedLogin initial state:', { email, password, error, isLoading, user, authLoading });

  // Redirect if already authenticated
  useEffect(() => {
    console.log("Ude errorfcsdlskfjlkfjgl");
    if (isAuthenticated) {
      console.log("+++++++:", isAuthenticated, user);
      const access_token = localStorage.getItem("access_token");
      console.log(access_token);
      if (!authLoading && user) {
        console.log(">>>>>>>>", user);
        // Redirect based on user role
        if (user.role === "superadmin") {
          console.log("Redirecting superadmin to /");
          router.push("/");
        } else if (user.assignedApps.includes("app1")) {
          router.push(
            "http://localhost:3001/access?access_token=" + access_token,
          );
        } else if (user.assignedApps.includes("app2")) {
          router.push(
            "http://localhost:3002/access?access_token=" +
              localStorage.getItem("access_token"),
          );
        } else {
          setError("No app access assigned. Please contact administrator.");
        }
      }
    }
  }, [user, authLoading, router, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result: any = await login(email, password);

      if (result.success && result.user && result.tokens) {
        // Store tokens in localStorage
        try {
          localStorage.setItem("access_token", result.tokens.accessToken);
          localStorage.setItem("refresh_token", result.tokens.refreshToken);
        } catch (storageError) {
          console.error(
            "Failed to store tokens in localStorage:",
            storageError,
          );
          setError("Failed to store authentication tokens. Please try again.");
          return;
        }

        // Redirect based on user role
        switch (result.user.role) {
          case "superadmin":
            router.push("/");
            break;
          case "user":
            // For regular users, redirect to their first assigned app
            if (result.user.assignedApps.includes("app1")) {
              router.push("/app1");
            } else if (result.user.assignedApps.includes("app2")) {
              router.push("/app2");
            } else {
              setError("No app access assigned. Please contact administrator.");
            }
            break;
          default:
            setError("Unknown user role");
        }
      } else {
        setError(
          result.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to start use the application
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the administrative interface
          </p>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Restricted Access:</strong> Once logged based on Your
                  Permission you will be redirected to spesific region.
                </p>
              </div>
            </div>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-red-500 group-hover:text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Development Credentials Display */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Development Mode - Admin Credentials
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p className="mb-2">Use these credentials for testing:</p>
                    <div className="bg-white rounded border p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Email:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                            "admin@platform.com"}
                        </code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Password:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
                            "change-this-password"}
                        </code>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-blue-600">
                      * These credentials are only visible in development mode
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
