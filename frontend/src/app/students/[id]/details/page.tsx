'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/Button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface StudentDetail {
  id: number;
  student_id: string;
  name: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
  counselor_name: string;
  source_type: string;
  source_name: string;
  date_of_opening: string;
  file_opening_fee_bdt: number;
  country: {
    name: string;
    currency_symbol: string;
  };
  application_fee_foreign: number;
  application_fee_bdt: number;
  exchange_rate_used: number;
  invoices: {
    id: number;
    invoice_id: string;
    payer_name: string;
    payer_phone_country_code: string;
    payer_phone_number: string;
    payment_method: string;
    payment_detail: string;
    total_amount_bdt: number;
    paid_amount_bdt: number;
    due_amount_bdt: number;
    created_at: string;
  }[];
}

const DetailRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider sm:w-52 shrink-0">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value ?? '—'}</span>
  </div>
);

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/students/${studentId}`);
        setStudent(res.data);
      } catch {
        setError('Failed to load student details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm font-semibold text-gray-500">Loading student details...</span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm w-full p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-sm font-bold text-red-600 mb-4">{error || 'Student not found.'}</p>
          <Button variant="action" onClick={() => router.push('/students')}>← Back to Students</Button>
        </div>
      </div>
    );
  }

  // Use the most recent invoice for payment display
  const latestInvoice = student.invoices && student.invoices.length > 0 ? student.invoices[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">

        {/* Header Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 relative">
          <div className="absolute top-8 left-8">
            <Button
              variant="back"
              onClick={() => router.push('/students')}
              className="flex items-center gap-2 px-4 py-2 text-sm shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>

          <div className="pt-8">
            <PageHeader title="Student Details" />
          </div>

          {/* Student Registration Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Registration Information</h3>
            </div>
            <div className="px-6 py-2">
              <DetailRow label="Student ID" value={student.student_id} />
              <DetailRow label="Full Name" value={student.name} />
              <DetailRow label="Phone No" value={`${student.phone_country_code} ${student.phone_number}`} />
              <DetailRow label="Email" value={student.email} />
              <DetailRow label="Date of Opening" value={new Date(student.date_of_opening).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
              <DetailRow label="Counselor Name" value={student.counselor_name} />
              <DetailRow label="Source Type" value={student.source_type === 'employee' ? 'Employee' : 'Social Media'} />
              <DetailRow label="Source Name" value={student.source_name} />
            </div>
          </div>

          {/* Financial Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-green-600 px-6 py-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Financial Information</h3>
            </div>
            <div className="px-6 py-2">
              <DetailRow label="File Opening Fee" value={`BDT ${parseFloat(String(student.file_opening_fee_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              <DetailRow
                label="Destination Country"
                value={student.country?.name}
              />
              <DetailRow
                label="Application Fee (Foreign)"
                value={`${student.country?.currency_symbol}${parseFloat(String(student.application_fee_foreign)).toFixed(2)}`}
              />
              <DetailRow
                label="Application Fee (BDT)"
                value={`BDT ${parseFloat(String(student.application_fee_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              />
              <DetailRow
                label="Exchange Rate Used"
                value={`1 ${student.country?.currency_symbol} = ${parseFloat(String(student.exchange_rate_used)).toFixed(4)} BDT`}
              />
            </div>
          </div>

          {/* Invoice Information Card */}
          {latestInvoice ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Latest Invoice — {student.invoices.length} total
                </h3>
              </div>
              <div className="px-6 py-2">
                <DetailRow label="Invoice ID" value={latestInvoice.invoice_id} />
                <DetailRow label="Payer's Name" value={latestInvoice.payer_name} />
                <DetailRow label="Payer's Phone" value={`${latestInvoice.payer_phone_country_code} ${latestInvoice.payer_phone_number}`} />
                <DetailRow label="Payment Method" value={latestInvoice.payment_method?.toUpperCase()} />
                {latestInvoice.payment_detail && (
                  <DetailRow label="Payment Detail" value={latestInvoice.payment_detail} />
                )}
                <DetailRow label="Total Amount" value={`BDT ${parseFloat(String(latestInvoice.total_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                <DetailRow label="Paid Amount" value={`BDT ${parseFloat(String(latestInvoice.paid_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
                <DetailRow label="Due Amount" value={`BDT ${parseFloat(String(latestInvoice.due_amount_bdt)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
              <span className="text-sm font-semibold text-yellow-600">No invoices have been generated for this student yet.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
