'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2, ChefHat, Clock, Star, Loader2, Search, X, Flame, Heart, MapPin, Phone, Mail, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';

// Types
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

interface CartItem extends MenuItem {
  quantity: number;
  spiceLevel?: 'mild' | 'medium' | 'hot';
  addons?: string[];
}

interface AddOn {
  name: string;
  price: number;
}

// Constants
const AVAILABLE_ADDONS: AddOn[] = [
  { name: 'Extra Meat', price: 3.50 },
  { name: 'Extra Vegetables', price: 2.00 },
  { name: 'Extra Noodles', price: 2.50 },
  { name: 'Fried Egg', price: 1.50 },
  { name: 'Spring Roll', price: 2.99 },
];

const DELIVERY_FEE = 3.99;

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export default function FoodOrderingApp() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [tempSpiceLevel, setTempSpiceLevel] = useState<'mild' | 'medium' | 'hot'>('medium');
  const [tempAddons, setTempAddons] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/menu');
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        setError('Failed to load menu. Please try again later.');
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenuItems();
    
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    console.log('🚀 Starting auto-progress interval');
    
    // Call auto-progression every 30 seconds
    const interval = setInterval(() => {
      fetch('/api/auto-progress-orders')
        .then(res => res.json())
        .then(data => {
          if (data.updatedCount > 0) {
            console.log(`✅ Auto-progressed ${data.updatedCount} order(s)`);
          }
        })
        .catch(err => console.error('Auto-progress error:', err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const categories = ['All', 'Favorites', ...new Set(menuItems.map(item => item.category))];

const filteredItems = menuItems.filter(item => {
  const matchesCategory = selectedCategory === 'All' 
    ? true  // Show all items when "All" is selected
    : selectedCategory === 'Favorites' 
    ? favorites.includes(item._id)
    : item.category === selectedCategory;
  
  const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.description.toLowerCase().includes(searchQuery.toLowerCase());
  return matchesCategory && matchesSearch;
});

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const openItemModal = (item: MenuItem) => {
    setSelectedItem(item);
    setTempSpiceLevel('medium');
    setTempAddons([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const toggleAddon = (addonName: string) => {
    setTempAddons(prev => 
      prev.includes(addonName)
        ? prev.filter(a => a !== addonName)
        : [...prev, addonName]
    );
  };

  const addToCartWithCustomization = () => {
    if (!selectedItem) return;

    const itemWithCustomization: CartItem = {
      ...selectedItem,
      quantity: 1,
      spiceLevel: tempSpiceLevel,
      addons: tempAddons.length > 0 ? tempAddons : undefined,
    };

    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem._id === selectedItem._id &&
      cartItem.spiceLevel === tempSpiceLevel &&
      JSON.stringify(cartItem.addons?.sort()) === JSON.stringify(tempAddons.sort())
    );

    if (existingItemIndex !== -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, itemWithCustomization]);
    }

    closeModal();
  };

  const quickAddToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => 
      cartItem._id === item._id && 
      !cartItem.spiceLevel && 
      !cartItem.addons
    );
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem._id === item._id && !cartItem.spiceLevel && !cartItem.addons
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQuantity = (index: number, change: number) => {
    const newCart = [...cart];
    newCart[index].quantity += change;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getItemTotal = (item: CartItem): number => {
    let total = item.price;
    if (item.addons) {
      item.addons.forEach(addonName => {
        const addon = AVAILABLE_ADDONS.find(a => a.name === addonName);
        if (addon) total += addon.price;
      });
    }
    return total * item.quantity;
  };

  const getCartSubtotal = (): number => {
    return cart.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const getCartTotal = (): number => {
    return getCartSubtotal() + DELIVERY_FEE;
  };

  const getCartCount = (): number => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const placeOrder = async () => {
    try {
      setCheckoutLoading(true);
      const orderData = {
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          spiceLevel: item.spiceLevel,
          addons: item.addons,
        })),
        total: getCartTotal(),
        specialInstructions: specialInstructions || undefined
      };
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
 
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
      setCheckoutLoading(false);
    }
  };

  const getAddonPrice = (addonName: string) => {
    return AVAILABLE_ADDONS.find(a => a.name === addonName)?.price || 0;
  };

  const openImageModal = (src: string, alt: string) => {
    setEnlargedImage({ src, alt });
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setEnlargedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-zinc-400">Loading culinary excellence...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-500 text-black px-6 py-3 rounded-full hover:bg-amber-400 transition-all duration-300 hover:scale-105 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-50 animate-slide-down shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ChefHat className="w-8 h-8 text-amber-400" />
                <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  Phở Paradise
                </h1>
                <p className="text-xs text-zinc-500 tracking-wider">AUTHENTIC VIETNAMESE CUISINE</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAboutModal(true)}
                className="text-zinc-400 hover:text-amber-400 transition-colors duration-300 font-medium hidden md:block"
              >
                About Us
              </button>

              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-zinc-300 hover:text-amber-400 transition-colors duration-300 font-medium px-4 py-2 rounded-full border border-zinc-800 hover:border-amber-500/50"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user.name}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 animate-scale-in">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-sm font-semibold text-zinc-200">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                      >
                        Order History
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-zinc-300 hover:text-amber-400 transition-colors duration-300 font-medium flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 hover:border-amber-500/50"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </button>
              )}

              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-black px-6 py-3 rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-500/20 font-semibold"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline">Cart</span>
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-zinc-900 to-black py-20 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent animate-slide-up">
            Culinary Excellence
          </h2>
          <p className="text-2xl mb-2 text-zinc-400 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Experience Authentic Vietnamese Mastery
          </p>
          <p className="text-zinc-500 mb-8 animate-slide-up tracking-wider" style={{animationDelay: '0.2s'}}>
            Premium ingredients • Traditional recipes • Exceptional service
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer">
              <Clock className="w-5 h-5" />
              <span>Daily 11am - 10pm</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>4.8★ • 500+ Reviews</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer">
              <Sparkles className="w-5 h-5" />
              <span>Est. 2015</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Search Bar */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-4 mb-6 animate-fade-in hover:border-amber-500/30 transition-all duration-300 shadow-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search our menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300 text-zinc-200 placeholder-zinc-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-amber-400 transition-colors duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-zinc-500 mt-3 ml-1">
                  {filteredItems.length} dish{filteredItems.length !== 1 ? 'es' : ''} found
                </p>
              )}
            </div>

            {/* Category Filter */}
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 mb-6 animate-fade-in hover:border-amber-500/30 transition-all duration-300 shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-zinc-200 tracking-wide">CATEGORIES</h2>
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 border border-zinc-700'
                    }`}
                  >
                    {category === 'Favorites' && '❤️ '}
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
    {/* Menu Items Grid */}
    {filteredItems.length === 0 ? (
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-12 text-center animate-fade-in">
        <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <p className="text-xl text-zinc-400">No dishes found</p>
        <p className="text-zinc-600 mt-2">Try a different search or category</p>
      </div>
    ) : selectedCategory === 'All' ? (
      // Show items grouped by category when "All" is selected
      <div className="space-y-8">
        {Array.from(new Set(filteredItems.map(item => item.category))).map((category) => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          return (
            <div key={category} className="animate-fade-in">
              <h3 className="text-2xl font-bold text-zinc-200 mb-4 pb-2 border-b border-zinc-800">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryItems.map((item, index) => (
                  <div 
                    key={item._id} 
                    className="group bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 animate-fade-in"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className="relative h-48 overflow-hidden bg-zinc-800">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2327272a" width="400" height="300"/%3E%3Ctext fill="%2371717a" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex-1">{item.name}</h3>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => toggleFavorite(item._id)}
                            aria-label={favorites.includes(item._id) ? 'Remove from favorites' : 'Add to favorites'}
                            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                              favorites.includes(item._id)
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${favorites.includes(item._id) ? 'fill-current' : ''}`} />
                          </button>
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex-shrink-0">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm font-semibold text-amber-400">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2 mb-5">
                        <Clock className="w-4 h-4 text-zinc-600" />
                        <span className="text-sm text-zinc-600">{item.prepTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                          {formatCurrency(item.price)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openItemModal(item)}
                            className="bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-full hover:bg-zinc-700 hover:text-amber-400 transition-all duration-300 hover:scale-105 font-medium text-sm border border-zinc-700"
                          >
                            Add-ons
                          </button>
                          <button
                            onClick={() => quickAddToCart(item)}
                            className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-5 py-2.5 rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-500/20 font-semibold"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      // Show items in grid for specific categories (including Favorites)
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item, index) => (
          <div 
            key={item._id} 
            className="group bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/10 animate-fade-in"
            style={{animationDelay: `${index * 0.05}s`}}
          >
            <div className="relative h-48 overflow-hidden bg-zinc-800">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2327272a" width="400" height="300"/%3E%3Ctext fill="%2371717a" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex-1">{item.name}</h3>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => toggleFavorite(item._id)}
                    aria-label={favorites.includes(item._id) ? 'Remove from favorites' : 'Add to favorites'}
                    className={`p-2 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                      favorites.includes(item._id)
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-zinc-800/50 text-zinc-500 hover:text-red-400 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(item._id) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">{item.rating}</span>
                  </div>
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{item.description}</p>
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-zinc-600" />
                <span className="text-sm text-zinc-600">{item.prepTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                  {formatCurrency(item.price)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openItemModal(item)}
                    className="bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-full hover:bg-zinc-700 hover:text-amber-400 transition-all duration-300 hover:scale-105 font-medium text-sm border border-zinc-700"
                  >
                    Add-ons
                  </button>
                  <button
                    onClick={() => quickAddToCart(item)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-black px-5 py-2.5 rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg shadow-amber-500/20 font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    </div>

          {/* Cart Section */}
          <div className={`lg:block ${showCart ? 'block' : 'hidden'}`}>
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sticky top-24 animate-slide-left shadow-2xl">
              <h2 className="text-2xl font-bold text-zinc-100 mb-6 tracking-wide">YOUR ORDER</h2>
              
              {orderPlaced && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-4 rounded-xl mb-6 animate-bounce-in">
                  <p className="font-semibold">🎉 Order Confirmed!</p>
                  <p className="text-sm text-green-300/80">Preparing your masterpiece</p>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-20 h-20 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 mb-2">Your cart awaits</p>
                  <p className="text-sm text-zinc-600">Start your culinary journey</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto custom-scrollbar">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-black/30 border border-zinc-800 p-4 rounded-xl hover:border-amber-500/30 transition-all duration-300 animate-slide-down">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative flex items-center justify-center">
                            {item.image.startsWith('/') || item.image.startsWith('http') ? (
                              <Image 
                                src={item.image} 
                                alt={item.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-2xl">{item.image}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-zinc-200">{item.name}</h4>
                            <p className="text-sm text-amber-400 font-semibold">{formatCurrency(item.price)}</p>
                            {item.spiceLevel && (
                              <div className="flex items-center gap-1 mt-1">
                                <Flame className="w-3 h-3 text-red-400" />
                                <span className="text-xs text-zinc-500 capitalize">{item.spiceLevel}</span>
                              </div>
                            )}
                            {item.addons && item.addons.length > 0 && (
                              <div className="text-xs text-zinc-600 mt-1">
                                + {item.addons.join(', ')}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              aria-label="Decrease quantity"
                              className="bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 border border-zinc-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-semibold w-8 text-center text-amber-400">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              aria-label="Increase quantity"
                              className="bg-zinc-800 hover:bg-zinc-700 p-1.5 rounded-lg transition-all duration-300 hover:scale-110 border border-zinc-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(index)}
                              aria-label="Remove from cart"
                              className="ml-2 text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right text-sm font-semibold text-zinc-400 border-t border-zinc-800 pt-2">
                          {formatCurrency(getItemTotal(item))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-zinc-400 mb-2 tracking-wide">
                      SPECIAL INSTRUCTIONS
                    </label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Any special requests?"
                      rows={3}
                      className="w-full px-4 py-3 bg-black/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all duration-300 text-zinc-300 placeholder-zinc-600"
                    />
                  </div>

                  <div className="border-t border-zinc-800 pt-6 space-y-3">
                    <div className="flex justify-between text-lg text-zinc-400">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatCurrency(getCartSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-lg text-zinc-400">
                      <span>Delivery</span>
                      <span className="font-semibold">{formatCurrency(DELIVERY_FEE)}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold border-t border-zinc-800 pt-4">
                      <span className="text-zinc-200">Total</span>
                      <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                        {formatCurrency(getCartTotal())}
                      </span>
                    </div>
                    <button
                      onClick={placeOrder}
                      disabled={checkoutLoading}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 font-bold text-lg shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {checkoutLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Redirecting to checkout...
                        </span>
                      ) : (
                        'Place Order'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="relative h-32 w-32 rounded-xl overflow-hidden bg-zinc-800 flex items-center justify-center cursor-pointer hover:ring-4 hover:ring-amber-500/50 transition-all"
                  onClick={() => {
                    if (selectedItem.image.startsWith('/') || selectedItem.image.startsWith('http')) {
                      openImageModal(selectedItem.image, selectedItem.name);
                    }
                  }}
                >
                  {selectedItem.image.startsWith('/') || selectedItem.image.startsWith('http') ? (
                    <>
                      <Image 
                        src={selectedItem.image} 
                        alt={selectedItem.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 hover:opacity-100 transition-opacity">🔍</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-7xl">{selectedItem.image}</div>
                  )}
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="text-zinc-500 hover:text-amber-400 transition-colors duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <h3 className="text-2xl font-bold text-zinc-100 mb-2">{selectedItem.name}</h3>
              <p className="text-zinc-400 mb-4 leading-relaxed">{selectedItem.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-zinc-300">{selectedItem.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-zinc-500" />
                  <span className="text-sm text-zinc-500">{selectedItem.prepTime}</span>
                </div>
              </div>

              {/* Spice Level Selector */}
              <div className="mb-6">
                <h4 className="font-semibold text-zinc-300 mb-3 flex items-center gap-2 tracking-wide">
                  <Flame className="w-5 h-5 text-red-400" />
                  SPICE LEVEL
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['mild', 'medium', 'hot'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setTempSpiceLevel(level)}
                      className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                        tempSpiceLevel === level
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700'
                      }`}
                    >
                      {level === 'mild' && '🌶️'}
                      {level === 'medium' && '🌶️🌶️'}
                      {level === 'hot' && '🌶️🌶️🌶️'}
                      <div className="text-xs capitalize mt-1">{level}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="mb-6">
                <h4 className="font-semibold text-zinc-300 mb-3 tracking-wide">ADD-ONS (OPTIONAL)</h4>
                <div className="space-y-2">
                  {AVAILABLE_ADDONS.map(addon => (
                    <label
                      key={addon.name}
                      className="flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-800 rounded-xl cursor-pointer hover:bg-zinc-800/50 hover:border-amber-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={tempAddons.includes(addon.name)}
                          onChange={() => toggleAddon(addon.name)}
                          className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                        />
                        <span className="text-zinc-300">{addon.name}</span>
                      </div>
                      <span className="text-amber-400 font-semibold">+{formatCurrency(addon.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price and Add to Cart */}
              <div className="border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    {formatCurrency(selectedItem.price + tempAddons.reduce((sum, name) => sum + getAddonPrice(name), 0))}
                  </span>
                  {tempAddons.length > 0 && (
                    <span className="text-sm text-zinc-500">
                      (Base: {formatCurrency(selectedItem.price)})
                    </span>
                  )}
                </div>
                <button
                  onClick={addToCartWithCustomization}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 font-bold text-lg shadow-lg shadow-amber-500/30"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">About Phở Paradise</h2>
                <button
                  onClick={() => setShowAboutModal(false)}
                  aria-label="Close about modal"
                  className="text-zinc-500 hover:text-amber-400 transition-colors duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="animate-slide-up">
                  <h3 className="text-xl font-semibold text-zinc-200 mb-3 tracking-wide">OUR STORY</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    Founded in 2015 by the Nguyen family, Phở Paradise brings authentic Vietnamese flavors to your neighborhood. Our recipes have been passed down through three generations, ensuring every bowl of pho tastes just like it would in Hanoi or Saigon.
                  </p>
                  <p className="text-zinc-400 leading-relaxed mt-3">
                    We believe in using only the freshest ingredients, traditional cooking methods, and serving every dish with love and care. Our broth simmers for 24 hours to achieve that perfect depth of flavor.
                  </p>
                </div>

                <div className="bg-zinc-800/30 border border-zinc-800 rounded-xl p-6 space-y-4 animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <h3 className="text-xl font-semibold text-zinc-200 mb-4 tracking-wide">VISIT US</h3>
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-300">Location</p>
                      <p className="text-zinc-500">123 Vietnamese Street</p>
                      <p className="text-zinc-500">Oakland, CA 94612</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-300">Hours</p>
                      <p className="text-zinc-500">Monday - Sunday</p>
                      <p className="text-zinc-500">11:00 AM - 10:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-300">Phone</p>
                      <p className="text-zinc-500">(510) 555-PHỞ (7467)</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-zinc-300">Email</p>
                      <p className="text-zinc-500">hello@phoparadise.com</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="text-center p-4 bg-zinc-800/20 border border-zinc-800 rounded-xl hover:bg-zinc-800/40 hover:border-amber-500/30 transition-all duration-300">
                    <div className="text-4xl mb-2">🌿</div>
                    <h4 className="font-semibold text-zinc-300 mb-1">Fresh Ingredients</h4>
                    <p className="text-sm text-zinc-500">Sourced daily from local markets</p>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/20 border border-zinc-800 rounded-xl hover:bg-zinc-800/40 hover:border-amber-500/30 transition-all duration-300">
                    <div className="text-4xl mb-2">👨‍🍳</div>
                    <h4 className="font-semibold text-zinc-300 mb-1">Traditional Recipes</h4>
                    <p className="text-sm text-zinc-500">Authentic family recipes</p>
                  </div>
                  <div className="text-center p-4 bg-zinc-800/20 border border-zinc-800 rounded-xl hover:bg-zinc-800/40 hover:border-amber-500/30 transition-all duration-300">
                    <div className="text-4xl mb-2">❤️</div>
                    <h4 className="font-semibold text-zinc-300 mb-1">Made with Love</h4>
                    <p className="text-sm text-zinc-500">Every dish prepared with care</p>
                  </div>
                </div>

                <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
                  <h3 className="text-xl font-semibold text-zinc-200 mb-4 tracking-wide">CUSTOMER REVIEWS</h3>
                  <div className="space-y-4">
                    <div className="bg-zinc-800/20 border border-zinc-800 p-4 rounded-xl">
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-zinc-400 italic mb-2">&quot;Best pho in Oakland! The broth is incredibly flavorful and the ingredients are always fresh.&quot;</p>
                      <p className="text-sm text-zinc-600">- Sarah L.</p>
                    </div>
                    <div className="bg-zinc-800/20 border border-zinc-800 p-4 rounded-xl">
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-zinc-400 italic mb-2">&quot;Authentic Vietnamese cuisine! Reminds me of my grandmother&apos;s cooking. The bun thit nuong is perfect!&quot;</p>
                      <p className="text-sm text-zinc-600">- Michael N.</p>
                    </div>
                    <div className="bg-zinc-800/20 border border-zinc-800 p-4 rounded-xl">
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-zinc-400 italic mb-2">&quot;Fast delivery and the food arrives hot! Great customer service and delicious food every time.&quot;</p>
                      <p className="text-sm text-zinc-600">- Jennifer K.</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAboutModal(false)}
                className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 text-black py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-105 font-semibold shadow-lg shadow-amber-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Image Enlarge Modal */}
      {showImageModal && enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={closeImageModal}
        >
          <button
            onClick={closeImageModal}
            aria-label="Close image"
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors duration-300 bg-black/50 p-3 rounded-full hover:bg-black/70"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center animate-scale-in">
            <div className="relative w-full h-full">
              <Image
                src={enlargedImage.src}
                alt={enlargedImage.alt}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full">
              <p className="text-white font-semibold text-lg">{enlargedImage.alt}</p>
            </div>
          </div>
        </div>
      )}

  {/* Mobile Cart Toggle */}
  <div className="lg:hidden fixed bottom-4 right-4 z-40">
    <button
      onClick={() => setShowCart(!showCart)}
      aria-label="Toggle shopping cart"
      className="bg-gradient-to-r from-amber-500 to-amber-600 text-black p-4 rounded-full shadow-2xl hover:from-amber-400 hover:to-amber-500 transition-all duration-300 hover:scale-110 relative"
    >
      <ShoppingCart className="w-6 h-6" />
      {getCartCount() > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold animate-pulse">
          {getCartCount()}
        </span>
      )}
    </button>
  </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-left {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        @keyframes bounce-in {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% { 
            transform: scale(1.05);
          }
          70% { 
            transform: scale(0.9);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }

        .animate-slide-left {
          animation: slide-left 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 191, 36, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 191, 36, 0.5);
        }
      `}</style>
    </div>
  );
}