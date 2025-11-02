'use client';

/**
 * Unauthorized Page for App2
 * Displayed when user doesn't have access to App2
 */

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

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
          <div className="mx-auto h-12 w-12 text-red-600">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access App2
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Current User Information
              </h3>
              {user && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Role:</span> {user.role}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Assigned Apps:</span>{' '}
                    {user.assignedApps?.join(', ') || 'None'}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What you can do:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contact your administrator to request access to App2</li>
                <li>• Check if you have access to other applications</li>
                <li>• Log out and sign in with a different account</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleGoBack}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Unified Multi-App Platform - App2
          </p>
        </div>
      </div>
    </div>
  );
}