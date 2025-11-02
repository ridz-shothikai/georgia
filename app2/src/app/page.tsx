'use client';

/**
 * App2 Main Page
 * Dashboard for Application 2 of the Unified Multi-App Platform
 */

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function App2Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();


    // get and save access_token from local storage to state
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  console.log("user", user);
  const parsedUser = user as any;

  const handleLogout = async () => {
    await logout();
    router.push('http://localhost:3000/login');
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Region 2</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {parsedUser && parsedUser.user.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {parsedUser && parsedUser.user.role}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">2</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Application
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Region 2 App
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">U</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        User Role
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 capitalize">
                        {user.role}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* App Access Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        App Access
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {user.assignedApps?.length || 0} Apps
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  App2 Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Feature 1</h4>
                    <p className="text-sm text-gray-600">
                      This is a placeholder for App2 specific functionality.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Feature 2</h4>
                    <p className="text-sm text-gray-600">
                      Another feature specific to Application 2.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Feature 3</h4>
                    <p className="text-sm text-gray-600">
                      Additional functionality for App2 users.
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Feature 4</h4>
                    <p className="text-sm text-gray-600">
                      More App2 specific features and capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
        {parsedUser?.user?.role === 'superadmin' && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Access</h3>
            <div className="space-x-4">
              <a
                href={`http://localhost:3001/?access=${accessToken}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Region 14
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
        </div>
      </main>
    </div>
  );
}
