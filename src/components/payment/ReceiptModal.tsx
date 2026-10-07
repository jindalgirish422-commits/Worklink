import React from 'react';
import {
  CheckCircle2,
  Printer,
  X,
  ShieldCheck,
  Building,
  Receipt,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import { PaymentReceipt } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receipt }) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-[#34C759]" />
          <span className="font-bold text-[#111111]">Service Invoice &amp; Payment Receipt</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-[#86868B] flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
            <span>Verified WorkLink Transaction</span>
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print / Save PDF
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5 text-xs text-[#111111] py-2" id="printable-receipt">
        {/* Mock/Test Notice Guarantee */}
        {receipt.isSimulated && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">MOCK TEST PAYMENT GATEWAY • SIMULATED SETTLEMENT</strong>
              <span>
                This transaction reference was processed in a sandboxed test environment. No actual banking or credit card funds were transferred.
              </span>
            </div>
          </div>
        )}

        {/* Receipt Header Card */}
        <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/5 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#111111]">WorkLink</span>
              <Badge variant="success" size="sm">
                PAID
              </Badge>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">
              Right Labour. Right Work. Right Time.
            </p>
            <p className="text-[10px] text-[#86868B] mt-1 font-mono">
              Receipt No: {receipt.receiptNumber}
            </p>
          </div>

          <div className="text-right font-mono text-[11px] text-[#6E6E73]">
            <p className="font-bold text-[#111111]">{receipt.timestamp}</p>
            <p className="text-[10px] text-[#86868B] mt-0.5">
              Ref: {receipt.transactionReference}
            </p>
            <p className="text-[10px] text-[#0071E3] font-semibold mt-0.5">
              Method: {receipt.paymentMethod}
            </p>
          </div>
        </div>

        {/* Parties Split */}
        <div className="grid grid-cols-2 gap-4 p-3.5 rounded-2xl bg-white border border-black/8 text-[11px]">
          <div>
            <span className="text-[#86868B] font-bold uppercase tracking-wider block mb-1">
              Customer Details
            </span>
            <p className="font-bold text-[#111111] text-xs">{receipt.customerName}</p>
            <p className="text-[#6E6E73] mt-0.5">{receipt.customerAddress}</p>
            <p className="text-[#86868B] mt-0.5">Booking ID: #{receipt.bookingId.slice(0, 8)}</p>
          </div>

          <div>
            <span className="text-[#86868B] font-bold uppercase tracking-wider block mb-1">
              Professional Partner
            </span>
            <p className="font-bold text-[#111111] text-xs">{receipt.workerName}</p>
            <p className="text-[#6E6E73] mt-0.5">{receipt.workerTrade} • Verified Pro</p>
            <p className="text-[#86868B] mt-0.5">Task: {receipt.serviceCategory}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-2xl border border-black/8 overflow-hidden bg-white">
          <div className="p-3 bg-[#FBFBFD] border-b border-black/5 font-bold flex justify-between text-[11px] text-[#86868B] uppercase tracking-wider">
            <span>Description</span>
            <span>Amount</span>
          </div>

          <div className="p-3.5 space-y-2 text-xs divide-y divide-black/5">
            <div className="flex justify-between items-center pt-1">
              <div>
                <span className="font-medium text-[#111111]">Actual Labour Fee</span>
                <span className="text-[11px] text-[#86868B] block">
                  {receipt.actualHours} hrs recorded duration ({receipt.workingDurationFormatted}) @ ₹{receipt.hourlyRate}/hr
                </span>
              </div>
              <span className="font-bold text-[#111111]">₹{receipt.actualLabour}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <span className="font-medium text-[#111111]">Travel Expense</span>
                <span className="text-[11px] text-[#86868B] block">
                  {receipt.travelDistanceKm.toFixed(1)} km distance (
                  {receipt.travelDistanceKm <= 5 ? '0–5 km Free Zone' : '5–10 km Band'}
                  )
                </span>
              </div>
              <span className="font-bold text-[#111111]">
                {receipt.travelCharge === 0 ? <span className="text-[#34C759]">₹0 (FREE)</span> : `₹${receipt.travelCharge}`}
              </span>
            </div>

            {receipt.additionalWorkItems.filter((i) => i.approved).length > 0 && (
              <div className="flex justify-between items-start pt-2">
                <div>
                  <span className="font-medium text-[#111111]">Approved Additional Spares</span>
                  <span className="text-[11px] text-[#86868B] block">
                    {receipt.additionalWorkItems
                      .filter((i) => i.approved)
                      .map((i) => i.name)
                      .join(', ')}
                  </span>
                </div>
                <span className="font-bold text-[#111111]">₹{receipt.additionalWorkTotal}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span className="text-[#6E6E73]">WorkLink Platform Fee (8%)</span>
              <span className="font-bold text-[#111111]">₹{receipt.platformFee}</span>
            </div>

            <div className="flex justify-between items-center pt-2 text-[#1B8738]">
              <span>Promotional Discount</span>
              <span className="font-bold">-₹{receipt.discount}</span>
            </div>
          </div>

          <div className="p-4 bg-[#F5F5F7] border-t border-black/8 flex items-baseline justify-between">
            <div>
              <span className="font-bold uppercase tracking-wider text-[11px] text-[#86868B] block">
                Total Settled Amount
              </span>
              <span className="text-[10px] text-[#86868B]">Paid in full via {receipt.paymentMethod}</span>
            </div>
            <span className="text-2xl font-extrabold text-[#111111]">
              ₹{receipt.finalTotal}
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[#86868B] text-center leading-relaxed">
          Questions regarding this settlement? Contact WorkLink Trust &amp; Safety at support@worklink.local.
        </p>
      </div>
    </Modal>
  );
};
