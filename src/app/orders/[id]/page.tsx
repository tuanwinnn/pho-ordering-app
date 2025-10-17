'use client'

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck, ChefHat, ArrowLeft, RefreshCw, Flame, MapPin, Phone, Mail } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  spiceLevel?: string;
  addons?: string[];
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Received', icon: Clock, description: 'We received your order' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Chef is cooking your food' },
  { key: 'ready', label: 'Ready', icon: CheckCircle, description: 'Your order is ready!' },
  { key: 'delivered', label: 'Delivered', icon: Truck, description: 'Enjoy your meal!' },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

const fetchOrder = useCallback(async (showRefreshIndicator = false) => {
  if (showRefreshIndicator) setRefreshing(true);
  
  try {
    const response = await fetch(`/api/orders/${orderId}`);
    if (!response.ok) {
      throw new Error('Order not found');
    }
    const data = await response.json();
    setOrder(data);
    setError(null);
  } catch (err) {
    setError('Failed to load order. Please check your order ID.');
    console.error('Error fetching order:', err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [orderId]);

useEffect(() => {
  if (orderId) {
    fetchOrder();
    
    // Auto-refresh the order display every 10 seconds
    const refreshInterval = setInterval(() => {
      fetchOrder();
    }, 10000);

    // Call auto-progress API every 30 seconds to update order status in background
    const autoProgressInterval = setInterval(() => {
      console.log('🔄 Calling auto-progress from order page...');
      fetch('/api/auto-progress-orders')
        .then(res => res.json())
        .then(data => {
          if (data.updatedCount > 0) {
            console.log(`✅ Auto-progressed ${data.updatedCount} order(s)`);
            // Immediately fetch updated order to show new status
            fetchOrder();
          }
        })
        .catch(err => console.error('❌ Auto-progress error:', err));
    }, 30000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(autoProgressInterval);
    };
  }
}, [orderId, fetchOrder]);

  const getStatusIndex = (status: Order['status']) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'preparing': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'ready': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'delivered': return 'text-zinc-400 bg-zinc-800/30 border-zinc-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-zinc-400">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 max-w-md">
          <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-zinc-200 mb-2">Order Not Found</h2>
          <p className="text-zinc-500 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Menu</span>
            </Link>
            <button
              onClick={() => fetchOrder(true)}
              disabled={refreshing}
              className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-6 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-zinc-500">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full border font-semibold ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-zinc-200 mb-8">Order Status</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-zinc-800">
              <div 
                className="bg-gradient-to-b from-amber-500 to-amber-600 transition-all duration-1000 ease-out"
                style={{ 
                  height: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Status Steps */}
            <div className="space-y-8 relative">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={step.key} className="flex items-start gap-6">
                    {/* Icon */}
                    <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-400 shadow-lg shadow-amber-500/50'
                        : 'bg-zinc-900 border-zinc-700'
                    }`}>
                      <Icon className={`w-7 h-7 ${isCompleted ? 'text-black' : 'text-zinc-600'}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-3">
                      <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-zinc-100' : 'text-zinc-600'}`}>
                        {step.label}
                      </h3>
                      <p className={`text-sm ${isCompleted ? 'text-zinc-400' : 'text-zinc-700'}`}>
                        {step.description}
                      </p>
                      {isCurrent && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-amber-400">In Progress</span>
                        </div>
                      )}
                      {isCompleted && !isCurrent && (
                        <p className="text-xs text-zinc-600 mt-2">
                          ✓ Completed
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-zinc-200 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start justify-between py-3 border-b border-zinc-800 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">
                      {item.quantity}x {item.name}
                    </span>
                    {item.spiceLevel && (
                      <span className="flex items-center gap-1 text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3" />
                        {item.spiceLevel}
                      </span>
                    )}
                  </div>
                  {item.addons && item.addons.length > 0 && (
                    <p className="text-sm text-zinc-500 mt-1">
                      + {item.addons.join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-semibold text-zinc-300">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {order.specialInstructions && (
            <div className="mt-4 p-4 bg-black/30 border border-zinc-800 rounded-xl">
              <p className="text-sm text-zinc-500">
                <span className="font-semibold text-zinc-400">Special Instructions:</span> {order.specialInstructions}
              </p>
            </div>
          )}

          {/* Total */}
          <div className="mt-6 pt-6 border-t border-zinc-800">
            <div className="flex justify-between text-2xl font-bold">
              <span className="text-zinc-200">Total</span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 animate-fade-in">
          <h2 className="text-xl font-bold text-zinc-200 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-black/30 border border-zinc-800 rounded-xl">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500">Location</p>
                <p className="text-sm font-semibold text-zinc-300">123 Vietnamese St</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/30 border border-zinc-800 rounded-xl">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500">Phone</p>
                <p className="text-sm font-semibold text-zinc-300">(510) 555-7467</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-black/30 border border-zinc-800 rounded-xl">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-zinc-500">Email</p>
                <p className="text-sm font-semibold text-zinc-300">help@phoparadise.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}