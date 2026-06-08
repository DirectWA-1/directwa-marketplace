'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'listing' | 'user';
  targetId: string;
  targetName?: string;
}

const REPORT_REASONS = [
  'Fraud / Scam',
  'Inappropriate content',
  'Spam or misleading information',
  'Counterfeit or fake item',
  'Offensive language or behavior',
  'Other',
];

export default function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Please log in to submit a report');
        setSubmitting(false);
        return;
      }

      const reportData: any = {
        reporter_id: user.id,
        reason: selectedReason,
        comment: comment.trim() || null,
      };

      if (targetType === 'listing') {
        reportData.reported_listing_id = targetId;
      } else {
        reportData.reported_user_id = targetId;
      }

      const { error } = await supabase.from('reports').insert(reportData);

      if (error) {
        throw error;
      }

      toast.success('Report submitted successfully. Thank you for helping keep DirectWA safe.');
      
      // Reset form and close
      setSelectedReason('');
      setComment('');
      onClose();

    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedReason('');
      setComment('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1E3A5F]">
            Report {targetType === 'listing' ? 'Listing' : 'Seller'}
          </h2>
          <button 
            onClick={handleClose} 
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {targetName && (
          <p className="text-sm text-gray-600 mb-4">
            Reporting: <span className="font-medium">{targetName}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for reporting *</label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="accent-[#2E8B57]"
                    disabled={submitting}
                  />
                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Additional details (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              disabled={submitting}
              className="w-full border rounded-2xl px-4 py-3 text-sm disabled:bg-gray-50"
              placeholder="Please provide more information if needed..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedReason}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              {submitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}