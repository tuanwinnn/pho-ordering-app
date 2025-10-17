'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Clock, CheckCircle, Truck, Edit, Trash2, Plus, RefreshCw, TrendingUp, DollarSign, ShoppingBag, Search, Sparkles, ChefHat, X } from 'lucide-react';

interface Order {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    spiceLevel?: string;
    addons?: string[];
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  specialInstructions?: string;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  prepTime: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
}

interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  rating: string;
  prepTime: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu'>('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: '',
    description: '',
    price: '',
    category: 'Appetizers',
    image: '/images/menu/placeholder.jpg',
    rating: '4.5',
    prepTime: '15-20 min'
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchMenuItems();
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting item');
    }
  };

  const addMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      const itemData = {
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        image: newItem.image,
        rating: parseFloat(newItem.rating),
        prepTime: newItem.prepTime
      };

      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      
      if (response.ok) {
        fetchMenuItems();
        setShowAddModal(false);
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: 'Appetizers',
          image: '/images/menu/placeholder.jpg',
          rating: '4.5',
          prepTime: '15-20 min'
        });
        alert('Item added successfully!');
      } else {
        alert('Failed to add item');
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Error adding item');
    } finally {
      setAddLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'preparing': return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'ready': return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'delivered': return 'bg-zinc-800/30 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <Package className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <Truck className="w-4 h-4" />;
    }
  };

  // Calculate stats
  const stats: Stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    todayOrders: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === today;
    }).length,
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get popular items
  const popularItems = menuItems
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Get categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter menu items by category
  const filteredMenuItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ChefHat className="w-8 h-8 text-amber-400" />
                <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-zinc-500 tracking-wider">PHỞ PARADISE MANAGEMENT</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 font-medium border border-zinc-700"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'menu'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
            }`}
          >
            Menu ({menuItems.length})
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-500/10 p-3 rounded-xl">
                    <ShoppingBag className="w-6 h-6 text-blue-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-zinc-500 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-zinc-100">{stats.totalOrders}</p>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-amber-500/10 p-3 rounded-xl">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-zinc-500 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-500/10 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <p className="text-zinc-500 text-sm mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-zinc-100">{stats.pendingOrders}</p>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-500/10 p-3 rounded-xl">
                    <Package className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-zinc-500 text-sm mb-1">Today&apos;s Orders</p>
                <p className="text-3xl font-bold text-zinc-100">{stats.todayOrders}</p>
              </div>
            </div>

            {/* Popular Items */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-zinc-200 mb-6 tracking-wide">TOP RATED ITEMS</h3>
              <div className="space-y-4">
                {popularItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-4 bg-black/30 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-all">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                      {item.image.startsWith('/') || item.image.startsWith('http') ? (
                        <Image 
                          src={item.image} 
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-3xl">{item.image}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-zinc-200">{item.name}</h4>
                      <p className="text-sm text-zinc-500">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                      <span className="text-amber-400 font-bold">★ {item.rating}</span>
                    </div>
                    <div className="text-amber-400 font-bold">${item.price}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-200 tracking-wide">RECENT ORDERS</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order._id} className="flex items-center justify-between p-4 bg-black/30 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-all">
                    <div>
                      <p className="font-semibold text-zinc-200">Order #{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <p className="text-amber-400 font-bold">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200 placeholder-zinc-600"
                    />
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'preparing', 'ready', 'delivered'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 capitalize ${
                        statusFilter === status
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-xl text-zinc-400">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div key={order._id} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-zinc-500">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-zinc-800 py-4 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 text-zinc-400">
                          <span>
                            {item.quantity}x {item.name}
                            {item.spiceLevel && (
                              <span className="text-xs ml-2 text-zinc-600">({item.spiceLevel})</span>
                            )}
                          </span>
                          <span className="font-semibold text-zinc-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="mb-4 p-3 bg-black/30 border border-zinc-800 rounded-lg">
                        <p className="text-sm text-zinc-500">
                          <span className="font-semibold text-zinc-400">Note:</span> {order.specialInstructions}
                        </p>
                      </div>
                    )}

                    {/* Status Update Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {order.status !== 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'pending')}
                          className="px-4 py-2 bg-yellow-900/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-900/30 transition text-sm font-medium"
                        >
                          Mark Pending
                        </button>
                      )}
                      {order.status !== 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'preparing')}
                          className="px-4 py-2 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition text-sm font-medium"
                        >
                          Mark Preparing
                        </button>
                      )}
                      {order.status !== 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'ready')}
                          className="px-4 py-2 bg-green-900/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-900/30 transition text-sm font-medium"
                        >
                          Mark Ready
                        </button>
                      )}
                      {order.status !== 'delivered' && (
                        <button
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                          className="px-4 py-2 bg-zinc-800/50 text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition text-sm font-medium"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 font-semibold shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-5 h-5" />
                Add New Item
              </button>
            </div>

            {/* Menu organized by category */}
            <div className="space-y-8">
              {Object.entries(groupedMenuItems).map(([category, items]) => (
                <div key={category} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent tracking-wide">
                      {category.toUpperCase()}
                    </h3>
                    <span className="text-zinc-500 text-sm">{items.length} items</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                      <div key={item._id} className="bg-black/30 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/30 transition-all group">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                            {item.image.startsWith('/') || item.image.startsWith('http') ? (
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                sizes="64px"
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-3xl group-hover:scale-110 transition-transform">{item.image}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-zinc-100 mb-1">{item.name}</h4>
                            <p className="text-xs text-zinc-500 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-amber-400">${item.price}</span>
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-amber-400">★</span>
                            <span className="text-zinc-400">{item.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteMenuItem(item._id, item.name)}
                            className="flex-1 bg-red-900/20 text-red-400 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-900/30 transition flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Add New Menu Item
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close modal"
                  className="text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={addMenuItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Item Name</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                    placeholder="e.g., Phở Bò"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200 resize-none"
                    placeholder="Describe the dish..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                      placeholder="12.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-400 mb-2">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={newItem.rating}
                      onChange={(e) => setNewItem({...newItem, rating: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                      placeholder="4.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Pho">Pho</option>
                    <option value="Bun">Bun</option>
                    <option value="Rice Plates">Rice Plates</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Yellow Noodle Soup">Yellow Noodle Soup</option>
                    <option value="Boba">Boba</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Image Path</label>
                  <input
                    type="text"
                    value={newItem.image}
                    onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                    placeholder="/images/menu/dish-name.jpg"
                  />
                  <p className="text-xs text-zinc-600 mt-1">Enter the path to your image (e.g., /images/menu/pho-bo.jpg)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">Prep Time</label>
                  <input
                    type="text"
                    value={newItem.prepTime}
                    onChange={(e) => setNewItem({...newItem, prepTime: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-200"
                    placeholder="15-20 min"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl hover:bg-zinc-700 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-black px-4 py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addLoading ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}