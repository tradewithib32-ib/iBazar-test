/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Clock, CheckCircle, Package, Truck, UserCheck, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  orders: Order[];
  isDarkMode?: boolean;
}

export default function OrderTracker({ orders, isDarkMode = false }: OrderTrackerProps) {
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    
    const query = searchId.trim().toUpperCase();
    const found = orders.find(o => o.id.toUpperCase() === query || o.id.replace('#', '').toUpperCase() === query);
    setSearchedOrder(found || null);
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const steps = [
    { label: 'অর্ডার জমা', desc: 'Order Placed', icon: Package },
    { label: 'প্রক্রিয়াধীন', desc: 'Processing', icon: Clock },
    { label: 'শিপড্ হয়েছে', desc: 'Shipped', icon: Truck },
    { label: 'ডেলিভার্ড', desc: 'Delivered', icon: CheckCircle }
  ];

  const currentStep = searchedOrder ? getStatusStep(searchedOrder.orderStatus) : 1;

  return (
    <div className={`rounded-3xl border shadow-xs p-6 md:p-8 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-800 text-gray-100' 
        : 'bg-white border-gray-100 text-gray-800'
    }`}>
      <div className="max-w-xl mx-auto text-center mb-8">
        <h3 className={`text-xl font-bold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          আপনার অর্ডার ট্র্যাক করুন (Track Your Order)
        </h3>
        <p className="text-gray-400 text-xs mt-1">
          অর্ডার করার পর প্রাপ্ত ট্র্যাকিং আইডি দিয়ে যেকোনো সময় আপনার ডেলিভারির বর্তমান অবস্থা জানুন
        </p>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              id="order-search-input"
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="উদা: ORD-102934"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none text-sm font-semibold tracking-wider font-mono text-center transition-all uppercase ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:bg-gray-750 focus:border-emerald-500' 
                  : 'bg-gray-50 border-gray-200 focus:bg-white focus:border-emerald-500'
              }`}
            />
          </div>
          <button
            id="order-search-btn"
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            খুঁজুন
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {searchedOrder ? (
          <motion.div
            key={searchedOrder.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="space-y-8"
          >
            {/* Header info badge */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">অর্ডার ট্র্যাকিং আইডি (Order ID)</span>
                <h4 className="text-lg font-black text-emerald-950 font-mono tracking-wide">{searchedOrder.id}</h4>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">তারিখ (Placed On)</span>
                <p className="text-xs font-semibold text-gray-700 font-mono">
                  {new Date(searchedOrder.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Visual Steps Tracker */}
            <div className="relative py-4">
              {/* Progress Line Background */}
              <div className="absolute top-1/2 left-4 right-4 sm:left-12 sm:right-12 h-1 bg-gray-150 -translate-y-1/2 rounded-full -z-0" />
              {/* Progress Active Line Fill */}
              <div
                className="absolute top-1/2 left-4 sm:left-12 h-1 bg-emerald-600 -translate-y-1/2 rounded-full transition-all duration-700 -z-0"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 90}%` }}
              />

              <div className="relative z-10 grid grid-cols-4 gap-2">
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = stepNum <= currentStep;
                  const isCurrent = stepNum === currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                            : 'bg-white border-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
                      >
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] md:text-xs font-bold mt-2.5 block ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-[8px] md:text-[10px] text-gray-400 block font-mono">{step.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recipient details & items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Recipient detail box */}
              <div className={`rounded-2xl border p-5 space-y-3 ${
                isDarkMode ? 'bg-gray-850 border-gray-800' : 'bg-gray-55 border-gray-100'
              }`}>
                <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  গ্রাহকের বিবরণ (Delivery Info)
                </h5>
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between">
                    <span className="text-gray-400">নাম (Recipient Name):</span>
                    <strong className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{searchedOrder.customerName}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">মোবাইল নাম্বার :</span>
                    <strong className={`font-mono ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>{searchedOrder.phone}</strong>
                  </p>
                  <p className="flex flex-col gap-0.5">
                    <span className="text-gray-400">ডেলিভারি ঠিকানা :</span>
                    <span className={`p-2 rounded-lg border leading-relaxed ${
                      isDarkMode ? 'text-gray-200 bg-gray-900 border-gray-800' : 'text-gray-700 bg-white border-gray-100'
                    }`}>{searchedOrder.address}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">পেমেন্ট গেটওয়ে :</span>
                    <strong className={`uppercase font-mono ${isDarkMode ? 'text-slate-300' : 'text-gray-800'}`}>{searchedOrder.paymentMethod}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-400">পেমেন্ট স্ট্যাটাস :</span>
                    <strong className={`font-semibold ${searchedOrder.paymentStatus === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {searchedOrder.paymentStatus === 'completed' ? 'পরিশোধিত (PAID)' : 'বাকি (COD)'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Items Summary list */}
              <div className={`rounded-2xl border p-5 flex flex-col justify-between ${
                isDarkMode ? 'bg-gray-850 border-gray-800' : 'bg-gray-55 border-gray-100'
              }`}>
                <div>
                  <h5 className="font-bold text-xs uppercase text-gray-400 tracking-wider flex items-center gap-1.5 border-b border-gray-200/60 pb-2 mb-3">
                    <Package className="w-4 h-4 text-emerald-500" />
                    অর্ডারকৃত পণ্য তালিকা (Items Ordered)
                  </h5>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {searchedOrder.items.map((item, id) => (
                      <div key={id} className={`flex justify-between items-center text-xs py-1 border-b last:border-0 ${
                        isDarkMode ? 'text-gray-200 border-gray-850' : 'text-gray-700 border-gray-150/40'
                      }`}>
                        <span className="line-clamp-1 flex-1 pr-2">
                          {item.name} <strong className="text-emerald-500 font-mono font-bold">x{item.quantity}</strong>
                        </span>
                        <span className={`font-bold shrink-0 font-mono ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>৳{(item.price * item.quantity).toLocaleString('bn')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`border-t pt-3 mt-4 flex justify-between items-center -mx-5 -mb-5 p-4 rounded-b-2xl ${
                  isDarkMode ? 'border-gray-805 bg-black/40' : 'border-gray-200/60 bg-white/40'
                }`}>
                  <span className="text-xs font-bold text-gray-400">পরিশোধিত মোট বিল (Paid Amount):</span>
                  <span className="text-lg font-extrabold text-emerald-500 font-mono">৳{searchedOrder.totalAmount.toLocaleString('bn')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          hasSearched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-6 bg-red-50 text-red-700 border border-red-150 rounded-2xl flex items-center justify-center gap-3 max-w-md mx-auto"
            >
              <AlertCircle className="w-8 h-8 shrink-0 text-red-600" />
              <div className="text-xs">
                <strong className="block text-sm font-bold">অর্ডারটি পাওয়া যায়নি (Order Not Found)</strong>
                দয়া করে আপনার অর্ডার ট্র্যাকিং নাম্বারটি সঠিক উপায়ে লিখুন (যেমন: ORD-XXXXXX).
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Quick Track Hints helper list if there are persistent orders */}
      {orders.length > 0 && !searchedOrder && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center mb-3">সাম্প্রতিক অর্ডার আইডি সমুহ (Your Recent Order references for demo):</p>
          <div className="flex flex-wrap justify-center gap-2">
            {orders.slice(-4).map((ord) => (
              <button
                key={ord.id}
                onClick={() => {
                  setSearchId(ord.id);
                  setSearchedOrder(ord);
                  setHasSearched(true);
                }}
                className="px-3.5 py-1.5 bg-gray-50 text-emerald-800 hover:text-white border border-gray-200/70 hover:bg-emerald-600 hover:border-emerald-600 text-xs font-mono font-semibold rounded-lg transition-all shadow-xs cursor-pointer"
              >
                {ord.id} ({ord.customerName.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
