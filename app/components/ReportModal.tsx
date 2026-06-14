'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type ReportModalProps = {
  listingId: string;
  reportedUserId?: string | null;
};

const REPORT_REASONS = [
  'Scam or fraud',
  'Fake item',
  'Misleading description',
  'Spam',
  'Duplicate listing',
  'Prohibited item',
  'Harassment',
  'Other',
];

export default function ReportModal({
  listingId,
  reportedUserId = null,
}: ReportModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('reports').insert({
        listing_id: listingId,
        reported_user_id: reportedUserId,
        reporter_user_id: user?.id ?? null,
        reason,
        details: details.trim() || null,
        status: 'open',
      });

      if (error) {
        setErrorMessage(error.message || 'Could not submit report.');
        return;
      }

      setSuccessMessage('Report submitted. Our team will review it.');
      setDetails('');
      setReason(REPORT_REASONS[0]);

      setTimeout(() => {
        setOpen(false);
        setSuccessMessage('');
      }, 1200);
    } catch {
      setErrorMessage('Something went wrong while submitting the report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Report Listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Report Listing</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Help us keep DirectWA safe by reporting suspicious listings.
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close report modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                >
                  {REPORT_REASONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Additional details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  placeholder="Explain what looks suspicious or unsafe..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}

              {successMessage && (
                <p className="text-sm text-green-600">{successMessage}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
