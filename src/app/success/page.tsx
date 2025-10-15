'use client'

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Loader2 } from 'lucide-react';

// Component that uses useSearchParams must be wrapped in Suspense
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the session_id from URL parameters
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Verify the payment was successful (optional but recommended)
    // You could create an API route to verify the session
    // For now, we'll just show success if session_id exists
    
    // Simulate verification delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);

  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-zinc-400">Confirming your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center animate-scale-in">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            Payment Successful!
          </h1>
          <p className="text-zinc-400">
            Thank you for your order
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-black/30 border border-zinc-800 rounded-xl p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-200">What&apos;s Next?</h2>
          </div>
          <ul className="space-y-3 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">✓</span>
              <span>You&apos;ll receive an email confirmation shortly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">✓</span>
              <span>Your order is being prepared by our chefs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-1">✓</span>
              <span>Estimated delivery: 30-45 minutes</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 font-semibold"
          >
            View Order Status
          </Link>
          <Link
            href="/"
            className="block w-full bg-zinc-800 text-zinc-300 px-6 py-3 rounded-xl hover:bg-zinc-700 transition-all duration-300 font-medium border border-zinc-700"
          >
            Back to Menu
          </Link>
        </div>

        {/* Order Number */}
        <p className="text-xs text-zinc-600 mt-6">
          Order ID: {searchParams.get('session_id')?.slice(-8).toUpperCase()}
        </p>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Main component wrapped in Suspense
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}