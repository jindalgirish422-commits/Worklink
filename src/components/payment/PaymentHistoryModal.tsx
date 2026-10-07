import React from 'react';
import {
  Clock,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { PaymentTransactionRecord } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: PaymentTransactionRecord[];
  onSelectReceipt: (receiptNumber: string) => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectReceipt,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-[#0071E3]" />
          <span className="font-bold text-[#111111]">Payment History &amp; Billing Ledger</span>
        </div>
      }
      subtitle="Complete chronological transaction history for services performed through WorkLink."
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-[#86868B]">
            {transactions.length} recorded settlement{transactions.length !== 1 ? 's' : ''}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Sandbox Note */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulated Billing Ledger:</strong> Transactions shown reflect sandboxed test settlements. No real charges are made.
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-[#86868B] space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-[#86868B]/40" />
            <p className="font-medium text-[#111111]">No completed payments recorded yet.</p>
            <p className="text-[11px]">Completed and settled job invoices will appear here with printable receipts.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/15 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-[#111111]">{tx.serviceCategory}</span>
                    <Badge variant="success" size="sm">
                      {tx.status.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-mono text-[#86868B]">
                      {tx.method}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#6E6E73]">
                    Pro: <strong className="text-[#111111]">{tx.workerName}</strong> • Ref: {tx.transactionReference}
                  </p>
                  <p className="text-[10px] text-[#86868B] flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{tx.timestamp}</span>
                    <span>•</span>
                    <span>Receipt: {tx.receiptNumber}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                  <span className="text-lg font-extrabold text-[#111111]">
                    ₹{tx.amount}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectReceipt(tx.receiptNumber)}
                    className="text-xs font-semibold"
                  >
                    <span>View Receipt</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
