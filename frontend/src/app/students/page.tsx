'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { ArrowLeft, Search, Loader2, User } from 'lucide-react';
import api from '@/lib/api';

interface StudentRow {
  id: number;
  student_id: string;
  name: string;
  phone_country_code: string;
  phone_number: string;
  invoiceCount: number;
}

export default function StudentsInfoPage() {
  const router = useRouter();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [error, setError] = useState('');

  const fetchStudents = async (name?: string, invoice_id?: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (name) params.name = name;
      if (invoice_id) params.invoice_id = invoice_id;
      const res = await api.get('/students', { params });
      setStudents(res.data);
    } catch {
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = () => {
    fetchStudents(nameFilter, invoiceFilter);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 relative animate-in fade-in duration-300">

        {/* Top Left Red Back Button */}
        <div className="absolute top-8 left-8">
          <Button
            variant="back"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="pt-8">
          <PageHeader title="Students Information" />
        </div>

        {/* Search Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search by Name</label>
            <input
              type="text"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter student name..."
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search by Invoice No</label>
            <input
              type="text"
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. NextEd/Fac/Joh/001/1"
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <Button
            variant="action"
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-2 text-sm shrink-0"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <span className="text-sm font-bold text-red-600">{error}</span>
          </div>
        )}

        {/* Students Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <span className="text-sm font-semibold text-gray-500">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <User className="h-16 w-16 opacity-30" />
            <span className="text-sm font-semibold">No students found. Try adjusting filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Student ID</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Phone No</th>
                  <th className="text-center px-5 py-3 font-bold text-xs uppercase tracking-wider">Invoice No</th>
                  <th className="text-center px-5 py-3 font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr
                    key={student.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-blue-50/30 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-blue-700">{student.student_id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{student.name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {student.phone_country_code} {student.phone_number}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                        {student.invoiceCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="action"
                          onClick={() => router.push(`/students/${student.id}/details`)}
                          className="px-3 py-1.5 text-xs"
                        >
                          Details
                        </Button>
                        <Button
                          variant="action"
                          onClick={() => router.push(`/students/${student.id}/update`)}
                          className="px-3 py-1.5 text-xs"
                        >
                          Update
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && students.length > 0 && (
          <p className="text-xs font-bold text-gray-400 text-right">
            Showing {students.length} student{students.length !== 1 ? 's' : ''}
          </p>
        )}

      </div>
    </div>
  );
}
