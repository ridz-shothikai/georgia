'use client';

/**
 * Admin Dashboard Unauthorized Page
 * Handles scenarios where users don't have superadmin access
 */

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Unauthorized() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access the Admin Dashboard
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Superadmin Access Required
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  The Admin Dashboard is restricted to users with superadmin privileges. 
                  Your current role does not grant access to this area.
                </p>
              </div>
            </div>
          </div>
        </div>

        {user && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Current User Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Assigned Apps:</strong> {user.assignedApps.join(', ')}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoBack}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Go Back
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need access to a regular application?
          </p>
          <div className="mt-2 space-x-4">
            <a href="/app1" className="text-sm font-medium text-red-600 hover:text-red-500">
              Go to App1
            </a>
            <a href="/app2" className="text-sm font-medium text-red-600 hover:text-red-500">
              Go to App2
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}