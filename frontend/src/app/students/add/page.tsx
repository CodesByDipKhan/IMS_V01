'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { InputField } from '@/components/InputField';
import { PhoneInput } from '@/components/PhoneInput';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface Country {
  id: number;
  name: string;
  currency_code: string;
  currency_symbol: string;
  application_fee: number;
}

interface Employee {
  id: number;
  name: string;
}

interface Counselor {
  id: number;
  name: string;
}

export default function AddStudentPage() {
  const router = useRouter();

  // Reference lists
  const [countries, setCountries] = useState<Country[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [counselors, setCounselors] = useState<Counselor[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+880');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [counselorName, setCounselorName] = useState('');
  const [sourceType, setSourceType] = useState<'employee' | 'social_media'>('employee');
  const [sourceName, setSourceName] = useState('');
  const [dateOfOpening, setDateOfOpening] = useState('');
  const [fileOpeningFeeBdt, setFileOpeningFeeBdt] = useState('');
  
  // Country & Application Fee states
  const [selectedCountryId, setSelectedCountryId] = useState<number | ''>('');
  const [applicationFeeForeign, setApplicationFeeForeign] = useState('');
  const [calculatedBdt, setCalculatedBdt] = useState<number>(0);
  const [exchangeRateUsed, setExchangeRateUsed] = useState<number>(0);
  const [conversionLoading, setConversionLoading] = useState(false);

  // Validation / Message states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredStudentId, setRegisteredStudentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial reference lists
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, employeesRes, counselorsRes] = await Promise.all([
          api.get('/countries'),
          api.get('/employees'),
          api.get('/counselors'),
        ]);
        setCountries(countriesRes.data);
        setEmployees(employeesRes.data);
        setCounselors(counselorsRes.data);
        
        if (countriesRes.data.length > 0) {
          setSelectedCountryId(countriesRes.data[0].id);
        }
        if (counselorsRes.data.length > 0) {
          setCounselorName(counselorsRes.data[0].name);
        }
      } catch (err) {
        console.error('Failed to load reference lists:', err);
      }
    };
    fetchData();
  }, []);

  // Handle live currency BDT conversion whenever country or fee amount changes
  useEffect(() => {
    if (!selectedCountryId || !applicationFeeForeign || parseFloat(applicationFeeForeign) <= 0) {
      setCalculatedBdt(0);
      setExchangeRateUsed(0);
      return;
    }
    const country = countries.find(c => c.id === Number(selectedCountryId));
    if (!country) return;

    const convertFee = async () => {
      setConversionLoading(true);
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const res = await api.get('/currency/convert', {
          params: {
            from: country.currency_code,
            amount: parseFloat(applicationFeeForeign),
            date: todayStr,
          }
        });
        setCalculatedBdt(res.data.converted_bdt);
        setExchangeRateUsed(res.data.rate);
      } catch (err) {
        console.error('Failed to convert application fee:', err);
      } finally {
        setConversionLoading(false);
      }
    };
    
    // Debounce to avoid calling on every keystroke
    const timer = setTimeout(convertFee, 500);
    return () => clearTimeout(timer);
  }, [selectedCountryId, applicationFeeForeign, countries]);

  // Force default choice when source type switches
  useEffect(() => {
    if (sourceType === 'social_media') {
      setSourceName('Facebook');
    } else if (employees.length > 0) {
      setSourceName(employees[0].name);
    } else {
      setSourceName('');
    }
  }, [sourceType, employees]);

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Student Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      newErrors.name = 'Student Name must contain only alphabets and spaces.';
    }

    if (!phoneNumber) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!/^[0-9]+$/.test(phoneNumber)) {
      newErrors.phone = 'Phone Number must contain only numbers.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Must be a valid email format.';
    }

    if (!counselorName) {
      newErrors.counselor = 'Please select a Counselor.';
    }

    if (!sourceName) {
      newErrors.source = 'Source Name must be selected.';
    }

    if (!dateOfOpening) {
      newErrors.date = 'Date of Opening is required.';
    }

    if (!fileOpeningFeeBdt) {
      newErrors.file_fee = 'File Opening Fee is required.';
    } else if (Number(fileOpeningFeeBdt) < 0) {
      newErrors.file_fee = 'File Opening Fee must be positive.';
    }

    if (!selectedCountryId) {
      newErrors.country = 'Destination country is required.';
    }

    if (!applicationFeeForeign || parseFloat(applicationFeeForeign) <= 0) {
      newErrors.app_fee = 'Application Fee must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const country = countries.find(c => c.id === Number(selectedCountryId));
    if (!country) return;

    setIsSubmitting(true);

    const payload = {
      name,
      phone_country_code: phoneCountryCode,
      phone_number: phoneNumber,
      email,
      counselor_name: counselorName,
      source_type: sourceType,
      source_name: sourceName,
      date_of_opening: dateOfOpening,
      file_opening_fee_bdt: parseFloat(fileOpeningFeeBdt),
      country_id: country.id,
      application_fee_foreign: parseFloat(applicationFeeForeign),
      application_fee_bdt: calculatedBdt,
      exchange_rate_used: exchangeRateUsed,
    };

    try {
      const res = await api.post('/students', payload);
      setSuccessMessage(`Student registered successfully! Student ID: ${res.data.student_id}`);
      setRegisteredStudentId(res.data.id);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      setErrors({
        submit: Array.isArray(serverMsg) ? serverMsg.join(', ') : serverMsg || 'Registration failed. Check server inputs.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setName('');
    setPhoneCountryCode('+880');
    setPhoneNumber('');
    setEmail('');
    if (counselors.length > 0) setCounselorName(counselors[0].name);
    setSourceType('employee');
    if (employees.length > 0) setSourceName(employees[0].name);
    setDateOfOpening('');
    setFileOpeningFeeBdt('');
    setApplicationFeeForeign('');
    setCalculatedBdt(0);
    setExchangeRateUsed(0);
    if (countries.length > 0) setSelectedCountryId(countries[0].id);
    setErrors({});
  };

  const selectedCountry = countries.find(c => c.id === Number(selectedCountryId));

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6 relative">
        
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

        {/* Brand Header */}
        <div className="pt-8">
          <PageHeader title="Registration Form" />
        </div>

        {/* Display submit error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
            <span className="text-sm font-bold text-red-600">{errors.submit}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Student ID placeholder */}
            <InputField
              label="Student ID"
              type="text"
              value=""
              placeholder="Will be generated automatically"
              disabled
              className="bg-gray-50 opacity-75"
            />

            {/* 2. Student Name */}
            <InputField
              label="Student Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Enter student full name"
              required
            />

            {/* 3. Phone Number */}
            <PhoneInput
              label="Phone Number"
              countryCodeVal={phoneCountryCode}
              onChangeCountryCode={setPhoneCountryCode}
              phoneNumberVal={phoneNumber}
              onChangePhoneNumber={setPhoneNumber}
              error={errors.phone}
            />

            {/* 4. Email address */}
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              placeholder="student@example.com"
              required
            />

            {/* 5. Counselor Name — Dropdown from DB */}
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="counselor-select" className="text-sm font-semibold text-gray-700">
                Counselor Name <span className="text-red-500">*</span>
              </label>
              <select
                id="counselor-select"
                value={counselorName}
                onChange={(e) => setCounselorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
              >
                {counselors.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              {errors.counselor && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.counselor}</span>}
            </div>

            {/* 6. Date of Opening */}
            <InputField
              label="Date of Opening"
              type="date"
              value={dateOfOpening}
              onChange={(e) => setDateOfOpening(e.target.value)}
              error={errors.date}
              required
            />

            {/* 7. File Opening Fee (BDT) */}
            <InputField
              label="File Opening Fee (BDT)"
              type="number"
              value={fileOpeningFeeBdt}
              onChange={(e) => setFileOpeningFeeBdt(e.target.value)}
              error={errors.file_fee}
              placeholder="e.g. 5000"
              required
            />

            {/* 8. Destination Country Dropdown */}
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="country-select" className="text-sm font-semibold text-gray-700">
                Destination Country <span className="text-red-500">*</span>
              </label>
              <select
                id="country-select"
                value={selectedCountryId}
                onChange={(e) => {
                  setSelectedCountryId(Number(e.target.value));
                  setApplicationFeeForeign('');
                  setCalculatedBdt(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
              >
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.currency_code})</option>
                ))}
              </select>
              {errors.country && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.country}</span>}
            </div>

            {/* 9. Dynamic Application Fee Input with currency prefix */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-semibold text-gray-700">
                Application Fee ({selectedCountry?.currency_code || 'Foreign'}) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-sm transition-all duration-150">
                <span className="bg-gray-100 border-r border-gray-300 px-3 py-2 text-sm font-bold text-gray-600 select-none whitespace-nowrap">
                  {selectedCountry?.currency_symbol || '¤'}
                </span>
                <input
                  type="number"
                  value={applicationFeeForeign}
                  onChange={(e) => setApplicationFeeForeign(e.target.value)}
                  placeholder="Enter application fee"
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 bg-white outline-none text-sm font-medium"
                />
              </div>
              {errors.app_fee && <span className="text-xs font-bold text-red-500 mt-0.5">{errors.app_fee}</span>}

              {/* Calculated BDT display */}
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-xs font-bold text-gray-500 block">
                  Application Fee in BDT:
                </span>
                {conversionLoading ? (
                  <span className="text-sm font-bold text-blue-600 flex items-center gap-2 mt-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching latest exchange rates...
                  </span>
                ) : (
                  <span className="text-lg font-extrabold text-blue-600 block mt-1">
                    BDT {calculatedBdt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                )}
                {exchangeRateUsed > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium block mt-1">
                    Exchange Rate Used: 1 {selectedCountry?.currency_code} = {exchangeRateUsed} BDT
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* 10. Source choice (Employee / Social Media radio buttons) */}
          <div className="flex flex-col gap-3 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
            <span className="text-sm font-semibold text-gray-700">Student Source</span>
            
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'employee'}
                  onChange={() => setSourceType('employee')}
                  className="accent-blue-600 h-4 w-4"
                />
                <span>Employee</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="radio"
                  name="sourceType"
                  checked={sourceType === 'social_media'}
                  onChange={() => setSourceType('social_media')}
                  className="accent-blue-600 h-4 w-4"
                />
                <span>Social Media</span>
              </label>
            </div>

            <div className="pt-2 border-t border-gray-200 mt-2">
              <span className="text-xs font-bold text-gray-500 block mb-2">
                Select {sourceType === 'employee' ? 'Employee' : 'Platform'}:
              </span>
              
              {sourceType === 'employee' ? (
                <div className="flex flex-wrap gap-3">
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-white shadow-sm hover:border-blue-300">
                      <input
                        type="radio"
                        name="employeeSource"
                        value={emp.name}
                        checked={sourceName === emp.name}
                        onChange={(e) => setSourceName(e.target.value)}
                        className="accent-blue-600 h-3.5 w-3.5"
                      />
                      <span>{emp.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex gap-4">
                  {['Facebook', 'Instagram', 'LinkedIn'].map((plat) => (
                    <label key={plat} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg border bg-white shadow-sm hover:border-blue-300">
                      <input
                        type="radio"
                        name="socialSource"
                        value={plat}
                        checked={sourceName === plat}
                        onChange={(e) => setSourceName(e.target.value)}
                        className="accent-blue-600 h-3.5 w-3.5"
                      />
                      <span>{plat}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.source && <span className="text-xs font-bold text-red-500 mt-1 block">{errors.source}</span>}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex gap-4 items-center justify-center border-t border-gray-100 pt-6">
            <Button
              type="button"
              variant="action"
              onClick={handleClear}
              className="px-8 py-3 text-sm tracking-wider"
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="action"
              className="px-8 py-3 text-sm tracking-wider"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>

        {/* Success Modal */}
        <Modal
          isOpen={isSuccessModalOpen}
          title="Registration Successful"
          message={successMessage}
          onConfirm={() => {
            setIsSuccessModalOpen(false);
            if (registeredStudentId) {
              router.push(`/invoices/create?studentId=${registeredStudentId}`);
            }
          }}
        />

      </div>
    </div>
  );
}
