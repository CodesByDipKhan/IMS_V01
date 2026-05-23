'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { InputField } from '@/components/InputField';
import { PhoneInput } from '@/components/PhoneInput';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ArrowLeft, Loader2, Printer, FileCheck } from 'lucide-react';
import api from '@/lib/api';

interface StudentDetail {
  id: number;
  student_id: string;
  name: string;
  phone_country_code: string;
  phone_number: string;
  email: string;
  file_opening_fee_bdt: number;
  application_fee_bdt: number;
}

export default function UpdateStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  // Student profile editable fields
  const [name, setName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Full student data (for total amount)
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);

  // Payment fields
  const [payingSelf, setPayingSelf] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerPhoneCountryCode, setPayerPhoneCountryCode] = useState('+880');
  const [payerPhoneNumber, setPayerPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'card' | 'mobile'>('cash');
  const [bankName, setBankName] = useState('');
  const [paymentDetail, setPaymentDetail] = useState('');
  const [paidAmountBdt, setPaidAmountBdt] = useState('');
  const [dueAmount, setDueAmount] = useState(0);

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');

  // After update — holds new invoice ID for print/save
  const [newInvoiceId, setNewInvoiceId] = useState<number | null>(null);
  const [newInvoiceRef, setNewInvoiceRef] = useState<string>('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load current student data
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await api.get(`/students/${studentId}`);
        const s = res.data;
        setStudent(s);
        setName(s.name || '');
        setPhoneCountryCode(s.phone_country_code || '+880');
        setPhoneNumber(s.phone_number || '');
        setEmail(s.email || '');
        const total = parseFloat(s.file_opening_fee_bdt) + parseFloat(s.application_fee_bdt);
        setTotalAmount(total);
        setDueAmount(total);
      } catch {
        setLoadError('Failed to load student data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [studentId]);

  // When payingSelf is toggled, auto-fill or clear payer fields from the EDITED name/phone
  useEffect(() => {
    if (payingSelf) {
      setPayerName(name);
      setPayerPhoneCountryCode(phoneCountryCode);
      setPayerPhoneNumber(phoneNumber);
    } else {
      setPayerName('');
      setPayerPhoneCountryCode('+880');
      setPayerPhoneNumber('');
    }
  }, [payingSelf]);

  // Live due amount recalculation
  useEffect(() => {
    const paid = parseFloat(paidAmountBdt) || 0;
    setDueAmount(Math.max(0, totalAmount - paid));
  }, [paidAmountBdt, totalAmount]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      newErrors.name = 'Name must contain only alphabets and spaces.';
    }

    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9]+$/.test(phoneNumber)) {
      newErrors.phone = 'Phone number must contain only digits.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Must be a valid email format.';
    }

    if (!payerName.trim()) {
      newErrors.payerName = 'Payer Name is required.';
    }

    if (!payerPhoneNumber) {
      newErrors.payerPhone = 'Payer Phone Number is required.';
    } else if (!/^[0-9]+$/.test(payerPhoneNumber)) {
      newErrors.payerPhone = 'Payer Phone Number must contain only numbers.';
    }

    if (paymentMethod === 'bank' && !bankName.trim()) {
      newErrors.bankName = 'Bank Name is required for bank payments.';
    }

    if (paymentMethod !== 'cash' && !paymentDetail.trim()) {
      newErrors.paymentDetail = 'Payment detail reference is required.';
    }

    if (!paidAmountBdt) {
      newErrors.paid = 'Paid Amount BDT is required.';
    } else if (Number(paidAmountBdt) < 0) {
      newErrors.paid = 'Paid Amount BDT must be positive.';
    } else if (Number(paidAmountBdt) > totalAmount) {
      newErrors.paid = `Paid Amount cannot exceed Total BDT: ${totalAmount.toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Update student profile
      await api.patch(`/students/${studentId}`, {
        name,
        phone_country_code: phoneCountryCode,
        phone_number: phoneNumber,
        email,
      });

      // 2. Create a new invoice with updated payment details
      const invoicePayload = {
        student_id: Number(studentId),
        payer_name: payerName,
        payer_phone_country_code: payerPhoneCountryCode,
        payer_phone_number: payerPhoneNumber,
        payment_method: paymentMethod,
        payment_detail: paymentMethod === 'cash' ? null : paymentDetail,
        bank_name: paymentMethod === 'bank' ? bankName : null,
        paid_amount_bdt: parseFloat(paidAmountBdt),
      };

      const invoiceRes = await api.post('/invoices', invoicePayload);
      setNewInvoiceId(invoiceRes.data.id);
      setNewInvoiceRef(invoiceRes.data.invoice_id);
      setSuccessModalOpen(true);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setErrors({
        submit: Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg || 'Update failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!newInvoiceId) return;
    try {
      const pdfRes = await api.get(`/invoices/${newInvoiceId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(pdfUrl), 1000);
    } catch (err) {
      setErrors({ submit: 'Failed to load invoice PDF.' });
    }
  };

  const handleSaveInvoice = async () => {
    if (!newInvoiceId) return;
    try {
      const pdfRes = await api.get(`/invoices/${newInvoiceId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${newInvoiceRef.replace(/\//g, '_')}.pdf`;
      link.click();
    } catch (err) {
      setErrors({ submit: 'Failed to download invoice PDF.' });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <span className="text-sm font-semibold text-gray-500">Loading student information...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-sm w-full p-6 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-sm font-bold text-red-600 mb-4">{loadError}</p>
          <Button variant="action" onClick={() => router.push('/students')}>← Back to Students</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 relative animate-in fade-in duration-300">

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
          <PageHeader title="Update Student" />
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <span className="text-sm font-bold text-red-600">{errors.submit}</span>
          </div>
        )}

        {/* Show print/save buttons after successful update */}
        {newInvoiceId && (
          <div className="p-5 border border-green-200 rounded-xl bg-green-50/50 space-y-3">
            <div>
              <p className="text-sm font-bold text-green-700">✓ Update successful! New invoice created: <span className="font-extrabold">{newInvoiceRef}</span></p>
              <p className="text-xs text-green-600 mt-1">Use the buttons below to print or save the updated invoice receipt.</p>
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="action"
                onClick={handlePrintInvoice}
                className="flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <Printer className="h-4 w-4 text-white" />
                <span>Print Invoice</span>
              </Button>
              <Button
                type="button"
                variant="action"
                onClick={handleSaveInvoice}
                className="flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <FileCheck className="h-4 w-4 text-white" />
                <span>Save Invoice</span>
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* ─── Student Profile Fields ─── */}
          <div className="space-y-1">
            <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider mb-3">Student Profile</h3>
            <div className="space-y-4">
              <InputField
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                placeholder="Student full name"
                required
              />
              <PhoneInput
                label="Phone Number"
                countryCodeVal={phoneCountryCode}
                onChangeCountryCode={setPhoneCountryCode}
                phoneNumberVal={phoneNumber}
                onChangePhoneNumber={setPhoneNumber}
                error={errors.phone}
              />
              <InputField
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="student@example.com"
                required
              />
            </div>
          </div>

          {/* ─── Payment Details ─── */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">Payment Details</h3>

            {/* Self-Pay Toggle */}
            <div className="flex flex-col gap-3 p-4 border border-blue-100 rounded-xl bg-blue-50/30">
              <span className="text-sm font-semibold text-gray-700">Is the student paying himself?</span>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="radio"
                    name="payingSelfUpdate"
                    checked={!payingSelf}
                    onChange={() => setPayingSelf(false)}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>No</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="radio"
                    name="payingSelfUpdate"
                    checked={payingSelf}
                    onChange={() => setPayingSelf(true)}
                    className="accent-blue-600 h-4 w-4"
                  />
                  <span>Yes</span>
                </label>
              </div>
              {payingSelf && (
                <p className="text-xs text-blue-600 font-medium">
                  Payer details auto-filled from updated student profile. These fields cannot be edited.
                </p>
              )}
            </div>

            {/* Payer Name */}
            <InputField
              label="Payer's Name"
              type="text"
              value={payerName}
              onChange={(e) => !payingSelf && setPayerName(e.target.value)}
              error={errors.payerName}
              placeholder="Enter payer full name"
              required
              disabled={payingSelf}
              className={payingSelf ? 'bg-gray-50 opacity-75' : ''}
            />

            {/* Payer Phone */}
            {payingSelf ? (
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-semibold text-gray-700">Payer's Phone Number</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold text-gray-700 opacity-75">
                  {payerPhoneCountryCode} {payerPhoneNumber}
                </div>
              </div>
            ) : (
              <PhoneInput
                label="Payer's Phone Number"
                countryCodeVal={payerPhoneCountryCode}
                onChangeCountryCode={setPayerPhoneCountryCode}
                phoneNumberVal={payerPhoneNumber}
                onChangePhoneNumber={setPayerPhoneNumber}
                error={errors.payerPhone}
              />
            )}

            {/* Total / Paid / Due */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-700">Total (BDT)</span>
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm font-extrabold text-gray-900">
                  BDT {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Paid Amount (BDT) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={paidAmountBdt}
                  onChange={(e) => setPaidAmountBdt(e.target.value)}
                  placeholder="e.g. 5000"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                />
                {errors.paid && <span className="text-xs font-bold text-red-500">{errors.paid}</span>}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-700">Due Amount (BDT)</span>
                <div className="px-3 py-2 border border-gray-200 rounded-lg bg-red-50 text-sm font-extrabold text-red-600">
                  BDT {dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex flex-col gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
              <span className="text-sm font-semibold text-gray-700">Payment Method</span>
              <div className="flex flex-wrap gap-6">
                {['cash', 'bank', 'card', 'mobile'].map((method) => (
                  <label key={method} className="flex items-center gap-2 cursor-pointer text-sm font-medium uppercase">
                    <input
                      type="radio"
                      name="paymentMethodUpdate"
                      checked={paymentMethod === method}
                      onChange={() => {
                        setPaymentMethod(method as any);
                        setPaymentDetail('');
                        setBankName('');
                      }}
                      className="accent-blue-600 h-4 w-4"
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'bank' && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <InputField
                    label="Bank Name:"
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    error={errors.bankName}
                    placeholder="Enter bank name (e.g. BRAC Bank)"
                    required
                  />
                </div>
              )}

              {paymentMethod !== 'cash' && (
                <div className="pt-2 border-t border-gray-200 mt-2">
                  <InputField
                    label={
                      paymentMethod === 'bank'
                        ? 'ACC NO:'
                        : paymentMethod === 'card'
                        ? 'Card NO:'
                        : 'Phone No:'
                    }
                    type="text"
                    value={paymentDetail}
                    onChange={(e) => setPaymentDetail(e.target.value)}
                    error={errors.paymentDetail}
                    placeholder={`Enter payment ${paymentMethod} details`}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-4 border-t border-gray-100">
            <Button
              type="submit"
              variant="action"
              className="px-10 py-3 text-sm tracking-wider"
              disabled={submitting || !!newInvoiceId}
            >
              {submitting ? 'Saving...' : newInvoiceId ? 'Update Complete' : 'Save Changes & Create Invoice'}
            </Button>
          </div>
        </form>

        {/* Success modal after save */}
        <Modal
          isOpen={successModalOpen}
          title="Update Successful"
          message={`Student information updated and new invoice ${newInvoiceRef} created successfully. Use the Print / Save buttons above to download the invoice receipt.`}
          onConfirm={() => setSuccessModalOpen(false)}
        />

      </div>
    </div>
  );
}
