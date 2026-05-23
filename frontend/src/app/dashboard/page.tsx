'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { UserPlus, ClipboardList, FileText, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem('nexted_token');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-300">
        <PageHeader title="Management Panel" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <Button
            variant="dashboard"
            onClick={() => router.push('/students/add')}
            className="flex flex-col items-center justify-center gap-4 py-8 rounded-2xl shadow-lg text-lg select-none"
          >
            <UserPlus className="h-10 w-10 text-white" />
            <span>Add Student</span>
          </Button>

          <Button
            variant="dashboard"
            onClick={() => router.push('/students')}
            className="flex flex-col items-center justify-center gap-4 py-8 rounded-2xl shadow-lg text-lg select-none"
          >
            <ClipboardList className="h-10 w-10 text-white" />
            <span>Students Information</span>
          </Button>

          <Button
            variant="dashboard"
            onClick={() => router.push('/invoices')}
            className="flex flex-col items-center justify-center gap-4 py-8 rounded-2xl shadow-lg text-lg select-none"
          >
            <FileText className="h-10 w-10 text-white" />
            <span>Invoice History</span>
          </Button>

          <Button
            variant="dashboard"
            onClick={handleLogout}
            className="flex flex-col items-center justify-center gap-4 py-8 rounded-2xl shadow-lg text-lg select-none"
          >
            <LogOut className="h-10 w-10 text-white" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
