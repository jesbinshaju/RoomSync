"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const METHODS = ["upi", "netbanking", "card", "cash", "dd", "scholarship"] as const;

export function FeePayButton({ invoiceId, amount }: { invoiceId: string; amount: number }) {
  const [open, setOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState(amount);
  const [method, setMethod] = useState<(typeof METHODS)[0]>("upi");
  const [txnRef, setTxnRef] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/student/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          amountPaid,
          paymentMethod: method,
          transactionRef: txnRef || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      setOpen(false);
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button className="mt-2" onClick={() => setOpen(true)}>
        Pay Now
      </Button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4">
            <h3 className="font-semibold text-lg">Make Payment</h3>
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <select
                className="w-full h-10 rounded-md border px-3"
                value={method}
                onChange={(e) => setMethod(e.target.value as (typeof METHODS)[0])}
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Transaction Reference (optional)</Label>
              <Input value={txnRef} onChange={(e) => setTxnRef(e.target.value)} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={loading}>
                {loading ? "Processing..." : "Submit Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
