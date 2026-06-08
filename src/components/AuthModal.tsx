/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, X, Shield, ShoppingBag } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  isDarkMode?: boolean;
}

export default function AuthModal({ isOpen, onClose, onLogin, isDarkMode = false }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      const adminUser: UserType = {
        id: 'user-admin',
        email: 'admin@ibazar.com',
        name: 'iBazar Chief Admin',
        role: 'admin',
        phone: '01712345678',
        address: 'Dhaka HQ, Gulshan-2, Dhaka'
      };
      onLogin(adminUser);
      onClose();
    } else {
      const customerUser: UserType = {
        id: 'user-customer',
        email: 'customer@test.com',
        name: 'Arif Rahman',
        role: 'customer',
        phone: '01987654321',
        address: 'House 42, Road 11, Banani, Dhaka'
      };
      onLogin(customerUser);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('দয়া করে সব তথ্য পূরণ করুন (Please fill in all fields).');
      return;
    }

    // Check specific credentials
    if (email === 'admin@ibazar.com' && password === 'admin123') {
      handleQuickLogin('admin');
    } else if (email === 'customer@test.com' && password === 'customer123') {
      handleQuickLogin('customer');
    } else {
      // General simulation
      const mockUser: UserType = {
        id: `user-${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        role: 'customer',
        phone: '01500000000',
        address: 'Dhaka, Bangladesh'
      };
      onLogin(mockUser);
      onClose();
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        id="auth-modal-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-900 border-gray-800 text-gray-100' 
            : 'bg-white border-gray-100 text-gray-800'
        }`}
      >
        {/* Colorful top bar */}
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />

        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 id="auth-modal-title" className={`text-2xl font-bold font-sans tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {isLoginMode ? 'লগইন করুন (Login)' : 'অ্যাকাউন্ট তৈরি করুন (Register)'}
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {isLoginMode ? 'iBazar-এ ফিরে আসার জন্য স্বাগতম!' : 'সহজে কেনাকাটা করতে সাইন আপ করুন'}
            </p>
          </div>

          {/* Quick Login Helpers */}
          <div className={`border rounded-2xl p-4 mb-6 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-emerald-950/20 border-emerald-900/60' 
              : 'bg-emerald-55/15 border-emerald-100'
          }`}>
            <h3 className={`text-xs font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-800'
            }`}>
              <Shield className={`w-4.5 h-4.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              টেস্ট করার জন্য ওয়ান-ক্লিক সাইন ইন (Quick Testing Access)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-quick-customer"
                type="button"
                onClick={() => handleQuickLogin('customer')}
                className={`flex flex-col items-center justify-center p-2.5 border rounded-xl text-center transition-all shadow-xs cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 hover:border-emerald-500 hover:bg-gray-750' 
                    : 'bg-white border-emerald-200/60 hover:border-emerald-500 hover:bg-emerald-50/40'
                }`}
              >
                <div className={`flex items-center gap-1 font-bold text-xs ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  গ্রাহক লগইন
                </div>
                <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer Access</span>
              </button>
              <button
                id="btn-quick-admin"
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className={`flex flex-col items-center justify-center p-2.5 border rounded-xl text-center transition-all shadow-xs cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gray-800 border-teal-900/70 hover:border-emerald-500 hover:bg-gray-750' 
                    : 'bg-white border-emerald-200/60 hover:border-emerald-500 hover:bg-emerald-50/40'
                }`}
              >
                <div className={`flex items-center gap-1 font-bold text-xs ${isDarkMode ? 'text-teal-400' : 'text-teal-850'}`}>
                  <Shield className="w-3.5 h-3.5" />
                  অ্যাডমিন লগইন
                </div>
                <span className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin Dashboard</span>
              </button>
            </div>
            <p className={`text-[10px] text-center mt-2.5 font-mono ${isDarkMode ? 'text-emerald-400/85' : 'text-emerald-700/80'}`}>
              Admin: admin@ibazar.com (pass: admin123)
            </p>
          </div>

          <form id="auth-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`text-xs p-3 rounded-xl border ${
                isDarkMode 
                  ? 'text-red-400 bg-red-950/20 border-red-900/55' 
                  : 'text-red-650 bg-red-50 border-red-100'
              }`}>
                {error}
              </div>
            )}

            {!isLoginMode && (
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>পূর্ণ নাম (Full Name)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                  <input
                    id="auth-input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="উদা: আরিফুর রহমান"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-750' 
                        : 'bg-gray-55 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>ইমেইল ঠিকানা (Email Address)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="auth-input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@test.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-750' 
                      : 'bg-gray-55 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>পাসওয়ার্ড (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="auth-input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-750' 
                      : 'bg-gray-55 border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm hover:shadow-md cursor-pointer mt-2"
            >
              {isLoginMode ? 'লগইন করুন' : 'তৈরি করুন'}
            </button>
          </form>

          <div className={`mt-6 text-center text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {isLoginMode ? 'নতুন ইউজার?' : 'ইতিমধ্যেই একাউন্ট আছে?'} {' '}
            <button
              id="toggle-auth-mode-btn"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className={`${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} font-semibold hover:underline bg-transparent border-none cursor-pointer`}
            >
              {isLoginMode ? 'অ্যাকাউন্ট খুলুন' : 'লগইন করুন'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
