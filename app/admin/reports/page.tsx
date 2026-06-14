'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

interface Report {
  id: string;
  target_type: 'listing' | 'user';
  target_id: string;
  reporter_id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      toast.error("You don't have admin access");
      window.location.href = '/';
      return;
    }

    setIsAdmin(true);
    fetchReports();
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setReports(data);
    setLoading(false);
  };

  const updateReportStatus = async (reportId: string, newStatus: 'reviewed' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ 
        status: newStatus,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (error) toast.error('Failed to update');
    else {
      toast.success(`Report marked as ${newStatus}`);
      fetchReports();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!isAdmin) return <div className="p-8 text-center">Access Denied</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'reviewed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm ${filter === f ? 'bg-[#2E8B57] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">No reports yet.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border rounded-2xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">
                    {report.target_type.toUpperCase()}
                  </span>
                  <p className="font-medium mt-3">Target: {report.target_id}</p>
                  <p className="text-sm text-gray-500">Reported {new Date(report.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full capitalize ${
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {report.status}
                </span>
              </div>

              <div className="mt-4">
                <p className="font-medium">Reason: {report.reason}</p>
                {report.description && <p className="text-gray-600 mt-2">{report.description}</p>}
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => updateReportStatus(report.id, 'reviewed')} className="bg-[#2E8B57] text-white px-5 py-2 rounded-xl text-sm">
                    Mark Reviewed
                  </button>
                  <button onClick={() => updateReportStatus(report.id, 'dismissed')} className="border px-5 py-2 rounded-xl text-sm">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}