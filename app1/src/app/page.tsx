'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function App1HomePage() {
  const { user, isLoading, logout } = useAuth();
  
  // get and save access_token from local storage to state
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);


  // if user is null after loding then redirect to login page


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if(!user){
    return <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-2xl font-bold text-black mb-4">
            You need to login first.
          </p>
          <button
            onClick={() => window.location.href = 'http://localhost:3000/login'}
            className="px-6 py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">App1</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Unified Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-sm text-gray-700">
                    Welcome, {user && user.email}
                  </span>
                  {/* <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    {user && user.role}
                  </span> */}
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Region 14
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            This is the first application in our unified multi-app platform. 
            You have successfully authenticated and gained access to this application.
          </p>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Assigned Apps</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.assignedApps?.map((app) => (
                    <span
                      key={app}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Access</h3>
            <p className="text-gray-600">
              Your access to this application is secured through our unified authentication system.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">High Performance</h3>
            <p className="text-gray-600">
              Built with Next.js 16 and modern technologies for optimal performance and user experience.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unified Platform</h3>
            <p className="text-gray-600">
              Part of a comprehensive multi-app platform with centralized user management and authentication.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        {user?.role === 'superadmin' && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
            <div className="space-x-4">
              <a
                href={`http://localhost:3002/?access=${accessToken}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Region 2
              </a>
              <a
                href="http://localhost:3000"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Admin Dashboard
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
