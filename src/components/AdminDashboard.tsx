/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, ShoppingCart, Package, Users, Plus, Edit, Trash2, CheckCircle, 
  Hourglass, Truck, MailCheck, AlertTriangle, Search, FileText, Check, X, ShieldAlert,
  Upload, Video, Image, User, Download, Phone, MapPin, Mail, RefreshCw, TrendingUp
} from 'lucide-react';
import { Product, Order, OrderStatus, EmailNotification, User as UserType, WithdrawalRequest } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  withdrawalRequests: WithdrawalRequest[];
  emailLogs: EmailNotification[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onWithdrawRequest: (request: WithdrawalRequest) => void;
  onUpdateWithdrawalStatus: (requestId: string, status: 'approved' | 'rejected') => void;
  onDeleteWithdrawalRequest: (requestId: string) => void;
  isDarkMode?: boolean;
  currentUser?: UserType | null;
}

export default function AdminDashboard({
  products,
  orders,
  withdrawalRequests,
  emailLogs,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onWithdrawRequest,
  onUpdateWithdrawalStatus,
  onDeleteWithdrawalRequest,
  isDarkMode = false,
  currentUser = null
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'emails' | 'withdrawals'>('stats');
  
  // Search states
  const [productQuery, setProductQuery] = useState('');
  const [orderQuery, setOrderQuery] = useState('');
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<string | null>(null);

  const handleDownloadReceiptPDF = async (placedOrder: Order) => {
    setDownloadingOrderId(placedOrder.id);
    try {
      // Create a high-DPI canvas (width 800px, height 1000px)
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not initialize 2D context");

      // 1. Solid Elegant white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Deep green border
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 6;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Light gold inner border
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

      // Header Banner background (Emerald color block)
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(25, 25, canvas.width - 50, 100);

      // Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
      ctx.fillText('iBazar Shopping BD', 50, 80);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText('অর্ডার মেমো ও অনলাইন মূল্য পরিশোধের রশিদ (ONLINE PAYMENT RECEIPT & INVOICE)', 50, 105);

      // Receipt Metadata lines
      ctx.fillStyle = '#4b5563';
      ctx.font = 'normal 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`চালান আইডি (Invoice ID): ${placedOrder.id}`, 50, 160);
      ctx.fillText(`ইস্যু তারিখ (Date): ${new Date(placedOrder.createdAt).toLocaleString('bn-BD')}`, 50, 180);
      ctx.fillText(`পেমেন্ট গেটওয়ে (Gateway): ${placedOrder.paymentMethod.toUpperCase()}`, 50, 200);

      // Status Badge (PAID / SUCCESS)
      ctx.fillStyle = '#ebfbee'; // Very light green
      ctx.fillRect(520, 150, 230, 50);
      ctx.strokeStyle = '#2f9e41'; // Bright green stroke
      ctx.lineWidth = 1.5;
      ctx.strokeRect(520, 150, 230, 50);

      ctx.fillStyle = '#2f9e41';
      ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif';
      ctx.fillText('পেমেন্ট অবস্থা (STATUS):', 540, 172);
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('পরিশোধিত (PAID - SUCCESS)', 540, 192);

      // Header lines division
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(25, 220);
      ctx.lineTo(775, 220);
      ctx.stroke();

      // Client Address and Delivery Info section
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(25, 235, canvas.width - 50, 95);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(25, 235, canvas.width - 50, 95);

      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('ডেলিভারি গন্তব্য ও গ্রাহকের তথ্য (SHIPPING & CUSTOMER DETAILS)', 40, 260);

      ctx.fillStyle = '#374151';
      ctx.font = 'normal 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`গ্রাহকের নাম (Customer Name): ${placedOrder.customerName}`, 40, 285);
      ctx.fillText(`মোবাইল নাম্বার (Phone Number): ${placedOrder.phone}`, 40, 310);
      ctx.fillText(`প্রদানকৃত ইমেইল (User Email): ${placedOrder.customerEmail}`, 400, 285);
      ctx.fillText(`ঠিকানা (Address): ${placedOrder.address}`, 400, 310);

      // Section label
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
      ctx.fillText('ক্রয়কৃত পণ্যের তালিকা (ORDER ITEMS SPECIFICATION)', 25, 360);

      // Table Headers background
      ctx.fillStyle = '#059669';
      ctx.fillRect(25, 375, canvas.width - 50, 32);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(' নং (No.)', 40, 395);
      ctx.fillText('পণ্য বিবরণী ও শিরোনাম (Purchased Product Name)', 100, 395);
      ctx.fillText('একক মূল্য (Unit Price)', 480, 395);
      ctx.fillText('পরিমাণ (Qty)', 600, 395);
      ctx.fillText('মোট মূল্য (Subtotal)', 680, 395);

      let currentY = 430;
      placedOrder.items.forEach((item, index) => {
        // Alternating background colors for rows
        if (index % 2 === 1) {
          ctx.fillStyle = '#fafdff';
          ctx.fillRect(25, currentY - 20, canvas.width - 50, 30);
        }

        ctx.fillStyle = '#374151';
        ctx.font = 'normal 12px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`${index + 1}`, 40, currentY);
        ctx.fillText(item.name || 'Product Premium Item', 100, currentY);
        ctx.fillText(`৳${item.price.toLocaleString('bn')}`, 480, currentY);
        ctx.fillText(`${item.quantity}টি`, 600, currentY);
        ctx.fillText(`৳${(item.price * item.quantity).toLocaleString('bn')}`, 680, currentY);

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(25, currentY + 10);
        ctx.lineTo(775, currentY + 10);
        ctx.stroke();

        currentY += 35;
      });

      // Price Calculations panel
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(490, currentY + 15, 285, 90);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(490, currentY + 15, 285, 90);

      ctx.fillStyle = '#4b5563';
      ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText('সর্বমোট মূল্য (Subtotal):', 505, currentY + 40);
      ctx.fillText('বাংলাদেশ ডেলিভারি ভ্যাট (VAT):', 505, currentY + 65);
      
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.fillText('পরিশোধিত মোট (Net Paid Amount):', 505, currentY + 90);

      ctx.fillStyle = '#111827';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(`৳${placedOrder.totalAmount.toLocaleString('bn')}`, 690, currentY + 40);
      ctx.fillText('৳০ (মুক্ত)', 690, currentY + 65);
      
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText(`৳${placedOrder.totalAmount.toLocaleString('bn')}`, 690, currentY + 90);

      // Official Stamp / Signature Seal
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(160, currentY + 60, 48, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText('iBazar Shopping', 112, currentY + 48);
      ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText('PAID - নিশ্চিত', 113, currentY + 64);
      ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
      ctx.fillText('সফল ক্যাশ রিসিভড', 113, currentY + 78);

      // Support Footer Note
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(25, 920);
      ctx.lineTo(775, 920);
      ctx.stroke();

      ctx.fillStyle = '#9ca3af';
      ctx.font = 'italic 11px "Segoe UI", Arial, sans-serif';
      ctx.fillText('ধন্যবাদ আপনার আস্থার জন্য! কোনো প্রয়োজনে ইমেইল করুন: customer@ibazar.com অথবা কল করুন হেল্পলাইনে।', 40, 940);
      ctx.font = 'normal 9px "Segoe UI", Arial, sans-serif';
      ctx.fillText('This is an automatically generated electronic payment report by iBazar systems. No physical signature or stamp required.', 40, 960);

      // Load jsPDF dynamically and add the canvas image
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`iBazar_Payment_Receipt_${placedOrder.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("দুঃখিত, পিডিএফ রিপোর্ট তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setDownloadingOrderId(null);
    }
  };

  // Modals / Form editing state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProfileInquiryModalOpen, setIsProfileInquiryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);


  // States for Withdrawal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawHistoryModalOpen, setIsWithdrawHistoryModalOpen] = useState(false);
  const [showWithdrawSuccessPopup, setShowWithdrawSuccessPopup] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState('');

  // Form states for Product Add/Edit
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodManagerPrice, setProdManagerPrice] = useState<number | ''>('');
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [prodGallery, setProdGallery] = useState<string[]>([]);
  const [prodVideoUrl, setProdVideoUrl] = useState('');

  const processImageFile = (file: File, setter: (val: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("ফাইল সাইজ ৫ মেগাবাইটের কম হতে হবে (File size must be under 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setter(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          if (typeof event.target?.result === 'string') {
            setter(event.target.result);
          }
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file, setProdImage);
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
      processImageFile(file, setProdImage);
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
      setProdManagerPrice(product.managerPrice !== undefined ? product.managerPrice : '');
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
      setProdManagerPrice('');
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
    const finalManagerPrice = prodManagerPrice !== '' ? Number(prodManagerPrice) : undefined;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: prodName,
        description: prodDesc,
        price: Number(prodPrice),
        managerPrice: finalManagerPrice,
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
        managerPrice: finalManagerPrice,
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

  if (currentUser?.role === 'customer') {
    // Filter customer orders
    const customerOrders = orders.filter(o => 
      o.customerEmail?.toLowerCase() === currentUser?.email?.toLowerCase() || 
      o.phone === currentUser?.phone ||
      (currentUser?.name && o.customerName === currentUser?.name)
    );
    const customerTotalSpent = customerOrders
      .filter(o => o.paymentStatus === 'completed' || o.orderStatus === 'delivered')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
    const customerActiveDeliveries = customerOrders.filter(
      o => o.orderStatus === 'pending' || o.orderStatus === 'processing' || o.orderStatus === 'shipped'
    ).length;

    return (
      <div id="customer-dashboard-container" className={`rounded-3xl border shadow-xs overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800 text-gray-100' 
          : 'bg-white border-gray-150/80 text-gray-800'
      }`}>
        {/* Customer Top banner */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between">
          <div>
            <span className="bg-white/10 text-white/90 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-max mb-1.5 border border-white/10">
              <User className="w-3.5 h-3.5 text-teal-200" />
              CUSTOMER DASHBOARD (কাস্টমার ড্যাশবোর্ড)
            </span>
            <h3 className="text-xl font-bold tracking-tight">স্বাগতম, {currentUser.name}!</h3>
            <p className="text-xs text-teal-100/90 mt-0.5">আপনার প্রোফাইল তথ্য এবং অর্ডার হিস্ট্রি ট্র্যাক করুন</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Customer metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/45 p-5 rounded-2xl border border-emerald-100/65 flex items-center justify-between dark:bg-emerald-950/20 dark:border-emerald-900/40">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">মোট টাকা পরিশোধিত (Total Spent)</span>
                <span className="text-2xl font-black text-emerald-850 dark:text-emerald-400 font-mono tracking-tight mt-1 block">৳{customerTotalSpent.toLocaleString('bn')}</span>
              </div>
              <div className="w-11 h-11 bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-sky-50/45 p-5 rounded-2xl border border-sky-100/60 flex items-center justify-between dark:bg-sky-950/20 dark:border-sky-900/40">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">মোট অর্ডারস (Total Orders)</span>
                <span className="text-2xl font-black text-sky-850 dark:text-sky-400 font-mono tracking-tight mt-1 block">{customerOrders.length} টি</span>
              </div>
              <div className="w-11 h-11 bg-sky-600/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-amber-50/45 p-5 rounded-2xl border border-amber-100/60 flex items-center justify-between dark:bg-amber-950/20 dark:border-amber-900/40">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">চলতি ডেলিভারি (Active Shipments)</span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono tracking-tight mt-1 block">{customerActiveDeliveries} টি</span>
              </div>
              <div className="w-11 h-11 bg-amber-600/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Customer Profile Details */}
            <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-850 border-gray-800' : 'bg-gray-50/50 border-gray-150/75'}`}>
              <h4 className="font-bold text-sm text-gray-850 dark:text-gray-200 mb-4 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <User className="w-4 h-4 text-emerald-600" /> গ্রাহক প্রোফাইল বিবরণী (Profile Details)
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">নাম (Full Name)</span>
                    <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{currentUser.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">ইমেইল ঠিকানা (User Email)</span>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">মোবাইল নাম্বার (Phone Number)</span>
                    <p className="font-mono font-semibold text-gray-850 dark:text-gray-250 mt-0.5">{currentUser.phone || 'সরবরাহ করা হয়নি'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block">ডেলিভারি ঠিকানা (Shipping Address)</span>
                    <p className="text-gray-800 dark:text-gray-250 font-medium mt-0.5">{currentUser.address || 'সরবরাহ করা হয়নি'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (span-2): My Orders list */}
            <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDarkMode ? 'bg-gray-850 border-gray-800' : 'bg-gray-50/50 border-gray-150/75'}`}>
              <h4 className="font-bold text-sm text-gray-855 dark:text-gray-200 mb-4 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <FileText className="w-4 h-4 text-emerald-600" /> আমার অর্ডার এবং রসিদ হিস্ট্রি (My Placed Orders)
              </h4>

              {customerOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <Package className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-bounce" />
                  <p className="font-bold text-gray-500">আপনি এখন পর্যন্ত কোনো অর্ডার করেননি।</p>
                  <p className="text-[10px] mt-1 text-gray-400">মেলা / শপ থেকে আপনার পছন্দের সামগ্রী কেনাকাটা করুন।</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
                  {customerOrders.map(order => {
                    const statusColors = {
                      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-450 border border-amber-200/40',
                      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-450 border border-blue-200/40',
                      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-455 border border-indigo-200/40',
                      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 border border-emerald-200/40',
                      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-450 border border-red-200/40',
                    };

                    const isDownloading = downloadingOrderId === order.id;

                    return (
                      <div 
                        key={order.id} 
                        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xs ${isDarkMode ? 'bg-gray-900/60 border-gray-800/80 hover:bg-gray-900' : 'bg-white border-gray-150/50 hover:bg-white'}`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              ID: {order.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.orderStatus as OrderStatus] || 'bg-gray-100'}`}>
                              {order.orderStatus === 'pending' && 'পেন্ডিং (Pending)'}
                              {order.orderStatus === 'processing' && 'প্রক্রিয়াধীন (Processing)'}
                              {order.orderStatus === 'shipped' && 'শিপড (Shipping)'}
                              {order.orderStatus === 'delivered' && 'ডেলিভার্ড (Delivered)'}
                              {order.orderStatus === 'cancelled' && 'বাতিল (Cancelled)'}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(order.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>

                          <div className="text-xs font-semibold text-gray-650 dark:text-gray-350">
                            পণ্য: {order.items.map(item => `${item.name} (${item.quantity}টি)`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-gray-100 md:border-t-0 pt-2.5 md:pt-0 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-bold block">মোট পরিমাণ</span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">৳{order.totalAmount.toLocaleString('bn')}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadReceiptPDF(order)}
                            disabled={isDownloading}
                            className="bg-emerald-50 hover:bg-emerald-100 disabled:bg-gray-100 text-emerald-700 disabled:text-gray-400 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                            title="রশিদ ডাউনলোড করুন (Download PDF)"
                          >
                            {isDownloading ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === 'manager') {
    // Filter manager orders/sales matching current manager details
    const managerOrders = orders.filter(o => 
      o.customerEmail?.toLowerCase() === currentUser?.email?.toLowerCase() || 
      o.phone === currentUser?.phone ||
      (currentUser?.name && o.customerName === currentUser?.name)
    );

    // Calculate total retail value of their sales (what those units sell for as customers buy them)
    const totalRetailVal = managerOrders.reduce((acc, o) => {
      return acc + o.items.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const originalPrice = prod ? prod.price : item.price;
        return sum + (originalPrice * item.quantity);
      }, 0);
    }, 0);

    // Calculate total purchase cost paid by the manager
    const totalCost = managerOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    // Calculate overall estimated profit achieved by the manager for these sales
    const totalManagerProfit = managerOrders.reduce((acc, o) => {
      if (o.orderStatus === 'pending' || o.orderStatus === 'cancelled') return acc;
      return acc + o.items.reduce((sum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const managerPrice = prod?.managerPrice || item.price;
        const profitPerUnit = Math.max(0, item.price - managerPrice);
        return sum + (profitPerUnit * item.quantity);
      }, 0);
    }, 0);

    const managerActiveDeliveries = managerOrders.filter(
      o => o.orderStatus === 'pending' || o.orderStatus === 'processing' || o.orderStatus === 'shipped'
    ).length;

    const myWithdrawals = withdrawalRequests.filter(w => w.managerId === currentUser?.id);
    const totalWithdrawnOrPending = myWithdrawals.reduce((sum, w) => sum + (w.status !== 'rejected' ? w.amount : 0), 0);
    const availableBalance = Math.max(0, totalManagerProfit - totalWithdrawnOrPending);

    const handleWithdrawSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = Number(withdrawAmount);
      if (amount < 100 || amount > 100000) {
        alert("উত্তোলনের পরিমাণ ১০০ থেকে ১,০০,০০০ টাকার মধ্যে হতে হবে। (Amount must be between 100 - 100,000)");
        return;
      }
      if (amount > availableBalance) {
        alert("আপনার পর্যাপ্ত ব্যালেন্স নেই। (Insufficient balance)");
        return;
      }
      if (!withdrawAccount || withdrawAccount.length < 11) {
        alert("সঠিক অ্যাকাউন্ট নাম্বার দিন। (Enter a valid account number)");
        return;
      }

      onWithdrawRequest({
        id: `wd-${Date.now()}`,
        managerId: currentUser.id,
        managerName: currentUser.name,
        amount,
        method: withdrawMethod,
        accountNumber: withdrawAccount,
        status: 'pending',
        requestedAt: new Date().toISOString()
      });

      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAccount('');
      setShowWithdrawSuccessPopup(true);
    };

    return (
      <div id="manager-dashboard-container" className={`rounded-3xl border shadow-xs overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900 border-gray-800 text-gray-100' 
          : 'bg-white border-gray-150/80 text-gray-800'
      }`}>
        {/* Manager Top banner */}
        <div className="p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-indigo-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="bg-white/10 text-white/90 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-max mb-1.5 border border-white/10">
              <ShieldAlert className="w-3.5 h-3.5 text-teal-250 animate-pulse" />
              MANAGER SALES PORTAL (ম্যানেজার ড্যাশবোর্ড)
            </span>
            <h3 className="text-xl font-bold tracking-tight">স্বাগতম, {currentUser.name}!</h3>
            <p className="text-xs text-teal-100/90 mt-0.5">আপনার করা বিক্রয়, কমিশন এবং লভ্যাংশ রিয়েল-টাইমে ট্র্যাক করুন</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:gap-3">
            <div className="bg-emerald-950/40 border border-emerald-400/30 px-5 py-2.5 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-teal-100 font-bold uppercase tracking-widest">ব্যালেন্স (Balance)</span>
              <span className="text-lg font-black font-mono mt-0.5 text-white">৳{availableBalance.toLocaleString('bn')}</span>
            </div>
            <button
              onClick={() => setIsWithdrawHistoryModalOpen(true)}
              className="bg-teal-700/50 hover:bg-teal-600/50 text-white border border-teal-400/30 px-5 py-4 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <FileText className="w-5 h-5" /> History (ইতিহাস)
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-teal-500 hover:bg-teal-400 text-white border border-teal-400 px-5 py-[18px] rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <DollarSign className="w-5 h-5" /> Withdraw (উত্তোলন)
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Manager metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 flex items-center justify-between dark:bg-sky-950/30 dark:border-sky-900/50">
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">মোট বিক্রয়মূল্য (Sales)</span>
                <span className="text-2xl font-black text-sky-900 dark:text-sky-300 font-mono tracking-tight mt-1 block">৳{totalRetailVal.toLocaleString('bn')}</span>
              </div>
              <div className="w-11 h-11 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-400 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between dark:bg-emerald-950/30 dark:border-emerald-900/50">
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">আপনার ক্রয়মূল্য (Cost)</span>
                <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300 font-mono tracking-tight mt-1 block">৳{totalCost.toLocaleString('bn')}</span>
              </div>
              <div className="w-11 h-11 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-center justify-between dark:bg-amber-950/30 dark:border-amber-900/50">
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">অর্জিত লভ্যাংশ (Net Profit)</span>
                <span className="text-2xl font-black text-amber-900 dark:text-amber-300 font-mono tracking-tight mt-1 block">৳{totalManagerProfit.toLocaleString('bn')}</span>
              </div>
              <div className="w-11 h-11 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-400 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 flex items-center justify-between dark:bg-teal-950/30 dark:border-teal-900/50">
              <div>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block">চলতি ডেলিভারি (Active)</span>
                <span className="text-2xl font-black text-teal-900 dark:text-teal-300 font-mono tracking-tight mt-1 block">{managerActiveDeliveries} টি</span>
              </div>
              <div className="w-11 h-11 bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-400 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Manager Profile & Guide */}
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-gray-855 border-gray-800' : 'bg-gray-50/50 border-gray-150/75'}`}>
                <h4 className="font-bold text-sm text-gray-850 dark:text-gray-200 mb-4 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                  <User className="w-4 h-4 text-teal-650" /> ম্যানেজার প্রোফাইল (Profile Info)
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">নাম (Manager Name)</span>
                      <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{currentUser.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">ইমেইল (User Email)</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold block">মোবাইল (Contact Phone)</span>
                      <p className="font-mono font-semibold text-gray-850 dark:text-gray-250 mt-0.5">{currentUser.phone || 'সরবরাহ করা হয়নি'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager Quick Guidelines */}
              <div className={`p-5 rounded-2xl border text-xs leading-relaxed ${isDarkMode ? 'bg-gray-855 border-gray-850 text-teal-200/90' : 'bg-teal-50/35 border-teal-100/60 text-teal-850'}`}>
                <h4 className="font-bold flex items-center gap-1.5 mb-2.5 text-teal-950 dark:text-teal-300">
                  <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" /> শপ ম্যানেজার গাইড বুক
                </h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>আপনি শপ/মেলা ট্যাব থেকে আপনার বিশেষ ডিসকাউন্টে (ম্যানেজার প্রাইস) কাস্টমারদের জন্য পণ্য ক্রয় করতে পারবেন।</li>
                  <li>ম্যানেজার প্রাইস ও রিটেইল বেস প্রাইসের মধ্যকার তফাতটি সম্পূর্ণ আপনার অর্জিত নিট লভ্যাংশ (Net Profit) হিসেবে গণ্য হবে।</li>
                  <li>আপনার মাধ্যমে করা প্রতি অর্ডারের বর্তমান স্ট্যাটাস ও লাভের রিয়েল-টাইম হিসাব নিচে ট্র্যাকিং তালিকায় দেখানো হচ্ছে।</li>
                  <li>রসিদ ট্র্যাকিং এবং ডাউনলোডের জন্য <strong className="font-bold">Download</strong> বাটন ব্যবহার করতে পারেন।</li>
                </ol>
              </div>
            </div>

            {/* Right Column: Manager Sales History list */}
            <div className={`p-6 rounded-2xl border lg:col-span-2 ${isDarkMode ? 'bg-gray-855 border-gray-800' : 'bg-gray-50/50 border-gray-150/75'}`}>
              <h4 className="font-bold text-sm text-gray-855 dark:text-gray-200 mb-4 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2.5">
                <FileText className="w-4 h-4 text-teal-650" /> আমার বিক্রয় এবং কমিশন রেকর্ড (My Placed Sales)
              </h4>

              {managerOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  <Package className="w-10 h-10 mx-auto text-gray-300 mb-2 animate-bounce" />
                  <p className="font-bold text-gray-500">আপনার মাধ্যমে কোনো সেলস এবং অর্ডার এখনও করা হয়নি।</p>
                  <p className="text-[10px] mt-1 text-gray-400">শপ প্যানেলে গিয়ে ম্যানেজার প্রাইসে স্টক কিনুন বা রিসেল করুন।</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {managerOrders.map(order => {
                    const statusColors = {
                      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-955/35 dark:text-amber-400 border border-amber-200/40',
                      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-955/35 dark:text-blue-400 border border-blue-200/40',
                      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-955/35 dark:text-indigo-400 border border-indigo-200/40',
                      delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-955/35 dark:text-emerald-450 border border-emerald-200/40',
                      cancelled: 'bg-red-100 text-red-800 dark:bg-red-955/35 dark:text-red-450 border border-red-200/40',
                    };

                    const isDownloading = downloadingOrderId === order.id;

                    // Calculate individual order profit
                    const orderProfit = order.items.reduce((sum, item) => {
                      const prod = products.find(p => p.id === item.productId);
                      const originalPrice = prod ? prod.price : item.price;
                      return sum + (Math.max(0, originalPrice - item.price) * item.quantity);
                    }, 0);

                    return (
                      <div 
                        key={order.id} 
                        className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xs ${isDarkMode ? 'bg-gray-900/60 border-gray-800/80 hover:bg-gray-900' : 'bg-white border-gray-150/50 hover:bg-white'}`}
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-gray-450 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              ID: {order.id}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[order.orderStatus as OrderStatus] || 'bg-gray-100'}`}>
                              {order.orderStatus === 'pending' && 'পেন্ডিং (Pending)'}
                              {order.orderStatus === 'processing' && 'প্রক্রিয়াধীন (Processing)'}
                              {order.orderStatus === 'shipped' && 'শিপড (Shipping)'}
                              {order.orderStatus === 'delivered' && 'ডেলিভার্ড (Delivered)'}
                              {order.orderStatus === 'cancelled' && 'বাতিল (Cancelled)'}
                            </span>
                            {orderProfit > 0 && (
                              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                লভ্যাংশ: ৳{orderProfit.toLocaleString('bn')}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(order.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>

                          <div className="text-xs font-semibold text-gray-650 dark:text-gray-350">
                            পণ্য: {order.items.map(item => `${item.name} (${item.quantity}টি)`).join(', ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-gray-100 md:border-t-0 pt-2.5 md:pt-0 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-gray-405 font-bold block">ক্রয়মূল্য</span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">৳{order.totalAmount.toLocaleString('bn')}</span>
                          </div>
                          <button
                            onClick={() => handleDownloadReceiptPDF(order)}
                            disabled={isDownloading}
                            className="bg-teal-50 hover:bg-teal-100 disabled:bg-gray-100 text-teal-700 disabled:text-gray-400 dark:bg-teal-900/30 dark:hover:bg-teal-900/40 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40 p-2 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                            title="রশিদ ডাউনলোড করুন (Download PDF)"
                          >
                            {isDownloading ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isProfileInquiryModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileInquiryModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-4xl rounded-[24px] shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-emerald-100'}`}>
                <h3 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Profile Inquiry</h3>
                <div className="flex gap-4">
                  {/* Simplistic approach: Showing only unique emails/names as identified from orders */}
                  <div className="flex-1 overflow-y-auto max-h-[400px]">
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Customers</h4>
                    <div className="space-y-2">
                      {Array.from(new Set(orders.map(o => o.customerEmail))).map(email => email && (
                         <div key={email} className={`flex items-center justify-between p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                           <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{email}</span>
                           <button onClick={() => alert("Deletion is not implemented for this demo version.")} className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                         </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[400px]">
                    <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Managers</h4>
                     <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Managers are registered in the system (not derived from orders)</p>
                     {/* For this demo, assuming managers list isn't directly exposed in props, I will have a placeholder */}
                  </div>
                </div>
                <button onClick={() => setIsProfileInquiryModalOpen(false)} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg">Close</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Manager Withdraw Modal */}
        <AnimatePresence>
          {isWithdrawHistoryModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWithdrawHistoryModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className={`relative w-full max-w-lg rounded-[24px] shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-emerald-100'}`}>
                <h3 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>উত্তোলনের ইতিহাস (Withdrawal History)</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {myWithdrawals.length === 0 ? (
                    <p className={`text-center py-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>কোনো ইতিহাস নেই।</p>
                  ) : (
                    myWithdrawals.map(w => (
                      <div key={w.id} className={`p-4 rounded-xl flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div>
                          <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{w.amount.toLocaleString('bn')} ৳</p>
                          <p className={`text-[10px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>তারিখ: {new Date(w.requestedAt).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <span className={`px-2 py-1 text-[10px] rounded-lg font-bold ${w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : w.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {w.status === 'approved' ? 'গৃহীত' : w.status === 'rejected' ? 'বাতিল' : 'পেন্ডিং'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <button onClick={() => setIsWithdrawHistoryModalOpen(false)} className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg">বন্ধ করুন (Close)</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showWithdrawSuccessPopup && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowWithdrawSuccessPopup(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-sm rounded-[24px] shadow-2xl p-8 flex flex-col items-center text-center ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-emerald-100'}`}
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-5 animate-bounce shadow-lg shadow-emerald-500/20">
                  <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ধন্যবাদ!</h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  আপনার উইথড্র রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে। অ্যাডমিন খুব শীঘ্রই আপনার পেমেন্ট পাঠিয়ে দিবে।
                </p>
                <button
                  onClick={() => setShowWithdrawSuccessPopup(false)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md flex justify-center"
                >
                  ঠিক আছে (OK)
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.form
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onSubmit={handleWithdrawSubmit}
                className={`relative w-full max-w-sm rounded-[24px] shadow-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>টাকা উত্তোলন করুন</h3>
                  <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      অ্যামাউন্ট (Amount in Tk.) <span className="text-[10px] text-gray-500 font-normal ml-1">(Max: ৳{availableBalance.toLocaleString('bn')})</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      max="100000"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 500"
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>পেমেন্ট মাধ্যম (Withdraw Method)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['bkash', 'nagad'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setWithdrawMethod(method)}
                          className={`p-2 rounded-xl border flex justify-center items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all ${withdrawMethod === method ? (method === 'bkash' ? 'bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-500/20 dark:border-pink-500/50' : 'bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-500/20 dark:border-orange-500/50') : (isDarkMode ? 'border-gray-700 bg-gray-800 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500')}`}
                        >
                          {method === 'bkash' ? 'bKash' : 'Nagad'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>অ্যাকাউন্ট নাম্বার (Wallet Number)</label>
                    <input
                      type="text"
                      required
                      value={withdrawAccount}
                      onChange={e => setWithdrawAccount(e.target.value)}
                      placeholder={`e.g. 01XXXXXXXXX (${withdrawMethod === 'bkash' ? 'bKash' : 'Nagad'} Personal)`}
                      className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500/50 font-mono transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                  >
                    রিকোয়েস্ট পাঠান (Request Withdraw)
                  </button>
                  <p className="text-center text-[10px] text-gray-500 mt-2">অ্যাডমিন আপনার রিকোয়েস্ট যাচাই করে পেমেন্ট পাঠিয়ে দিবে।</p>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border shadow-xs overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-800 text-gray-100' 
        : 'bg-white border-gray-150/80 text-gray-800'
    }`}>
      {/* Dashboard Top banner */}
      <div className="p-6 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <span className="bg-white/10 text-white/90 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 w-max mb-1.5 border border-white/10 mx-auto sm:mx-0">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
            ADMIN CONTROL CENTER (অ্যাডমিন প্যানেল)
          </span>
          <h3 className="text-xl font-bold tracking-tight">
            স্টোর ম্যানেজমেন্ট এবং মেকানিক্স
          </h3>
        </div>
        
        {/* Navigation Tabs */}
        <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-1 bg-white/10 p-1 rounded-xl border border-white/5 mx-auto w-max">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'stats' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              সারসংক্ষেপ
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              প্রোডাক্টস ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              অর্ডার্স ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'emails' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              ইমেইলস ({emailLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === 'withdrawals' ? 'bg-white text-teal-900 shadow-sm' : 'text-white/80 hover:text-white'}`}
            >
              উত্তোলন ({withdrawalRequests.length})
            </button>
            <button
              onClick={() => setIsProfileInquiryModalOpen(true)}
              className="px-2 py-1.5 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer bg-white/20 text-white hover:bg-white/30 whitespace-nowrap"
            >
              Profile Inquiry
            </button>
          </div>
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
                      <td className="p-4">
                        <div className="font-bold text-emerald-800">৳{p.price.toLocaleString('bn')}</div>
                        {p.managerPrice !== undefined && (
                          <div className="text-[10px] text-amber-700 font-bold mt-0.5 whitespace-nowrap">ম্যানেজার: ৳{p.managerPrice.toLocaleString('bn')}</div>
                        )}
                      </td>
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-455" />
            <input
              type="text"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="অর্ডার নাম্বার, ক্রেতার নাম বা মোবাইল দিয়ে খুঁজুন..."
              className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none text-xs focus:border-emerald-500 transition-all ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-750' 
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className={`p-12 border border-dashed rounded-2xl text-center text-xs ${
                isDarkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'
              }`}>
                কোনো গ্রাহকের অর্ডার এন্ট্রি পাওয়া যায়নি।
              </div>
            ) : (
              filteredOrders.map((o) => (
                <div
                  key={o.id}
                  className={`p-5 border rounded-2xl transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 ${
                    isDarkMode 
                      ? 'border-gray-800 bg-gray-850 hover:border-emerald-900/60' 
                      : 'border-gray-150 bg-gray-50/30 hover:border-emerald-100'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 select-text">
                    <div className="flex flex-wrap items-center gap-2 relative pr-10">
                      <span className={`${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'} font-extrabold font-mono text-sm`}>{o.id}</span>
                      <span className={`text-[10px] font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-450'}`}>
                        {new Date(o.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`text-xs uppercase px-2 py-0.5 rounded-md font-bold font-mono border ${
                        isDarkMode 
                          ? 'bg-gray-900 border-gray-700 text-slate-300' 
                          : 'bg-white/80 border-gray-200/60 text-gray-700'
                      }`}>
                        {o.paymentMethod} ({o.paymentStatus === 'completed' ? 'Paid' : 'COD'})
                      </span>
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => setOrderToDelete(o.id)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-650'}`}>
                      <p>
                        ক্রেতার নাম : <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{o.customerName}</strong> | ফোন: <strong className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>{o.phone}</strong>
                      </p>
                      <p className={`line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-555'}`}>ইমেল ঠিকানা: {o.customerEmail} | ঠিকানা: {o.address}</p>
                      
                      {/* Products snippet */}
                      <p className={`px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${
                        isDarkMode 
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/60' 
                          : 'text-emerald-700 bg-white/75 border-gray-150/40'
                      }`}>
                        <Package className={`w-3.5 h-3.5 shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        পণ্যসমূহ: {' '}
                        <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          {o.items.map(item => `${item.name} (${item.quantity}টি)`).join(', ')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status controller */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 lg:text-right w-full lg:w-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">টোটাল বিল</span>
                      <strong className={`text-base font-extrabold font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>৳{o.totalAmount.toLocaleString('bn')}</strong>
                    </div>

                    <div className="space-y-1.5 w-full sm:w-auto text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">ডেলিভারি স্ট্যাটাস</span>
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'pending')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border cursor-pointer ${
                            o.orderStatus === 'pending' 
                              ? (isDarkMode ? 'bg-amber-955/40 border-amber-500/50 text-amber-400 font-bold' : 'bg-amber-100/50 border-amber-300 text-amber-800') 
                              : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`}
                        >
                          পেন্ডিং
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'processing')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border cursor-pointer ${
                            o.orderStatus === 'processing' 
                              ? (isDarkMode ? 'bg-indigo-955/40 border-indigo-500/50 text-indigo-400 font-bold' : 'bg-indigo-100/50 border-indigo-300 text-indigo-805') 
                              : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`}
                        >
                          প্রসেস
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'shipped')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border cursor-pointer ${
                            o.orderStatus === 'shipped' 
                              ? (isDarkMode ? 'bg-blue-955/40 border-blue-500/50 text-blue-400 font-bold' : 'bg-blue-100/50 border-blue-300 text-blue-800') 
                              : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`}
                        >
                          শিপড্
                        </button>
                        <button
                          onClick={() => onUpdateOrderStatus(o.id, 'delivered')}
                          className={`px-2 py-1 rounded text-[10px] font-semibold uppercase border cursor-pointer ${
                            o.orderStatus === 'delivered' 
                              ? (isDarkMode ? 'bg-emerald-955/40 border-emerald-500/50 text-emerald-400 font-bold' : 'bg-emerald-100/50 border-emerald-305 text-emerald-800') 
                              : (isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50')
                          }`}
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

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 md:p-8 space-y-6">
          <h3 className={`text-lg font-bold flex items-center gap-2 mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <DollarSign className="w-5 h-5 text-teal-600" /> ম্যানেজারদের উত্তোলন রিকোয়েস্ট
          </h3>

          <div className="space-y-4">
            {withdrawalRequests.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">কোনো রিকোয়েস্ট পাওয়া যায়নি</div>
            ) : (
              withdrawalRequests.map(w => (
                <div key={w.id} className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${isDarkMode ? 'bg-gray-800/40 border-gray-700/60 hover:bg-gray-800/80' : 'bg-gray-50/50 hover:bg-gray-50 border-gray-150'}`}>
                  <div className="space-y-1 w-full md:w-auto flex-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        w.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        w.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500 font-bold tracking-wide">ID: {w.id}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">{new Date(w.requestedAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-2">
                      ম্যানেজার: <span className="font-bold">{w.managerName}</span> (ID: {w.managerId})
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <span>অ্যাউন্ট: <strong className="text-base text-teal-700 dark:text-teal-400 font-black">৳{w.amount.toLocaleString('bn')}</strong></span>
                      <span className="px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {w.method === 'bkash' ? 'bKash' : 'Nagad'}
                      </span>
                      <span className="font-mono bg-gray-100 dark:bg-gray-900 px-2 py-0.5 rounded border">{w.accountNumber}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end md:justify-start">
                    <button
                      onClick={() => setWithdrawalToDelete(w.id)}
                      className="px-4 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white transition-colors"
                    >
                      ডিলিট করুন
                    </button>
                    {w.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onUpdateWithdrawalStatus(w.id, 'rejected')}
                          className="px-4 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 bg-white transition-colors"
                        >
                          বাতিল করুন
                        </button>
                        <button
                          onClick={() => onUpdateWithdrawalStatus(w.id, 'approved')}
                          className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                          পরিশোধ করুন (Approve)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {withdrawalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">নিশ্চিত করুন</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">আপনি কি এই উত্তোলন রিকোয়েস্টটি ডিলিট করতে চান?</p>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setWithdrawalToDelete(null)}
                className="px-4 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                না
              </button>
              <button
                onClick={() => {
                  onDeleteWithdrawalRequest(withdrawalToDelete);
                  setWithdrawalToDelete(null);
                }}
                className="px-4 py-2 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal Renders here natively inside container layout */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-sm rounded-[24px] shadow-2xl p-6 ${
                isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  অর্ডার মুছে ফেলবেন?
                </h3>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  অর্ডার <strong className="font-mono">{orderToDelete}</strong> মুছে ফেললে তা আর ফিরিয়ে আনা সম্ভব হবে না। আপনি কি নিশ্চিত?
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  না, বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteOrder(orderToDelete);
                    setOrderToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl font-bold transition-all bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg shadow-red-500/20"
                >
                  হ্যাঁ, মুছুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">মূল্য (Price ৳)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      placeholder="1200"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">ম্যানেজার প্রাইস (Manager Price ৳)</label>
                    <input
                      type="number"
                      min={0}
                      value={prodManagerPrice}
                      onChange={(e) => setProdManagerPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="যদি থাকে..."
                      className="w-full px-3 py-2 bg-gray-50 border border-amber-300 rounded-xl focus:bg-white outline-none focus:border-amber-600 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-600 block">স্টক সংখ্যা (Stock)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none focus:border-teal-600 font-mono text-sm"
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
                      onChange={(e) => {
                        let url = e.target.value;
                        if (url.includes('drive.google.com/file/d/')) {
                          const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            url = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
                          }
                        } else if (url.includes('drive.google.com/open?id=')) {
                          const match = url.match(/id=([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            url = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
                          }
                        }
                        setProdImage(url);
                      }}
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
                              processImageFile(file, (val) => {
                                setProdGallery(prev => [...prev, val]);
                              });
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
                          let url = e.currentTarget.value.trim();
                          if (url) {
                            if (url.includes('drive.google.com/file/d/')) {
                              const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                              if (match && match[1]) {
                                url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                              }
                            }
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
                        let url = input?.value.trim();
                        if (url) {
                          if (url.includes('drive.google.com/file/d/')) {
                            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                            if (match && match[1]) {
                              url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                            }
                          }
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
