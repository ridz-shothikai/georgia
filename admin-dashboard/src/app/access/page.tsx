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
    // await logout();
    // router.push('/login');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
       
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

  


      </div>
    </div>
  );
}