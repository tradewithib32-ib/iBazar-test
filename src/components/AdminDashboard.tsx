/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, ShoppingCart, Package, Users, Plus, Edit, Trash2, CheckCircle, 
  Hourglass, Truck, MailCheck, AlertTriangle, Search, FileText, Check, X, ShieldAlert,
  Upload, Video, Image
} from 'lucide-react';
import { Product, Order, OrderStatus, EmailNotification } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  emailLogs: EmailNotification[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  isDarkMode?: boolean;
}

export default function AdminDashboard({
  products,
  orders,
  emailLogs,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  isDarkMode = false
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'emails'>('stats');
  
  // Search states
  const [productQuery, setProductQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');

  // Modals / Form editing state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Product Add/Edit
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [prodVideoUrl, setProdVideoUrl] = useState('');

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ফাইল সাইজ ৫ মেগাবাইটের কম হতে হবে (File size must be under 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ফাইল সাইজ ৫ মেগাবাইটের কম হতে হবে (File size must be under 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Stats Calculations
  const totalEarnings = orders
    .filter(o => o.paymentStatus === 'completed' || o.orderStatus === 'delivered')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

  const handleOpenProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProdName(product.name);
      setProdDesc(product.description);
      setProdPrice(product.price);
      setProdCategory(product.category);
      setProdImage(product.image);
      setProdStock(product.stock);
      setProdGallery(product.galleryImages || []);
      setProdVideoUrl(product.videoUrl || '');
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdDesc('');
      setProdPrice(100);
      setProdCategory('Electronics');
      setProdImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600');
      setProdStock(10);
      setProdGallery([]);
      setProdVideoUrl('');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice || prodPrice <= 0) return;

    const targetImage = prodImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        category: prodCategory,
        image: targetImage,
        stock: Number(prodStock),
        galleryImages: prodGallery,
        videoUrl: prodVideoUrl
      });
    } else {
      onAddProduct({
        id: `prod-${Date.now()}`,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        category: prodCategory,
        image: targetImage,
        stock: Number(prodStock),
        galleryImages: prodGallery,
        videoUrl: prodVideoUrl
      });
    }
    setIsProductModalOpen(false);
  };

  // Filters
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(productQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderQuery.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderQuery.toLowerCase()) ||
    o.phone.toLowerCase().includes(orderQuery.toLowerCase())
  );

  return (
    <div className={`rounded-3xl border shadow-xs overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-800 text-gray-100' 
        : 'bg-white border-gray-150/80 text-gray-800'
    }`}>
      {/* Dashboard Top banner */}
      <div className="p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between">
        <div>
          <span className="bg-white/10 text-white/90 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-max mb-1.5 border border-white/10">
            <ShieldAlert className="w-3.5 h-3.5" />
            Admin Control Center (অ্যাডমিন প্যানেল)
          </span>
          <h3 className="text-xl font-bold tracking-tight">স্টোর ম্যানেজমেন্ট এবং মেকানিক্স</h3>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/10 p-1 rounded-xl border border-white/5 shrink-0 grow-0">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'stats' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            সারসংক্ষেপ
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'products' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            প্রোডাক্টস ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            অর্ডার্স ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'emails' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
          >
            ইমেইলস ({emailLogs.length})
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="p-6 md:p-8 space-y-8">
          {/* Main metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-emerald-50/45 p-5 rounded-2xl border border-emerald-100/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">মোট আয় (Total Revenue)</span>
                <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight mt-1 block">৳{totalEarnings.toLocaleString('bn')}</span>
              </div>
              <div className="w-11 h-11 bg-emerald-600/10 text-emerald-700 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-sky-50/45 p-5 rounded-2xl border border-sky-100/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">মোট অর্ডারস (Placed Orders)</span>
                <span className="text-2xl font-black text-sky-800 font-mono tracking-tight mt-1 block">{totalOrdersCount} টি</span>
              </div>
              <div className="w-11 h-11 bg-sky-600/10 text-sky-700 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-5 rounded-2xl border flex items-center justify-between ${outOfStockCount > 0 ? 'bg-orange-50/50 border-orange-100/75' : 'bg-green-55/10 border-emerald-150/30'}`}>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">স্টক ফুরিয়েছে (Out of Stock)</span>
                <span className={`text-2xl font-black font-mono tracking-tight mt-1 block ${outOfStockCount > 0 ? 'text-orange-700' : 'text-emerald-700'}`}>{outOfStockCount} টি</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${outOfStockCount > 0 ? 'bg-orange-600/10 text-orange-700' : 'bg-emerald-600/15 text-emerald-700'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-amber-50/45 p-5 rounded-2xl border border-amber-100/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">ডেলিভারি বাকি (Pending Orders)</span>
                <span className="text-2xl font-black font-mono tracking-tight mt-1 block text-amber-700">{pendingOrdersCount} টি</span>
              </div>
              <div className="w-11 h-11 bg-amber-600/10 text-amber-700 rounded-xl flex items-center justify-center">
                <Hourglass className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick guide for testing */}
          <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100 text-xs text-emerald-800 leading-relaxed">
            <h4 className="font-bold flex items-center gap-1.5 mb-2.5 text-emerald-950">
              💡 এডমিন ড্যাশবোর্ড ইন্টারেক্টিভ গাইড (Admin Interactive Walkthrough)
            </h4>
            <ol className="list-decimal list-inside space-y-1.5">
              <li>অর্ডারে পণ্য কেনা হলে তা স্বয়ংক্রিয়ভাবে <strong>প্রোডাক্টস</strong> ও <strong>অর্ডার্স</strong> ট্যাবে এসে জমা হয়।</li>
              <li>পণ্য স্টক আউট হলে সতর্ক সংকেত দেখায়। আপনি নতুন প্রোডাক্ট এখানে <strong>Plus</strong> বাটন চেপে যোগ বা ডিলিট করতে পারবেন।</li>
              <li><strong>অর্ডার্স</strong> ট্যাব থেকে যেকোনো অর্ডারের বর্তমান অবস্থা (যেমন: পেন্ডিং থেকে প্রক্রিয়াকরণ বা শিপিং) পাল্টাতে পারবেন।</li>
              <li>যতবার অর্ডারের অবস্থা পাল্টাবেন, সিস্টেম ততবারই গ্রাহকটির ইমেইলে নোটিফিকেশন পাঠাবে। আপনি তা <strong>ইমেইলস</strong> ট্যাবে গিয়ে সরাসরি লাইভ দেখতে পাবেন!</li>
            </ol>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                placeholder="প্রোডাক্ট নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none text-xs focus:border-emerald-500"
              />
            </div>
            <button
              onClick={() => handleOpenProductModal()}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transform active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন প্রোডাক্ট যোগ করুন
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55/70 text-gray-500 border-b border-gray-100 font-bold uppercase tracking-wider">
                  <th className="p-4">প্রোডাক্ট তথ্য (Product)</th>
                  <th className="p-4">ক্যাটাগরি</th>
                  <th className="p-4 text-emerald-700">মূল্য (Price)</th>
                  <th className="p-4">মজুদ (Stock)</th>
                  <th className="p-4 text-center">অ্যাকশনস (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">কোনো প্রোডাক্ট পাওয়া যায়নি।</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/30 transition-all">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-gray-50 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-sans line-clamp-1 mt-0.5 max-w-xs">{p.description}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-semibold">{p.category}</td>
                      <td className="p-4 font-bold text-emerald-800">৳{p.price.toLocaleString('bn')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.stock <= 0 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-gray-100 text-gray-700'}`}>
                          {p.stock <= 0 ? 'স্টেকআউট' : `${p.stock} টি`}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleOpenProductModal(p)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-900 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="অর্ডার নাম্বার, ক্রেতার নাম বা মোবাইল দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none text-xs focus:border-emerald-500"
            />
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="p-12 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs">
                কোনো গ্রাহকের অর্ডার এন্ট্রি পাওয়া যায়নি।
              </div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o.id}
                  className="p-5 border border-gray-150 rounded-2xl bg-gray-50/30 hover:border-emerald-100 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1 select-text">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-emerald-800 font-extrabold font-mono text-sm">{o.id}</span>
                      <span className="text-[10px] text-gray-450 font-mono">
                        {new Date(o.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs uppercase bg-white/80 border border-gray-200/60 px-2 py-0.5 rounded-md font-bold text-gray-700 font-mono">
                        {o.paymentMethod} ({o.paymentStatus === 'completed' ? 'Paid' : 'COD'})
                      </span>
                    </div>

                    <div className="text-xs text-gray-650 space-y-1">
                      <p>
                        ক্রেতার নাম : <strong className="text-gray-900 font-semibold">{o.customerName}</strong> | ফোন: <strong className="text-gray-950 font-mono">{o.phone}</strong>
                      </p>
                      <p className="line-clamp-1 text-gray-550">ইমেল ঠিকানা: {o.customerEmail} | ঠিকানা: {o.address}</p>
                      
                      {/* Products snippet */}
                      <p className="text-emerald-700 bg-white/75 px-2.5 py-1.5 rounded-lg border border-gray-150/40 inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 shrink-0" />
                        পণ্যসমূহ: {' '}
                        <span className="font-semibold text-gray-700">
                          {o.items.map(item => `${item.name} (${item.quantity}টি)`).join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status controller */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 lg:text-right w-full lg:w-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">টোটাল বিল</span>
                      <strong className="text-base text-emerald-800 font-extrabold font-mono">৳{o.totalAmount.toLocaleString('bn')}</strong>
                    </div>

                    <div className="space-y-1.5 w-full sm:w-auto text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">ডেলিভারি স্ট্যাটাস</span>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'pending')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${o.orderStatus === 'pending' ? 'bg-amber-100/50 border-amber-300 text-amber-800' : 'bg-white border-gray-205 text-gray-500 hover:bg-gray-50'}`}
                        >
                          পেন্ডিং
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'processing')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${o.orderStatus === 'processing' ? 'bg-indigo-100/50 border-indigo-300 text-indigo-805' : 'bg-white border-gray-205 text-gray-500 hover:bg-gray-50'}`}
                        >
                          প্রসেস
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'shipped')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${o.orderStatus === 'shipped' ? 'bg-blue-100/50 border-blue-300 text-blue-800' : 'bg-white border-gray-205 text-gray-500 hover:bg-gray-50'}`}
                        >
                          শিপড্
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'delivered')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border ${o.orderStatus === 'delivered' ? 'bg-emerald-100/50 border-emerald-305 text-emerald-800' : 'bg-white border-gray-205 text-gray-500 hover:bg-gray-50'}`}
                        >
                          ডেলিভার্ড
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Emails Log Tab */}
      {activeTab === 'emails' && (
        <div className="p-6 md:p-8 space-y-6">
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-xs text-sky-800 flex items-start gap-2.5">
            <MailCheck className="w-5 h-5 shrink-0 text-sky-700" />
            <div>
              <strong className="block font-bold">ইমেইল নোটিফিকেশন লগার সিস্টেম (Instant Email System Tracer)</strong>
              কাস্টমার যখন অর্ডার প্লেস করে বা আপনি যখন এখানে স্ট্যাটাস পরিবর্তন করেন, সিস্টেম তখন লাইভ ইমেল প্রেরণ করে। নিচে সেই পাঠানো ইমেলের রিয়েল-টাইম বডি ও হেডার ট্র্যাকিং তথ্য দেওয়া হলো।
            </div>
          </div>

          <div className="space-y-4">
            {emailLogs.length === 0 ? (
              <div className="p-12 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 text-xs">
                কোনো ইমেল পাঠানোর রেকর্ড পাওয়া যায়নি। আগে পণ্য অর্ডার করুন বা স্ট্যাটাস আপডেট সাবমিট করুন।
              </div>
            ) : (
              emailLogs.slice().reverse().map((e) => (
                <div
                  key={e.id}
                  className="bg-gray-900 text-gray-200 p-5 rounded-2xl border border-gray-800 font-mono text-[11px] space-y-3 shadow-lg select-text"
                >
                  <div className="border-b border-gray-800 pb-2.5 space-y-1">
                    <p className="text-teal-400 flex justify-between">
                      <span>To: &lt;{e.to}&gt;</span>
                      <span className="text-gray-500 text-[10px]">
                        {new Date(e.sentAt).toLocaleTimeString()}
                      </span>
                    </p>
                    <p className="text-amber-300 font-bold">Subject: {e.subject}</p>
                    <p className="text-gray-500 text-[9px]">X-Mailer: iBazar SMTP AutoMailer Client</p>
                  </div>
                  
                  <div className="whitespace-pre-line text-gray-300 leading-relaxed pt-1 select-text">
                    {e.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal Renders here natively inside container layout */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div id="product-form-overlay" className="fixed inset-0 z-55 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-gray-800 flex flex-col max-h-[85vh]"
            >
              <div className="p-5 bg-teal-800 text-white flex justify-between items-center shrink-0">
                <h4 className="font-bold flex items-center gap-1.5 text-sm">
                  <Package className="w-4.5 h-4.5" />
                  {editingProduct ? 'প্রোডাক্ট তথ্য পরিবর্তন (Edit Product)' : 'নতুন প্রোডাক্ট যুক্ত করুন (Add Product)'}
                </h4>
                <button 
                  onClick={() => setIsProductModalOpen(false)}
                  className="hover:bg-white/10 p-1 rounded-full text-white/80 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block">প্রোডাক্ট নাম (Product Title)</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="উদা: Apex Formal Boot"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block">ক্যাটাগরি (Category)</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-sm"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Clothing & Fashion">Clothing & Fashion</option>
                    <option value="Home Appliances">Home Appliances</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">মূল্য (Price in BDT ৳)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      placeholder="1200"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">স্টক সংখ্যা (Stock Count)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-gray-600 block">প্রোডাক্টের ছবি (Product Image)</label>
                  
                  {/* Local Uploader & Preview Block */}
                  <div className="grid grid-cols-3 gap-3">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('local-file-input')?.click()}
                      className={`col-span-2 border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                        isDragging 
                          ? 'border-teal-600 bg-teal-55/10' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100/70'
                      }`}
                    >
                      <input
                        type="file"
                        id="local-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Upload className="w-5 h-5 text-teal-750 mb-1" />
                      <p className="text-[10px] font-bold text-gray-700">ডিভাইস থেকে ছবি যুক্ত করুন</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">ক্লিক করুন অথবা ছবি এখানে ড্র্যাগ করুন</p>
                    </div>

                    <div className="col-span-1 border border-gray-150 rounded-xl bg-gray-50 flex flex-col items-center justify-center p-1 relative overflow-hidden group">
                      {prodImage ? (
                        <>
                          <img
                            src={prodImage}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setProdImage('')}
                            className="absolute inset-0 bg-black/60 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                          >
                            মুছে ফেলুন (Remove)
                          </button>
                        </>
                      ) : (
                        <div className="text-[9px] text-gray-400 font-semibold text-center leading-tight">
                          কোনো ছবি<br />সিলেক্ট নাই
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      value={prodImage && prodImage.startsWith('data:') ? '' : prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="অথবা এখানে ইন্টারনেট ছবির লিঙ্ক (Image URL) দিন..."
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* Extra Example Photos Block */}
                <div className="space-y-2 border-t border-gray-150 pt-3">
                  <label className="font-bold text-gray-700 block flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-teal-700" />
                    অতিরিক্ত উদাহরণ ছবিসমূহ (Extra Example Photos)
                  </label>
                  
                  {/* Grid of current gallery images with quick delete */}
                  <div className="grid grid-cols-4 gap-2">
                    {prodGallery.map((url, idx) => (
                      <div key={idx} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group bg-gray-50 flex items-center justify-center">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProdGallery(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-red-600/90 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        >
                          মুছুন (Delete)
                        </button>
                      </div>
                    ))}

                    {/* Add gallery image slot */}
                    {prodGallery.length < 4 && (
                      <label className="border-2 border-dashed border-gray-200 hover:border-teal-600 bg-gray-50 hover:bg-teal-55/5 rounded-xl flex flex-col items-center justify-center h-full aspect-square cursor-pointer transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 3 * 1024 * 1024) {
                                alert("ফাইল সাইজ ৩ মেগাবাইটের কম হতে হবে (File under 3MB)");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setProdGallery(prev => [...prev, reader.result as string]);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Plus className="w-4 h-4 text-gray-400" />
                        <span className="text-[8px] text-gray-500 font-bold mt-1">যোগ করুন</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Gallery image URL addition */}
                  <div className="flex gap-1.5 items-center">
                    <input
                      type="url"
                      id="extra-image-url-input"
                      placeholder="অথবা অতিরিক্ত ছবির URL দিয়ে এন্টার (Enter) চাপুন..."
                      className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-[10px] font-sans"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = e.currentTarget.value.trim();
                          if (url) {
                            setProdGallery(prev => [...prev, url]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('extra-image-url-input') as HTMLInputElement;
                        const url = input?.value.trim();
                        if (url) {
                          setProdGallery(prev => [...prev, url]);
                          input.value = '';
                        }
                      }}
                      className="px-2.5 py-1.5 bg-teal-800 hover:bg-teal-950 text-white rounded-lg text-[9px] font-bold cursor-pointer shrink-0"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>

                {/* Google Drive Video Link Block */}
                <div className="space-y-1 border-t border-gray-150 pt-3">
                  <label className="font-bold text-gray-700 block flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-teal-700" />
                    গুগল ড্রাইভ ভিডিও লিংক (Google Drive Video Link)
                  </label>
                  <input
                    type="url"
                    value={prodVideoUrl}
                    onChange={(e) => setProdVideoUrl(e.target.value)}
                    placeholder="যেমনঃ https://drive.google.com/file/d/SHARED_ID/view"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-xs font-sans"
                  />
                  <p className="text-[9px] text-gray-400 leading-tight">
                    গুগল ড্রাইভের শেয়ার লিংকটি (Share link set to Anyone with Link) এখানে দিন। এটি কাস্টমারের কাছে সরাসরি প্লেয়ার স্ক্রিনে প্রদর্শিত হবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-600 block">বিবরণ (Product Description)</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="পণ্যটির আকর্ষণীয় বিবরণ লিখুন..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 text-sm resize-none"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold"
                  >
                    বাদ দিন
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-950 text-white font-bold rounded-xl cursor-pointer"
                  >
                    সংরক্ষণ করুন (Save Changes)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
