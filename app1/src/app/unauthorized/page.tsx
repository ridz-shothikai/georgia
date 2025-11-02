'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          You don't have permission to access App1.
        </p>

        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Access</h3>
            <div className="space-y-3 text-left">
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
                  {user.assignedApps && user.assignedApps.length > 0 ? (
                    user.assignedApps.map((app) => (
                      <span
                        key={app}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {app}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No apps assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-600">
              You are not currently logged in. Please sign in to access the platform.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {user ? (
            <>
              {user.assignedApps && user.assignedApps.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    You have access to these applications:
                  </p>
                  <div className="space-y-2">
                    {user.assignedApps.map((app) => (
                      <Link
                        key={app}
                        href={`/${app}`}
                        className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                      >
                        Go to {app.charAt(0).toUpperCase() + app.slice(1)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Need Access?</h4>
          <p className="text-xs text-gray-600">
            Contact your system administrator to request access to App1. 
            Make sure to include your email address and the reason for access.
          </p>
        </div>
      </div>
    </div>
  );
}