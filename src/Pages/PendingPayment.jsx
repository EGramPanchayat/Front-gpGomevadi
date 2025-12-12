import React from "react";

export default function PendingPayment() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">

        {/* Illustration Image */}
        <img
          src="https://cdn-icons-png.flaticon.com/512/9308/9308881.png"
          alt="Payment Blocked"
          className="h-40 mx-auto mb-6 drop-shadow"
        />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">Payment Pending</h1>

        {/* Message */}
        <p className="mt-4 text-gray-600">
          Your payment is still incomplete.  
          Please complete the payment to continue using our services.
        </p>

        {/* Amount box (static) */}
        <div className="mt-6 bg-gray-50 border rounded-xl p-4 flex justify-between text-gray-700">
          <span className="font-medium">Amount Due</span>
          <span className="font-semibold text-gray-900">₹299</span>
        </div>

        {/* Buttons */}
        <div className="mt-7 flex flex-col gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow">
            Pay Now
          </button>

          <button className="border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50">
            Contact Support
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500">
          If you already paid, refresh the page after a few minutes.
        </p>

      </div>
    </div>
  );
}
