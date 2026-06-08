'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReportModalProps {
  targetType: 'listing' | 'user';
  targetId: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Fake or misleading',
  'Scam / Fraud',
  'Inappropriate content',
  'Duplicate',
  'Seller unresponsive',
  'Other',
];

export default function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason');
      return;
    }

    const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

    if (selectedReason === 'Other' && !finalReason) {
      toast.error('Please enter a reason');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('reports').insert({
        target_type: targetType,
        target_id: targetId,
        reporter_id: user?.id || null,
        reason: finalReason,
        status: 'pending',
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Report submitted. Thank you!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        {!submitted ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#1E3A5F]">
                Report {targetType === 'listing' ? 'Listing' : 'Seller'}
              </h2>
              <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">×</button>
            </div>

            <p className="text-gray-600 mb-4">Why are you reporting this?</p>

            <div className="space-y-2 mb-6">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                    selectedReason === reason 
                      ? 'border-[#2E8B57] bg-[#2E8B57]/10 text-[#2E8B57]' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Other' && (
              <div className="mb-6">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please describe the issue..."
                  className="w-full border rounded-xl px-4 py-3 h-24 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !selectedReason}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Report Submitted</h3>
            <p className="text-gray-600 mb-6">Thank you for helping keep DirectWA safe.</p>
            <button
              onClick={onClose}
              className="bg-[#2E8B57] hover:bg-[#246B46] text-white px-8 py-3 rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}