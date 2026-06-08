/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, User, LogOut, Grid, Search, Filter, Sparkles, 
  TrendingUp, Shield, ShoppingCart, Truck, Bell, Mail, ArrowRight, Heart, Menu,
  Sun, Moon
} from 'lucide-react';

import { Product, CartItem, Order, User as UserType, OrderStatus, EmailNotification } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';

import AuthModal from './components/AuthModal';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import OrderTracker from './components/OrderTracker';
import AdminDashboard from './components/AdminDashboard';
import NotificationInbox from './components/NotificationInbox';
import ProductDetailModal from './components/ProductDetailModal';
import CategoryDrawer from './components/CategoryDrawer';

export default function App() {
  // --- States ---
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Navigation & View controllers
  const [activeView, setActiveView] = useState<'shop' | 'tracker' | 'admin'>('shop');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals visibility toggles
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  // Active transaction discount state
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');

  // Dark/Light Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('bazarbd_theme') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('bazarbd_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Initializing Data & localStorage sync ---
  useEffect(() => {
    try {
      // 1. Initial Load Products
      const storedProducts = localStorage.getItem('bazarbd_products');
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts) as Product[];
        const needsBackfill = !parsed.some(p => p.galleryImages && p.galleryImages.length > 0);
        if (needsBackfill) {
          const backfilled = parsed.map(p => {
            const init = INITIAL_PRODUCTS.find(ip => ip.id === p.id);
            if (init) {
              return {
                ...p,
                galleryImages: init.galleryImages,
                videoUrl: init.videoUrl
              };
            }
            return p;
          });
          setProducts(backfilled);
          localStorage.setItem('bazarbd_products', JSON.stringify(backfilled));
        } else {
          setProducts(parsed);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('bazarbd_products', JSON.stringify(INITIAL_PRODUCTS));
      }
    } catch (e) {
      console.error("Error reading products from localStorage, auto-recreating list:", e);
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('bazarbd_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    try {
      // 2. Initial Load User
      const storedUser = localStorage.getItem('bazarbd_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading user from localStorage:", e);
      localStorage.removeItem('bazarbd_user');
    }

    try {
      // 3. Initial Load Cart
      const storedCart = localStorage.getItem('bazarbd_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Error reading cart from localStorage:", e);
      setCart([]);
      localStorage.removeItem('bazarbd_cart');
    }

    try {
      // 4. Initial Load Orders & Seed with realistic historical records
      const storedOrders = localStorage.getItem('bazarbd_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        const seedOrders: Order[] = [
          {
            id: 'ORD-312940',
            userId: 'user-customer',
            customerName: 'Arif Rahman',
            customerEmail: 'customer@test.com',
            phone: '01987654321',
            address: 'House 42, Road 11, Banani, Dhaka',
            items: [
              {
                productId: 'prod-2',
                name: 'AcousticPro Wireless Earbuds',
                price: 3200,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600'
              }
            ],
            totalAmount: 3200,
            paymentMethod: 'bkash',
            paymentStatus: 'completed',
            orderStatus: 'shipped',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() // 36 hours ago
          },
          {
            id: 'ORD-485921',
            userId: 'guest',
            customerName: 'Sultana Begum',
            customerEmail: 'sultana@test.com',
            phone: '01711223344',
            address: '22/A Mirpur-10, Dhaka',
            items: [
              {
                productId: 'prod-6',
                name: 'Anti-Theft Commuter Backpack 25L',
                price: 1850,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'
              },
              {
                productId: 'prod-3',
                name: 'Premium Leather Wallets for Men',
                price: 1450,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600'
              }
            ],
            totalAmount: 3300,
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderStatus: 'delivered',
            createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() // 3 days ago
          }
        ];
        setOrders(seedOrders);
        localStorage.setItem('bazarbd_orders', JSON.stringify(seedOrders));
      }
    } catch (e) {
      console.error("Error reading orders from localStorage:", e);
      setOrders([]);
    }

    try {
      // 5. Load Email Logs
      const storedEmails = localStorage.getItem('bazarbd_emails');
      if (storedEmails) {
        setEmailLogs(JSON.parse(storedEmails));
      } else {
        const seedEmails: EmailNotification[] = [
          {
            id: 'em-1',
            to: 'customer@test.com',
            subject: 'অর্ডারের অগ্রগতি আপডেট - অর্ডার ORD-312940',
            body: `প্রিয় Arif Rahman,

গ্ল্যাড নিউজ! আপনার অর্ডার ORD-312940-এর বর্তমান অবস্থা পরিবর্তিত হয়েছে।

নতুন স্ট্যাটাস: শিপিং এর জন্য পাঠানো হয়েছে (Shipped)

মেমো ডিটেইলস:
-----------------------------
মোট বিল: ৳৩,২০০
シップিং গন্তব্য: House 42, Road 11, Banani, Dhaka

আপনার অর্ডারের লাইভ ট্র্যাকিং সংক্রান্ত সর্বশেষ অবস্থা দেখতে অ্যাপের ট্র্যাকার পেজে ট্র্যাকিং নাম্বার 'ORD-312940' লিখে সার্চ করুণ।

যেকোনো প্রয়োজনে আমাদের সাপোর্ট সেন্টারে যোগাযোগ করুন।

শুভেচ্ছান্তে,
iBazar সাপোর্ট টিম।`,
            sentAt: new Date(Date.now() - 35 * 60 * 60 * 1000).toISOString()
          }
        ];
        setEmailLogs(seedEmails);
        localStorage.setItem('bazarbd_emails', JSON.stringify(seedEmails));
      }
    } catch (e) {
      console.error("Error reading emails from localStorage:", e);
      setEmailLogs([]);
    }
  }, []);

  // --- Core Functional Modifiers ---

  const handleLogin = (user: UserType) => {
    setCurrentUser(user);
    localStorage.setItem('bazarbd_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bazarbd_user');
    setActiveView('shop');
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        );
      } else {
        updated = [...prev, { product, quantity: 1 }];
      }
      localStorage.setItem('bazarbd_cart', JSON.stringify(updated));
      return updated;
    });

    // No automatic popup/drawer open as requested - only update the header cart count badge
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => {
      const updated = prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('bazarbd_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product.id !== productId);
      localStorage.setItem('bazarbd_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleCheckoutOpen = (discountAmt: number, promo: string) => {
    setDiscountAmount(discountAmt);
    setPromoApplied(promo);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const sendEmailNotification = (to: string, subject: string, body: string) => {
    const newEmail: EmailNotification = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 100).toString()}`,
      to,
      subject,
      body,
      sentAt: new Date().toISOString()
    };
    setEmailLogs(prev => {
      const updated = [...prev, newEmail];
      localStorage.setItem('bazarbd_emails', JSON.stringify(updated));
      return updated;
    });
  };

  const handleOrderPlaced = (order: Order) => {
    // 1. Save order
    setOrders(prev => {
      const updated = [...prev, order];
      localStorage.setItem('bazarbd_orders', JSON.stringify(updated));
      return updated;
    });

    // 2. Reduce stock of products
    setProducts(prev => {
      const updated = prev.map(p => {
        const boughtItem = order.items.find(item => item.productId === p.id);
        if (boughtItem) {
          return { ...p, stock: Math.max(0, p.stock - boughtItem.quantity) };
        }
        return p;
      });
      localStorage.setItem('bazarbd_products', JSON.stringify(updated));
      return updated;
    });

    // 3. Trigger Email system notification confirmation
    const emailSubject = `অর্ডার নিশ্চিতকরণ - অর্ডার নাম্বার ${order.id}`;
    const emailBody = `আসসালামু আলাইকুম, ${order.customerName}!

আপনার অর্ডারটি সফলভাবে iBazar-এ রেজিস্টার করা হয়েছে।

অর্ডার মেমো বিবরণ:
-----------------------------
ট্র্যাকিং নাম্বার: ${order.id}
মোট পরিশোধিত মূল্য: ৳${order.totalAmount.toLocaleString('bn')}
পেমেন্ট মেথড: ${order.paymentMethod.toUpperCase()}
シップিং ঠিকানা: ${order.address}

পণ্য তালিকা:
${order.items.map(item => `• ${item.name} (পরিমাণ: ${item.quantity}টি) - ৳${(item.price * item.quantity).toLocaleString('bn')}`).join('\n')}

আমরা খুব দ্রুত আপনার ঠিকানায় পণ্যটি ডেলিভারি করার জন্য কার্যক্রম শুরু করছি। আপনার ট্র্যাকিং নাম্বার দিয়ে যেকোনো সময় আমাদের সাইটে অর্ডারের বর্তমান অবস্থা ট্র্যাক করতে পারবেন।

iBazar বেছে নেওয়ার জন্য আপনাকে ধন্যবাদ!`;

    sendEmailNotification(order.customerEmail, emailSubject, emailBody);
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('bazarbd_cart');
    setDiscountAmount(0);
    setPromoApplied('');
  };

  // --- Admin Functions ---

  const handleAddProduct = (newProd: Product) => {
    setProducts(prev => {
      const updated = [...prev, newProd];
      localStorage.setItem('bazarbd_products', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === updatedProd.id ? updatedProd : p);
      localStorage.setItem('bazarbd_products', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem('bazarbd_products', JSON.stringify(updated));
      return updated;
    });
  };

  const getStatusLabelBengali = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'পেন্ডিং (Pending)';
      case 'processing': return 'প্রস্তুত করা হচ্ছে (Processing)';
      case 'shipped': return 'শিপিং এর জন্য পাঠানো হয়েছে (Shipped)';
      case 'delivered': return 'সফলভাবে ডেলিভারি করা হয়েছে (Delivered)';
      case 'cancelled': return 'বাতিল করা হয়েছে (Cancelled)';
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => { /* order status handler */
    let targetOrder: Order | undefined;

    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          targetOrder = { ...o, orderStatus: status };
          return targetOrder;
        }
        return o;
      });
      localStorage.setItem('bazarbd_orders', JSON.stringify(updated));
      return updated;
    });

    // When status changes, trigger notification email
    if (targetOrder) {
      const emailSubject = `অর্ডারের অগ্রগতি আপডেট - অর্ডার ${targetOrder.id}`;
      const emailBody = "প্রিয় " + targetOrder.customerName + ", আপনার অর্ডার " + targetOrder.id + " আপডেট করা হয়েছে।";

      sendEmailNotification(targetOrder.customerEmail, emailSubject, emailBody);
    }
  };

  const handleClearEmailLogs = () => {
    setEmailLogs([]);
    localStorage.removeItem('bazarbd_emails');
  };

  // --- Filtering items for shop ---
  const categories: string[] = ['All', ...products.map(p => p.category).filter((val, i, arr) => arr.indexOf(val) === i)];
  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans antialiased relative selection:bg-emerald-100 selection:text-emerald-900">
      {/* Dynamic Header layout */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-150/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCategoryDrawerOpen(true)}
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 rounded-xl transition cursor-pointer flex items-center justify-center border border-emerald-200/40 gap-1.5 shadow-sm group"
              title="বিভাগ সমূহ (Browse Categories)"
            >
              <Menu className="w-5 h-5 pointer-events-none group-hover:rotate-6 transition-transform" />
              <span className="hidden md:inline text-xs font-extrabold text-emerald-950 pr-1">সব বিভাগ (Menu)</span>
            </button>
            <div 
              onClick={() => setActiveView('shop')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-emerald-600 to-teal-750 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-transform duration-300">
                <ShoppingBag className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-black tracking-tight text-gray-950 font-sans leading-none flex items-center gap-1.5">
                  iBazar
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded-md border border-emerald-500/10 uppercase">
                    Mart
                  </span>
                </h1>
                <p className="text-[9px] text-gray-400 font-semibold tracking-wider font-mono font-sans">BENGAL E-COMMERCE HUB</p>
              </div>
            </div>
          </div>

          {/* Navigation link hubs */}
          <nav className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => setActiveView('shop')}
              className={`px-4.5 py-2 font-black text-xs rounded-xl transition-all hover:scale-103 active:scale-97 cursor-pointer ${activeView === 'shop' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/15' : 'text-gray-600 hover:text-emerald-900 hover:bg-emerald-50/50'}`}
            >
              মেলা / শপ (Home Shop)
            </button>
            <button
              onClick={() => setActiveView('tracker')}
              className={`px-4.5 py-2 font-black text-xs rounded-xl transition-all hover:scale-103 active:scale-97 cursor-pointer ${activeView === 'tracker' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/15' : 'text-gray-600 hover:text-emerald-900 hover:bg-emerald-50/50'}`}
            >
              অর্ডার ট্র্যাকিং (Track Order)
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-4.5 py-2 font-black text-xs rounded-xl transition-all hover:scale-103 active:scale-97 cursor-pointer ${activeView === 'admin' ? 'bg-gradient-to-r from-teal-700 to-indigo-800 text-white shadow-md shadow-teal-700/15 border border-teal-600/20' : 'text-gray-650 hover:text-teal-900 hover:bg-teal-50/50'}`}
            >
              ড্যাশবোর্ড (Admin Panel)
            </button>
          </nav>



          {/* User profile controls & Cart triggers */}
          <div className="flex items-center gap-2.5">
            {/* Nav mobile tracker button */}
            <button
              onClick={() => setActiveView('tracker')}
              className="sm:hidden p-2 text-gray-500 hover:text-gray-800"
              title="Track Order"
            >
              <Truck className="w-5 h-5" />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border hover:scale-103 active:scale-97"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
                borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                color: isDarkMode ? '#facc15' : '#374151',
              }}
              title={isDarkMode ? "Light Mode (লাইট মোড)" : "Dark Mode (ডার্ক মোড)"}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
                  <span className="hidden sm:inline font-bold text-xs text-yellow-400">লাইট মোড</span>
                </>
              ) : (
                <>
                  <Moon className="w-4.5 h-4.5 text-slate-700" />
                  <span className="hidden sm:inline font-bold text-xs text-slate-700">ডার্ক মোড</span>
                </>
              )}
            </button>

            {/* Shopping Cart button trigger */}
            <button
              id="header-cart-icon-btn"
              onClick={() => setCartOpen(true)}
              className="p-2 sm:px-3.5 sm:py-2 bg-gray-100 border border-gray-200/40 hover:bg-emerald-50 hover:border-emerald-250 hover:text-emerald-800 text-gray-700 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer relative"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="hidden sm:inline font-bold text-xs">কার্ট</span>
              {cart.length > 0 && (
                <span className="bg-emerald-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* User Account Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-150 p-1.5 rounded-2xl">
                <div className="hidden md:block pl-2 text-right">
                  <span className="text-[10px] font-bold text-gray-400 block tracking-wider uppercase">{currentUser.role}</span>
                  <p className="text-xs font-bold text-gray-800 line-clamp-1">{currentUser.name}</p>
                </div>
                <button
                  id="header-logout-btn"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:text-red-650 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <User className="w-4 h-4" /> লগইন (Login)
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Screen Views Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: SHOP CATALOGUE */}
        {activeView === 'shop' && (
          <div className="space-y-8">
            {/* Visual Hero Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-3xl bg-gradient-to-r from-teal-950 via-emerald-900 to-indigo-950 p-8 sm:p-14 overflow-hidden shadow-2xl border border-emerald-500/20"
            >
              {/* Abs decoration grids */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />

              <div className="max-w-2xl relative z-10 space-y-5">
                <span className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 text-xs font-black tracking-normal px-4 py-1.5 rounded-full shadow-lg shadow-amber-500/20 uppercase select-none border border-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900" />
                  গ্র্যান্ড ঈদ এবং ফেস্টিভ অফার ৫% ও ২০% ক্যাশব্যাক!
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                  রিয়েল-টাইম গেটওয়ে সহ <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 drop-shadow-md">
                    সহজ ও সুন্দর শপিং সমাধান
                  </span>
                </h2>
                <p className="text-emerald-50/80 text-sm sm:text-base max-w-xl leading-relaxed font-semibold">
                  iBazar-এ পেয়ে যাচ্ছেন সেরা কোয়ালিটির প্রোডাক্টস, স্বয়ংক্রিয় মোবাইল ওয়ালেট (বিকাশ/নগদ/কার্ড) পেমেন্ট এবং তাৎক্ষণিক লাইভ ট্রান্সপোর্ট অর্ডার ট্র্যাকার ট্রাই আউট করুন।
                </p>

                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => setCategoryFilter('All')}
                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 hover:scale-103 active:scale-97 text-amber-950 text-xs sm:text-sm font-black px-6 py-3 rounded-2xl transition shadow-xl shadow-orange-500/20 cursor-pointer"
                  >
                    শপিং শুরু করুন
                  </button>
                  <button
                    onClick={() => setActiveView('tracker')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl transition border border-white/25 hover:border-white/40 flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
                  >
                    রেজিস্টার্ড অর্ডার ট্র্যাক করুন &rarr;
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Catalogue Control Center */}
            <div id="catalogue-control-bar" className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-150/70">
              {/* Category selector capsules */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
                <Filter className="w-4 h-4 text-gray-400 mr-1.5 shrink-0" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${categoryFilter === cat ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
                  >
                    {cat === 'All' ? 'সব বিভাগ' : cat}
                  </button>
                ))}
              </div>

              {/* Instant Search Bar */}
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="পছন্দের পণ্য ডেসক্রিপশন সহ খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-55/60 border border-gray-200 rounded-xl outline-none text-xs focus:bg-white focus:border-emerald-500 transition-all font-sans text-gray-800"
                />
              </div>
            </div>

            {/* Grid of Products catalog items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-405 text-xs bg-white border border-gray-100 rounded-3xl">
                  ক্ষঃখিত, কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি। ভিন্ন কিওয়ার্ড টাইপ করুন।
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <motion.div
                    key={prod.id}
                    layoutId={prod.id}
                    className="bg-white rounded-3xl border border-gray-150/80 hover:border-emerald-150 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
                  >
                    {/* Item Image inside container */}
                    <div 
                      onClick={() => setSelectedProduct(prod)}
                      className="aspect-[4/3] bg-gray-50 relative overflow-hidden shrink-0 border-b border-gray-50 cursor-pointer group/img"
                      title="বিস্তারিত দেখতে ক্লিক করুন"
                    >
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-all duration-500"
                      />
                      {/* Elegant hover detail badge overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 backdrop-blur-xs text-gray-900 font-extrabold text-[10px] px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transform scale-95 group-hover/img:scale-100 transition-all duration-300">
                          <Search className="w-3 h-3 text-emerald-700" />
                          বিস্তারিত দেখুন (Details)
                        </span>
                      </div>
                      {prod.stock <= 0 ? (
                        <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          স্টক আউট (Out)
                        </span>
                      ) : prod.stock < 5 ? (
                        <span className="absolute top-3 left-3 bg-orange-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                          সীমিত স্টক ({prod.stock})
                        </span>
                      ) : null}
                    </div>

                    {/* Metadata detail block */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-55/15 px-2.5 py-0.5 rounded-full w-max block font-mono">
                          {prod.category}
                        </span>
                        <h4 className="font-bold text-sm text-gray-950 block group-hover:text-emerald-700 leading-snug transition line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                          {prod.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3.5">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase leading-none">মূল্য</span>
                          <span className="text-md font-extrabold text-emerald-800 font-mono tracking-tight">৳{prod.price.toLocaleString('bn')}</span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(prod)}
                          disabled={prod.stock <= 0}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer transform active:scale-95 shrink-0"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> কিনুন (Cart)
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: ORDER TRACKER SECTION */}
        {activeView === 'tracker' && (
          <div className="max-w-4xl mx-auto py-4">
            <OrderTracker orders={orders} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* VIEW 3: ADMIN DASHBOARD */}
        {activeView === 'admin' && (
          <div className="space-y-6">
            <AdminDashboard
              products={products}
              orders={orders}
              emailLogs={emailLogs}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* --- Footer Element --- */}
      <footer className="bg-white border-t border-gray-150/70 mt-16 select-none shrink-0 py-8 text-center text-xs text-gray-400 font-sans">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-gray-500">&copy; {new Date().getFullYear()} iBazar Online Store. All Rights Reserved.</p>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">নিরাপদ ডেমো পেমেন্ট প্ল্যাটফর্ম | ঢাকা, বাংলাদেশ</p>
        </div>
      </footer>

      {/* --- Overlay Modals & Drawers Hookups --- */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLogin={handleLogin}
            isDarkMode={isDarkMode}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <Cart
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveFromCart={handleRemoveFromCart}
            onCheckout={handleCheckoutOpen}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            currentUser={currentUser}
            cartItems={cart}
            discountAmount={discountAmount}
            promoApplied={promoApplied}
            onOrderPlaced={handleOrderPlaced}
            onClearCart={handleClearCart}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(prod) => {
              handleAddToCart(prod);
              // Simply add to cart and increment the count in the cart icon without closing the modal
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {categoryDrawerOpen && (
          <CategoryDrawer
            isOpen={categoryDrawerOpen}
            onClose={() => setCategoryDrawerOpen(false)}
            categories={categories}
            activeCategory={categoryFilter}
            onSelectCategory={(cat) => {
              setCategoryFilter(cat);
              setActiveView('shop');
              // Smooth scroll to product category catalogue
              setTimeout(() => {
                const element = document.getElementById('catalogue-control-bar');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }
              }, 180);
            }}
            products={products}
          />
        )}
      </AnimatePresence>

      {/* Persistent floating email notification logger inbox simulation */}
      <NotificationInbox notifications={emailLogs} onClear={handleClearEmailLogs} />
    </div>
  );
}
