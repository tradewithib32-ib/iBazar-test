/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Truck, CreditCard, Banknote, User, Phone, MapPin, Mail, ChevronRight, CheckCircle, Smartphone, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { User as UserType, CartItem, PaymentMethod, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  cartItems: CartItem[];
  discountAmount: number;
  promoApplied: string;
  onOrderPlaced: (order: Order) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'shipping' | 'payment_selection' | 'bkash_portal' | 'nagad_portal' | 'card_portal' | 'processing' | 'success';

export default function CheckoutModal({
  isOpen,
  onClose,
  currentUser,
  cartItems,
  discountAmount,
  promoApplied,
  onOrderPlaced,
  onClearCart
}: CheckoutModalProps) {
  // Shipping input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step state
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');

  // Gateway Simulation states
  const [walletNumber, setWalletNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [gatewayStep, setGatewayStep] = useState<'number' | 'otp' | 'pin'>('number');
  
  // Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [validationError, setValidationError] = useState('');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setPhone(currentUser?.phone || '');
      setAddress(currentUser?.address || '');
      setStep('shipping');
      setValidationError('');
      setGatewayStep('number');
      setWalletNumber('');
      setOtp('');
      setPin('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = Number(item.product.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + itemPrice * qty;
  }, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Simple validation for shipping
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) return setValidationError('আপনার নাম প্রদান করুন।');
    if (!email.trim() || !email.includes('@')) return setValidationError('সঠিক ইমেইল এড্রেস লিখুন।');
    if (!phone.trim() || phone.length < 11) return setValidationError('১১ ডিজিটের সচল মোবাইল নাম্বার দিন।');
    if (!address.trim()) return setValidationError('ডেলিভারির সম্পূর্ণ ঠিকানা প্রদান করুন।');

    setStep('payment_selection');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    if (method === 'cod') {
      processFinalOrder('cod', 'completed');
    } else if (method === 'bkash') {
      setStep('bkash_portal');
      setGatewayStep('number');
      setWalletNumber(phone || '017');
    } else if (method === 'nagad') {
      setStep('nagad_portal');
      setGatewayStep('number');
      setWalletNumber(phone || '019');
    } else if (method === 'card') {
      setStep('card_portal');
    }
  };

  // Simulate gateway processing and finalize order
  const processFinalOrder = (method: PaymentMethod, payStatus: 'pending' | 'completed') => {
    setStep('processing');
    
    setTimeout(() => {
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        userId: currentUser?.id || 'guest',
        customerName: name,
        customerEmail: email,
        phone: phone,
        address: address,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        })),
        totalAmount: totalAmount,
        paymentMethod: method,
        paymentStatus: payStatus,
        orderStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      setPlacedOrder(newOrder);
      onOrderPlaced(newOrder);
      onClearCart();
      setStep('success');
    }, 2000);
  };

  // Gateway step confirmations
  const handleWalletNext = () => {
    if (walletNumber.length < 11) {
      setValidationError('সঠিক বিকাশ সচল ওয়ালেট নাম্বার লিখুন।');
      return;
    }
    setValidationError('');
    setGatewayStep('otp');
  };

  const handleOtpNext = () => {
    if (otp.length < 4) {
      setValidationError('অনুগ্রহ করে সঠিক ওটিপি (OTP) কোড দিন।');
      return;
    }
    setValidationError('');
    setGatewayStep('pin');
  };

  const handlePinSubmit = () => {
    if (pin.length < 4) {
      setValidationError('পিন নাম্বার সঠিক নয়।');
      return;
    }
    processFinalOrder(selectedMethod, 'completed');
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s+/g, '').length < 16) {
      setValidationError('১৬ সংখ্যার কার্ড নাম্বার লিখুন।');
      return;
    }
    if (!cardExpiry) {
      setValidationError('কার্ডের মেয়াদ (Expiry Date) দিন।');
      return;
    }
    if (cardCvv.length < 3) {
      setValidationError('৩ সংখ্যার কার্ডের সিকিউরিটি কোড দিন।');
      return;
    }
    processFinalOrder('card', 'completed');
  };

  const handleDownloadPDF = async () => {
    if (!placedOrder) return;
    setIsDownloadingPdf(true);
    setValidationError('');
    
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
      setValidationError("দুঃখিত, পিডিএফ রিপোর্ট তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div id="checkout-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={step === 'shipping' || step === 'success' ? onClose : undefined} />

      <motion.div
        id="checkout-modal-box"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden text-gray-800 z-10 max-h-[90vh] flex flex-col"
      >
        {/* Step based screens */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="flex flex-col h-full overflow-y-auto">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-5 h-5" />
                ডেলিভারি ঠিকানা ও তথ্য (Shipping Info)
              </h3>
              <p className="text-white/80 text-xs mt-1">পণ্যটি দ্রুত ঠিকানায় পাঠাতে সঠিক তথ্য দিন</p>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {validationError && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-100 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4.5 h-4.5" />
                  {validationError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" /> নাম (Recipient Name)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদা: আরমান শেখ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none text-sm focus:border-emerald-500 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" /> ইমেইল (Email Address)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none text-sm focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> ফোন নাম্বার (BD Mobile Phone)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="যেমন: 01712345678"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none text-sm focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> সম্পূর্ণ ঠিকানা (Billing Address)
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="উদা: বাসা ৩, রাস্তা ১০, সেক্টর ৪, উত্তরা, ঢাকা"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none text-sm focus:border-emerald-500 transition-all font-sans resize-none"
                />
              </div>

              {/* Order total info banner */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center text-sm">
                <div>
                  <span className="text-xs text-gray-500">মোট বিল (Total Payable Amount):</span>
                  {promoApplied && <span className="block text-[10px] text-emerald-700 font-bold">কুপন: {promoApplied}</span>}
                </div>
                <span className="text-emerald-700 font-bold text-xl">৳{totalAmount.toLocaleString('bn')}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shadow-xs transition"
              >
                পেমেন্টে যান (Payment Option) <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {step === 'payment_selection' && (
          <div className="flex flex-col h-full">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                পেমেন্ট গেটওয়ে (Select Payment Gateway)
              </h3>
              <p className="text-white/80 text-xs mt-1">পছন্দের নিরাপদ পেমেন্ট মেথড সিলেক্ট করুন</p>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">নিরাপদ পেমেন্ট মেথডস:</p>
              
              <div className="grid grid-cols-1 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('bkash')}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-pink-500 hover:bg-pink-50/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#E2136E] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-800 block group-hover:text-pink-600">বিকাশ পেমেন্ট (bKash Checkout)</span>
                      <span className="text-xs text-gray-500">বিকাশ ওয়ালেট থেকে সরাসরি অটো-পেমেন্ট</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-pink-500 transition" />
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('nagad')}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#F26422] hover:bg-orange-50/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F26422] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-800 block group-hover:text-[#F26422]">নগদ পেমেন্ট (Nagad Instant Pay)</span>
                      <span className="text-xs text-gray-500">সহজ ও দ্রুত নগদ ডিজিটাল ওয়ালেট পেমেন্ট</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-[#F26422] transition" />
                </button>

                {/* Cards */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('card')}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/10 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-850 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-800 block group-hover:text-emerald-600">কার্ড দিয়ে পেমেন্ট (Debit/Credit Card)</span>
                      <span className="text-xs text-gray-500">Visa, Mastercard, DBBL Nexus etc.</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-emerald-500 transition" />
                </button>

                {/* Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => handlePaymentSelect('cod')}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-emerald-600 hover:bg-emerald-50/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-gray-800 block group-hover:text-emerald-700">ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
                      <span className="text-xs text-gray-500">পণ্য হাতে পেয়ে টাকা বুঝিয়ে দিন</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4.5 h-4.5 text-gray-400 group-hover:text-emerald-600 transition" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setStep('shipping')}
                className="w-full text-center py-2 text-xs font-semibold text-emerald-600 hover:underline"
              >
                ডেলিভারি ঠিকানা পরিবর্তন করুন
              </button>
            </div>
          </div>
        )}

        {/* bKash simulated checkout portal */}
        {step === 'bkash_portal' && (
          <div className="flex flex-col h-full bg-[#E2136E] text-white">
            <div className="p-6 flex flex-col items-center justify-center border-b border-white/10 relative">
              <div className="bg-white px-4 py-2 rounded-xl mb-2 shadow-sm">
                <span className="text-[#E2136E] font-black tracking-widest text-lg">bKash</span>
              </div>
              <p className="text-xs text-white/90">Merchant: iBazar.com</p>
              <p className="text-md font-bold mt-1">payable amount: ৳{totalAmount.toLocaleString('bn')}</p>
              
              <button
                onClick={() => setStep('payment_selection')}
                className="absolute top-4 right-4 text-white/55 hover:text-white text-xs border border-white/20 rounded-md px-2 py-0.5"
              >
                বাতিল
              </button>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-center space-y-5 text-center">
              {validationError && (
                <div className="bg-white/10 text-white text-xs p-3 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 mx-auto max-w-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </div>
              )}

              {gatewayStep === 'number' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-medium text-white/85">বিকাশ একাউন্ট নাম্বার দিন (Your bKash Account Number)</p>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    maxLength={11}
                    className="w-full text-center py-3 bg-white text-gray-900 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="017xxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={handleWalletNext}
                    className="w-full bg-white hover:bg-gray-100 text-[#E2136E] font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    পরবর্তী (NEXT)
                  </button>
                </div>
              )}

              {gatewayStep === 'otp' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-medium text-white/85">নাম্বারে প্রেরিত ভেরিফিকেশন কোড (Enter OTP Code)</p>
                  <input
                    type="password"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full text-center py-3 bg-white text-gray-900 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="******"
                  />
                  <p className="text-[10px] text-white/70 italic">*ভেরিফিকেশন টেস্ট করার জন্য যেকোনো কোড দিন</p>
                  <button
                    type="button"
                    onClick={handleOtpNext}
                    className="w-full bg-white hover:bg-gray-100 text-[#E2136E] font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    কোড নিশ্চিত করুন (CONFIRM)
                  </button>
                </div>
              )}

              {gatewayStep === 'pin' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-medium text-white/85">বিকাশ পিন নাম্বার দিন (Enter bKash Account PIN)</p>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={5}
                    className="w-full text-center py-3 bg-white text-gray-900 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="*****"
                  />
                  <p className="text-[10px] text-white/70 italic">*নিরাপদ সিমুলেশন: আপনার টেস্ট পিন দিন</p>
                  <button
                    type="button"
                    onClick={handlePinSubmit}
                    className="w-full bg-white hover:bg-gray-100 text-[#E2136E] font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    লেনদেন সম্পন্ন করুন (PAY ৳{totalAmount.toLocaleString('bn')})
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/10 text-center text-[10px] text-white/60">
              নিরাপদ পেমেন্ট সিমুলেশন | bKash Authorized Secure Gateway
            </div>
          </div>
        )}

        {/* Nagad simulated checkout portal */}
        {step === 'nagad_portal' && (
          <div className="flex flex-col h-full bg-[#f3591a] text-white">
            <div className="p-6 flex flex-col items-center justify-center border-b border-white/10 relative">
              <div className="bg-white px-5 py-2 rounded-xl mb-2 shadow-sm flex items-center gap-1">
                <span className="text-[#f3591a] font-black italic text-lg">nagad</span>
              </div>
              <p className="text-xs text-white/90 font-medium">Merchant: iBazar (EPay)</p>
              <p className="text-md font-extrabold mt-1">payable bill: ৳{totalAmount.toLocaleString('bn')}</p>
              
              <button
                onClick={() => setStep('payment_selection')}
                className="absolute top-4 right-4 text-white/55 hover:text-white text-xs border border-white/20 rounded-md px-2 py-0.5"
              >
                বাতিল
              </button>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-center space-y-5 text-center">
              {validationError && (
                <div className="bg-white/10 text-white text-xs p-3 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 mx-auto max-w-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </div>
              )}

              {gatewayStep === 'number' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-semibold text-white/85">নগদ অ্যাকাউন্ট নাম্বার (Nagad Wallet No)</p>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    maxLength={11}
                    className="w-full text-center py-3 bg-white text-orange-950 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="019xxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={handleWalletNext}
                    className="w-full bg-[#ffea55] hover:bg-[#ffe100] text-gray-900 font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    পরবর্তী ধাপ (NEXT)
                  </button>
                </div>
              )}

              {gatewayStep === 'otp' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-semibold text-white/85">ওটিপি কোড (Type Instant OTP)</p>
                  <input
                    type="password"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full text-center py-3 bg-white text-orange-950 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="******"
                  />
                  <button
                    type="button"
                    onClick={handleOtpNext}
                    className="w-full bg-[#ffea55] hover:bg-[#ffe100] text-gray-900 font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    ওটিপি কোড ভেরিফাই করুণ (VERIFY)
                  </button>
                </div>
              )}

              {gatewayStep === 'pin' && (
                <div className="space-y-4 max-w-xs mx-auto w-full">
                  <p className="text-xs font-semibold text-white/85">নগদ ওয়ালেট পিন (Enter Nagad Wallet PIN)</p>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    maxLength={4}
                    className="w-full text-center py-3 bg-white text-orange-950 border-none rounded-xl text-lg font-bold font-mono tracking-widest outline-none shadow-md"
                    placeholder="****"
                  />
                  <button
                    type="button"
                    onClick={handlePinSubmit}
                    className="w-full bg-[#ffea55] hover:bg-[#ffe100] text-gray-900 font-bold py-3 rounded-xl text-xs shadow-md transform active:scale-97 transition"
                  >
                    পেমেন্ট নিশ্চিত করুণ (PAY ৳{totalAmount})
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 bg-black/10 text-center text-[10px] text-white/60">
              নগদ পেমেন্ট গেটওয়ে সিমুলেশন | Nagad Digital Banking Solution
            </div>
          </div>
        )}

        {/* Card Simulated checkout portal */}
        {step === 'card_portal' && (
          <form onSubmit={handleCardSubmit} className="flex flex-col h-full bg-white">
            <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
              <div>
                <h4 className="font-bold flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5" />
                  কার্ড পেমেন্ট (Debit/Credit Card Pay)
                </h4>
                <p className="text-[10px] text-white/80">নিরাপদ ৩ডি ট্রানজ্যাকশন গেটওয়ে</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('payment_selection')}
                className="text-white/70 hover:text-white border border-white/20 px-2 py-0.5 rounded text-xs"
              >
                পিছনে যান
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              {validationError && (
                <div className="bg-red-50 text-red-700 text-xs p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">কার্ড ধারকের নাম (Cardholder Name)</label>
                <input
                  type="text"
                  required
                  placeholder="উদা: আরমান রহমান"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">কার্ড নাম্বার (Card Number)</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/[^0-digit]/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    maxLength={19}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-sm font-mono tracking-wider"
                  />
                  <CreditCard className="absolute right-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">মেয়াদ উত্তীর্ণের তারিখ (MM/YY)</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    maxLength={5}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">সিভিভি (CVV / CVC)</label>
                  <input
                    type="password"
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    maxLength={3}
                    placeholder="***"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-sm font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-500">পরিশোধের পরিমাণ :</span>
                <strong className="text-emerald-700 font-bold">৳{totalAmount.toLocaleString('bn')}</strong>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                কার্ড পেমেন্ট নিশ্চিত করুণ (PAY ৳{totalAmount.toLocaleString('bn')})
              </button>
            </div>
          </form>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
            <h4 className="text-lg font-bold text-gray-900">লেনদেন প্রসেস হচ্ছে (Processing Transaction...)</h4>
            <p className="text-gray-550 text-xs max-w-xs">পেমেন্ট গেটওয়েতে যোগাযোগ করা হচ্ছে। অনুগ্রহ করে ব্রাউজার রিলোড বা বন্ধ করবেন না।</p>
          </div>
        )}

        {/* Checkout Success Screen */}
        {step === 'success' && placedOrder && (
          <div className="p-8 flex flex-col items-center text-center space-y-5 h-full overflow-y-auto relative">
            {/* PDF Report Download Button (indicated by user request) */}
            <button
              id="download-invoice-btn"
              type="button"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              title="মূল্য পরিশোধের রশিদ ডাউনলোড করুন"
              className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:bg-gray-100 disabled:text-gray-400 text-emerald-700 hover:text-emerald-800 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 duration-200"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>রশিদ ডাউনলোড (PDF)</span>
            </button>

            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs animate-bounce">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-2xl font-bold text-gray-900">অর্ডার সফলভাবে সম্পন্ন হয়েছে!</h4>
              <p className="text-emerald-700 font-semibold text-sm">পেমেন্ট স্ট্যাটাস: {placedOrder.paymentStatus === 'completed' ? 'সফল (Success)' : 'ক্যাশ অন ডেলিভারি'}</p>
              <p className="text-xs text-gray-500">আপনার প্রদত্ত ইমেল ঠিকানায় <strong className="text-emerald-600 font-semibold">{placedOrder.customerEmail}</strong> একটি অর্ডার নিশ্চিতকরণ চিঠি প্রেরণ করা হয়েছে।</p>
            </div>

            {/* Receipt Summary Box */}
            <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-2.5 text-left text-xs">
              <h5 className="font-bold border-b border-gray-200/60 pb-1.5 uppercase text-[10px] text-gray-500 tracking-wider">অর্ডার মেমো (Order Detail Summary)</h5>
              <div className="flex justify-between">
                <span className="text-gray-500">অর্ডার ট্র্যাকিং আইডি :</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ডেলিভারির নাম:</span>
                <span className="font-semibold text-gray-800">{placedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">মোবাইল নাম্বার :</span>
                <span className="font-semibold text-gray-800 font-mono">{placedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">পেমেন্ট গেটওয়ে :</span>
                <span className="font-bold text-gray-700 uppercase">{placedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200/50 pt-2 text-sm font-bold">
                <span className="text-gray-900">পরিশোধিত মোট :</span>
                <span className="text-emerald-700">৳{placedOrder.totalAmount.toLocaleString('bn')}</span>
              </div>
            </div>

            {/* How to track warning */}
            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 text-left w-full flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-5 h-5 shrink-0 text-emerald-700" />
              <div>
                অনলাইন ট্র্যাকিং ফিচারে আপনার ট্র্যাকিং নাম্বার <strong className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-emerald-950">{placedOrder.id}</strong> লিখে সার্চ দিয়ে যেকোনো সময় অর্ডারের অবস্থা দেখতে পারবেন।
              </div>
            </div>

            <button
              id="success-continue-btn"
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm cursor-pointer"
            >
              কেনাকাটা অব্যাহত রাখুন (Finish)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
