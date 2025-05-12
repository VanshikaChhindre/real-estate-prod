"use client";

import React, { useState } from "react";
import { useCreatePaymentMutation, useGetAuthUserQuery } from "@/state/api";
import { useRouter } from "next/navigation";

const DummyPaymentForm = ({ leaseId, amount }: PaymentProps) => {
 
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [paymentStatus, setPaymentStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };



const [createPayment] = useCreatePaymentMutation();
const router = useRouter()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault(); // 👈 Prevent default form submission
  try {
    await createPayment({ leaseId: leaseId, amountPaid: amount }).unwrap();
    // do other success actions here
    setTimeout(() => {
      setPaymentStatus("Payment successful 🎉");
    }, 1000);

    router.push('/tenants/applications')
  } catch (err) {
    console.error("Payment error:", err);
  }
};

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-center">Payment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Cardholder Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />

        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          maxLength={16}
          value={formData.cardNumber}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />

        <div className="flex space-x-4">
          <input
            type="text"
            name="expiry"
            placeholder="MM/YY"
            maxLength={5}
            value={formData.expiry}
            onChange={handleChange}
            required
            className="w-1/2 border rounded p-2"
          />
          <input
            type="text"
            name="cvv"
            placeholder="CVV"
            maxLength={3}
            value={formData.cvv}
            onChange={handleChange}
            required
            className="w-1/2 border rounded p-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          Pay ₹{amount}
        </button>
      </form>

      {paymentStatus && (
        <p className="text-green-600 text-center font-medium">{paymentStatus}</p>
      )}
    </div>
  );
};

export default DummyPaymentForm;
