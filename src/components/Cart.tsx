/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Minus, Trash2, ShoppingCart, Tag, Sparkles } from 'lucide-react';
import { CartItem, User as UserType } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveFromCart: (productId: string) => void;
  onCheckout: (discountAmount: number, promoApplied: string) => void;
  currentUser?: UserType | null;
}

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  currentUser
}: CartProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discount, setDiscount] = useState(0); // in BDT (৳)
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const isManager = currentUser?.role === 'manager';

  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = Number(item.product.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + itemPrice * qty;
  }, 0);

  const managerTotal = cartItems.reduce((acc, item) => {
    const itemPrice = Number(item.product.managerPrice ?? item.product.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + itemPrice * qty;
  }, 0);

  const managerUsername = isManager ? currentUser?.email?.split('@')[0].toUpperCase() || '' : '';
  const managerNameCode = isManager ? currentUser?.name?.toUpperCase().replace(/\s+/g, '') || '' : '';

  const applyPromo = () => {
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (subtotal === 0) {
      setPromoError('কার্ট ফাকা! আগে পণ্য যোগ করুন।');
      return;
    }

    if (isManager && (code === managerUsername || code === managerNameCode || code === 'MANAGER')) {
      const discountedAmount = Math.max(0, subtotal - managerTotal);
      setDiscount(discountedAmount);
      setAppliedPromo(`${code} (Manager Discount)`);
      setPromoCode('');
    } else if (code === 'WELCOME20') {
      setDiscount(Math.round(subtotal * 0.2));
      setAppliedPromo('WELCOME20 (20% OFF)');
      setPromoCode('');
    } else if (code === 'EID500') {
      if (subtotal < 2000) {
        setPromoError('EID500 কোডের জন্য ন্যূনতম ২০০০৳ কিনতে হবে।');
        return;
      }
      setDiscount(500);
      setAppliedPromo('EID500 (-500৳)');
      setPromoCode('');
    } else {
      setPromoError('কোডটি সঠিক নয়! ট্রাই করুন: WELCOME20 বা EID500');
    }
  };

  const removePromo = () => {
    setDiscount(0);
    setAppliedPromo('');
  };

  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      {/* Background overlay click */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        id="cart-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl text-gray-800 z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">আপনার কার্ট (Your Cart)</h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700">কার্টটি খালি রয়েছে।</h3>
              <p className="text-gray-400 text-sm mt-1">পছন্দের প্রোডাক্টটি কার্টে যুক্ত করে শপিং শুরু করুন!</p>
              <button
                onClick={onClose}
                className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition-all shadow-xs"
              >
                পণ্য দেখতে যান (Continue Shopping)
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-row items-center sm:items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all relative overflow-hidden group shadow-sm bg-white"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-150 relative">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="flex-1 flex flex-col gap-2 relative">
                  <div className="pr-6">
                    <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2" title={item.product.name}>{item.product.name}</h4>
                    <span className="text-[11px] text-gray-500 font-medium italic mt-1 block tracking-tight">{item.product.category}</span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-auto">
                    <span className="text-emerald-700 font-extrabold text-sm tracking-tight">৳{Number(item.product.price).toLocaleString('bn')}</span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-lg border border-gray-200 self-start">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1 rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-all"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold font-mono px-2 min-w-4 text-center text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, Math.max(Number(item.product.stock) || 10, item.quantity + 1))}
                        className="p-1 rounded-md bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 transition-all"
                        disabled={item.quantity >= (Number(item.product.stock) || 10)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveFromCart(item.product.id)}
                  className="absolute right-3 top-3 p-1.5 bg-red-50 sm:bg-transparent rounded-full sm:hover:bg-red-50 text-red-400 sm:text-gray-300 sm:hover:text-red-500 transition-all"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Promo Codes & Total Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
            {/* Promo Code input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 tracking-wider uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                কুপন কোড (Promo Code)
              </label>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    প্রযুক্ত কোড: {appliedPromo}
                  </span>
                  <button
                    onClick={removePromo}
                    className="text-emerald-900 border border-emerald-200 bg-white hover:bg-emerald-100/50 px-2 py-0.5 rounded-md transition"
                  >
                    বাদ দিন
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="কোড দিন (যেমন: WELCOME20, EID500)"
                    className="flex-1 px-3 py-2 bg-white text-xs border border-gray-200 rounded-xl focus:border-emerald-500 outline-none uppercase font-mono tracking-wider"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transform active:scale-95 transition-all"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-red-500 text-[10px] italic">{promoError}</p>
              )}
              {!appliedPromo && !promoError && (
                <p className="text-[10px] text-gray-400 font-sans">
                  *ট্রাই করুন: <strong className="font-semibold text-emerald-600">WELCOME20</strong> (২০% ডিসকাউন্ট) অথবা <strong className="font-semibold text-emerald-600">EID500</strong> (৫০০৳ ডিসকাউন্ট)
                  {isManager && <span className="block mt-1">ম্যানেজার: আপনি আপনার ইউজারনেম (<strong className="font-semibold text-emerald-600">{managerUsername}</strong>) ব্যবহার করে ডিসকাউন্ট পেতে পারেন।</span>}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>উপ-মোট (Subtotal):</span>
                <span>৳{subtotal.toLocaleString('bn')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>ডিসকাউন্ট (Discount):</span>
                  <span>-৳{discount.toLocaleString('bn')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>ডেলিভারি চার্জ (Delivery):</span>
                <span className="font-bold text-gray-700">ফ্রি (Free)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200/60 pt-2">
                <span>মোট বিল (Total):</span>
                <span className="text-emerald-700 font-extrabold text-lg">৳{finalTotal.toLocaleString('bn')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              id="cart-checkout-btn"
              onClick={() => onCheckout(discount, appliedPromo.split(' ')[0])}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm text-center flex items-center justify-center gap-1.5 cursor-pointer transform active:scale-99"
            >
              চেকআউট করুন (Checkout & Pay)
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
