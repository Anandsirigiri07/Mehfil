import React from 'react';
import { Briefcase, CreditCard, CheckCircle, Clock } from 'lucide-react';
import type { VendorPayment, VendorStatus } from '../../types';
import { calculatePaymentSummary } from '../../engine/payments';
import { calculateVendorMetrics } from '../../engine/checklist';

interface VendorChecklistSectionProps {
  vendors: readonly VendorPayment[];
  today: string;
  onUpdateVendor: (vendor: VendorPayment) => void;
}

export const VendorChecklistSection: React.FC<VendorChecklistSectionProps> = ({
  vendors,
  today,
  onUpdateVendor,
}) => {
  const metrics = calculateVendorMetrics(vendors);
  const paymentSummary = calculatePaymentSummary(vendors, today);

  const statusLabels: Record<VendorStatus, string> = {
    not_started: 'Not Started',
    contacted: 'Contacted',
    quoted: 'Quoted',
    booked: 'Booked & Contracted',
    completed: 'Fulfilled',
  };

  return (
    <section aria-labelledby="vendor-checklist-heading" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            id="vendor-checklist-heading"
            className="text-xl font-bold text-stone-900 dark:text-stone-100"
          >
            Vendor Checklist & Cash Flow Tracker
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Track quotations, advances paid, balance deadlines, and contract milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {metrics.completionPercentage}% Booked
          </div>
        </div>
      </div>

      {/* Payment Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <Briefcase className="w-4 h-4 text-mehfil-600" aria-hidden="true" />
            <span>Total Committed Quotes</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(paymentSummary.totalQuotedMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Across {vendors.length} vendor partners
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Advances Disbursed</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(paymentSummary.totalAdvancePaidMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">Secured bookings</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>Balance Due</span>
          </div>
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            ₹{(paymentSummary.totalBalanceDueMinor / 100).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Payable prior to delivery
          </div>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="space-y-3">
        {vendors.map((vendor) => {
          const balance = Math.max(0, vendor.quotedMinor - vendor.advancePaidMinor);

          return (
            <div
              key={vendor.id}
              className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {vendor.name}
                  </h3>
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {vendor.category}
                  </span>
                </div>
                {vendor.notes && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">{vendor.notes}</p>
                )}
                {vendor.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Balance Due Date: {vendor.dueDate}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label
                    htmlFor={`quoted-${vendor.id}`}
                    className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400"
                  >
                    Quoted (₹)
                  </label>
                  <input
                    id={`quoted-${vendor.id}`}
                    type="number"
                    min={0}
                    step={100}
                    value={vendor.quotedMinor / 100}
                    onChange={(e) => {
                      const newQuoted = Math.max(0, Number(e.target.value) * 100);
                      onUpdateVendor({
                        ...vendor,
                        quotedMinor: newQuoted,
                        balanceDueMinor: Math.max(0, newQuoted - vendor.advancePaidMinor),
                      });
                    }}
                    className="w-24 text-xs rounded-lg border border-stone-300 bg-white p-1.5 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`advance-${vendor.id}`}
                    className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400"
                  >
                    Advance (₹)
                  </label>
                  <input
                    id={`advance-${vendor.id}`}
                    type="number"
                    min={0}
                    step={100}
                    value={vendor.advancePaidMinor / 100}
                    onChange={(e) => {
                      const newAdvance = Math.max(0, Number(e.target.value) * 100);
                      onUpdateVendor({
                        ...vendor,
                        advancePaidMinor: newAdvance,
                        balanceDueMinor: Math.max(0, vendor.quotedMinor - newAdvance),
                      });
                    }}
                    className="w-24 text-xs rounded-lg border border-stone-300 bg-white p-1.5 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div className="min-w-24 text-right">
                  <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    Balance (₹)
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    ₹{(balance / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor={`status-${vendor.id}`}
                    className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${vendor.id}`}
                    value={vendor.status}
                    onChange={(e) =>
                      onUpdateVendor({
                        ...vendor,
                        status: e.target.value as VendorStatus,
                      })
                    }
                    className="text-xs rounded-lg border border-stone-300 bg-white p-1.5 dark:border-stone-700 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
