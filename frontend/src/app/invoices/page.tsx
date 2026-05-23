'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { ArrowLeft, Search, Loader2, FileText } from 'lucide-react';
import api from '@/lib/api';

interface InvoiceRow {
  id: number;
  invoice_id: string;
  studentName: string;
  created_at: string;
  pdf_path: string;
}

export default function InvoiceHistoryPage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceFilter, setInvoiceFilter] = useState('');
  const [error, setError] = useState('');

  const fetchInvoices = async (invoice_id?: string) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (invoice_id) params.invoice_id = invoice_id;
      const res = await api.get('/invoices', { params });
      setInvoices(res.data);
    } catch {
      setError('Failed to load invoice history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSearch = () => {
    fetchInvoices(invoiceFilter);
  };

  const handleOpenPdf = async (invoiceId: number) => {
    try {
      const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      setError('Failed to open PDF. You may need to log in again.');
    }
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
          <PageHeader title="Invoice History" />
        </div>

        {/* Search Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-end p-4 bg-gray-50 rounded-xl border border-gray-100">
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

        {/* Invoice Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <span className="text-sm font-semibold text-gray-500">Loading invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <FileText className="h-16 w-16 opacity-30" />
            <span className="text-sm font-semibold">No invoices found. Try adjusting filters.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Invoice ID</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Student Name</th>
                  <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wider">Date</th>
                  <th className="text-center px-5 py-3 font-bold text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
                  <tr
                    key={invoice.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-blue-50/30 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-5 py-3 font-mono text-xs font-bold text-blue-700">{invoice.invoice_id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{invoice.studentName}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {new Date(invoice.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="action"
                          onClick={() => handleOpenPdf(invoice.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View PDF</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && invoices.length > 0 && (
          <p className="text-xs font-bold text-gray-400 text-right">
            Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
          </p>
        )}

      </div>
    </div>
  );
}
