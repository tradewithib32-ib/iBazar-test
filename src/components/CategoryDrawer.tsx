/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight, Grid, LayoutGrid, Sparkles, FolderHeart } from 'lucide-react';
import { Product } from '../types';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
}

export default function CategoryDrawer({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  products
}: CategoryDrawerProps) {
  // Helper to get product count per category
  const getProductCount = (category: string) => {
    if (category === 'All') return products.length;
    return products.filter(p => p.category === category).length;
  };

  // Icon mapping for categories to make it look premium
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All':
        return <LayoutGrid className="w-4 h-4 text-teal-600" />;
      case 'Electronics':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'Accessories':
        return <FolderHeart className="w-4 h-4 text-purple-600" />;
      default:
        return <Grid className="w-4 h-4 text-teal-700" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 left-0 max-w-full flex">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="w-80 max-w-md bg-white shadow-2xl flex flex-col justify-between"
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between bg-gradient-to-tr from-emerald-600 via-teal-800 to-indigo-900 text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <LayoutGrid className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">পণ্য বিভাগ সমুহ (Categories)</h3>
                <p className="text-[9px] text-white/70">পছন্দের ক্যাটাগরি বেছে নিন</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/95 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content - Category list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block pt-2">
              সব বিভাগ তালিকা (Menu Lists)
            </span>
            
            <div className="space-y-1.5">
              {categories.map((cat) => {
                const count = getProductCount(cat);
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory(cat);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer group/item ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-150/50' 
                        : 'hover:bg-gray-100/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isActive ? 'bg-emerald-100/50' : 'bg-gray-50'
                      }`}>
                        {getCategoryIcon(cat)}
                      </div>
                      <span className="text-xs text-gray-800 font-bold tracking-tight">
                        {cat === 'All' ? 'সব বিভাগ (All Catalog)' : cat}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 group-hover/item:bg-gray-200 text-gray-500'
                      }`}>
                        {count}টি
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-gray-400 group-hover/item:text-emerald-700 transition-transform group-hover/item:translate-x-0.5 ${isActive ? 'text-emerald-700' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer Footer Banner info */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-[10px] text-teal-800 font-black tracking-widest uppercase">iBazar Mart</span>
            <p className="text-[9px] text-gray-400">সহজ এবং বিশ্বস্ত অনলাইন শপিং সমাধান</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
