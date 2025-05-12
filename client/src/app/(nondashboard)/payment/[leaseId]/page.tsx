"use client"
import DummyPaymentForm from "../Payment";
import { useParams, useSearchParams } from "next/navigation";

export default function DummyPaymentPage() {
  const { leaseId } = useParams();
  const searchParams = useSearchParams();
  const amountParam = searchParams.get("amount");

  // Convert leaseId to number or handle undefined case
   const leaseIdNumber = leaseId && typeof leaseId === "string" ? parseInt(leaseId) : NaN;

  // Ensure amount is a valid number
  const amount = amountParam ? parseFloat(amountParam) : 0;

  return (
    <div className="p-6">
      <DummyPaymentForm leaseId={leaseIdNumber} amount={amount}/>
    </div>
  );
}

