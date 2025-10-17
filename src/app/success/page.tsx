'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) return;

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    // Separate timeout for redirect
    const redirectTimeout = setTimeout(() => {
      router.push(`/orders/${orderId}`);
    }, 3000);

    // Cleanup
    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimeout);
    };
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
      <div className="text-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 max-w-md animate-scale-in">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-3">
          Order Confirmed!
        </h1>
        
        <p className="text-zinc-400 mb-6">
          Thank you for your order. We&apos;re preparing your delicious meal!
        </p>

        <div className="bg-black/30 border border-zinc-800 rounded-xl p-4 mb-6">
          <p className="text-zinc-500 text-sm mb-2">
            Redirecting to order tracking in
          </p>
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-3xl font-bold text-amber-400">{countdown}</span>
          </div>
        </div>

        <p className="text-xs text-zinc-600">
          A confirmation email has been sent to your inbox
        </p>
      </div>

      <style jsx global>{`
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}