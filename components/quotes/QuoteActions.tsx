"use client";

import { useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { openAddQuoteItemSheet } from "@/lib/store/slices/uiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Send,
  CheckCircle2,
  XCircle,
  Upload,
  Trash2,
  Loader2,
  BadgeCheck,
  Ban,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";
import {
  submitQuote,
  approveQuote,
  cancelQuote,
  uploadPaymentProof,
  deletePaymentProof,
} from "@/actions/quotes";
import { toast } from "sonner";
import type { Quote } from "@/types";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Cancel confirm dialog ─────────────────────────────────────────────────────

function CancelDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-xs bg-white border-slate-200 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-bold">Cancel quote?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 mt-2">
          This will permanently cancel the quote and cannot be undone.
        </p>
        <div className="flex gap-2.5 mt-5">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-slate-200 text-slate-600"
            onClick={onClose}
            disabled={loading}
          >
            Keep
          </Button>
          <Button
            className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold gap-1.5 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Cancel quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete proof confirm ──────────────────────────────────────────────────────

function DeleteProofDialog({
  onConfirm,
  onClose,
}: {
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-xs bg-white border-slate-200 rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-bold">Remove proof?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 mt-2">This payment proof will be permanently removed.</p>
        <div className="flex gap-2.5 mt-5">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-slate-200 text-slate-600"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold gap-1.5 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function QuoteActions({ quote }: { quote: Quote }) {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.session.role);
  const fileRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [deletingProofId, setDeletingProofId] = useState<string | null>(null);

  const isDraft = quote.status === "DRAFT";
  const isPending = quote.status === "PENDING_APPROVAL";
  const isApproved = quote.status === "APPROVED";
  const isInvoiced = quote.status === "INVOICED";
  const isCancelled = quote.status === "CANCELLED";
  const isCancellable = (isDraft || isPending || isApproved) && role === "ADMIN";

  const canApprove = isPending && role === "ADMIN";
  const approveDisabledReason =
    canApprove && !quote.eventStartDate ? "Set event dates before approving" : null;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitQuote(quote.id);
      toast.success("Quote submitted for approval");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit quote");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      await approveQuote(quote.id);
      toast.success("Quote approved");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve quote");
    } finally {
      setApproving(false);
    }
  }

  async function handleCancel() {
    try {
      await cancelQuote(quote.id);
      toast.success("Quote cancelled");
      setShowCancelDialog(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel quote");
    }
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("images", file);
        await uploadPaymentProof(quote.id, fd);
      }
      toast.success(
        files.length > 1 ? `${files.length} proofs uploaded` : "Payment proof uploaded"
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to upload proof");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeleteProof(proofId: string) {
    try {
      await deletePaymentProof(quote.id, proofId);
      toast.success("Proof removed");
      setDeletingProofId(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove proof");
    }
  }

  return (
    <>
      <div className="space-y-4">
        {/* ── Status banners ── */}
        {isApproved && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <div className="flex items-center gap-2.5 mb-1">
              <BadgeCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold text-emerald-700">Approved</span>
            </div>
            {quote.approvedAt && (
              <p className="text-xs text-emerald-500 pl-7">{fmt(quote.approvedAt)}</p>
            )}
            {quote.eventStartDate && (
              <div className="mt-2 pl-7 flex items-center gap-1.5 text-xs text-emerald-600">
                <span className="font-medium">{fmt(quote.eventStartDate)}</span>
                {quote.eventEndDate && (
                  <>
                    <span className="text-emerald-300">→</span>
                    <span>{fmt(quote.eventEndDate)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {isInvoiced && (
          <div className="rounded-2xl bg-brand/5 border border-brand/20 px-5 py-4 flex items-center gap-2.5">
            <FileCheck2 className="h-5 w-5 text-brand shrink-0" />
            <span className="text-sm font-semibold text-brand">Invoiced</span>
          </div>
        )}

        {isCancelled && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-center gap-2.5">
            <Ban className="h-5 w-5 text-red-500 shrink-0" />
            <span className="text-sm font-semibold text-red-600">Cancelled</span>
          </div>
        )}

        {/* ── Action buttons ── */}
        {(isDraft || isPending || isApproved) && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-2.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Actions
            </p>

            {/* DRAFT: Add item */}
            {isDraft && (
              <Button
                className="w-full gap-2 rounded-full bg-linear-to-r from-brand to-brand-dark text-white font-semibold shadow-sm shadow-brand/20"
                onClick={() => dispatch(openAddQuoteItemSheet(quote.id))}
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            )}

            {/* DRAFT: Submit */}
            {isDraft && (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-full border-brand/30 text-brand hover:bg-brand/5 font-semibold"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Submit for approval
              </Button>
            )}

            {/* PENDING: Approve */}
            {canApprove && (
              <div className="space-y-1.5">
                <Button
                  className="w-full gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold disabled:opacity-60"
                  onClick={handleApprove}
                  disabled={approving || !!approveDisabledReason}
                >
                  {approving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Approve quote
                </Button>
                {approveDisabledReason && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-500 px-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {approveDisabledReason}
                  </p>
                )}
              </div>
            )}

            {/* APPROVED: Upload proof */}
            {isApproved && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleProofUpload}
                />
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-full border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload payment proof"}
                </Button>
              </>
            )}

            {/* Cancel (ADMIN only) */}
            {isCancellable && (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-full border-red-200 text-red-500 hover:bg-red-50 font-medium"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-4 w-4" />
                Cancel quote
              </Button>
            )}
          </div>
        )}

        {/* ── Payment proofs ── */}
        {quote.paymentProofs.length > 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Payment Proofs
            </p>
            <div className="space-y-2.5">
              {quote.paymentProofs.map((proof, i) => (
                <div key={proof.id} className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={proof.imageUrl}
                      alt={`Proof ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <a
                    href={proof.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-sm font-medium text-brand hover:text-brand-dark transition-colors truncate"
                  >
                    Proof #{i + 1}
                  </a>
                  <p className="text-xs text-slate-300 hidden group-hover:block shrink-0">
                    {fmt(proof.createdAt)}
                  </p>
                  {role === "ADMIN" && (
                    <button
                      onClick={() => setDeletingProofId(proof.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove proof"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showCancelDialog && (
        <CancelDialog
          onConfirm={handleCancel}
          onClose={() => setShowCancelDialog(false)}
        />
      )}
      {deletingProofId && (
        <DeleteProofDialog
          onConfirm={() => handleDeleteProof(deletingProofId)}
          onClose={() => setDeletingProofId(null)}
        />
      )}
    </>
  );
}
