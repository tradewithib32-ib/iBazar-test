/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingCart, Video, Image as ImageIcon, CheckCircle, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

// Robust helper to parse Google Drive URLs into embeddable preview links
function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  // match standard /file/d/PROD_ID/view...
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) {
    return `https://drive.google.com/file/d/${matchD[1]}/preview`;
  }
  
  // match id query parameter /open?id=PROD_ID...
  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return `https://drive.google.com/file/d/${matchId[1]}/preview`;
  }

  // If it's already an embed link
  if (url.includes('/preview')) {
    return url;
  }
  
  // YouTube parser for convenience too
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^#&?]+)/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
  }

  return url;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [activeImage, setActiveImage] = useState<string>(product.image);

  const gallery = [product.image, ...(product.galleryImages || [])];
  const driveEmbedUrl = product.videoUrl ? getGoogleDriveEmbedUrl(product.videoUrl) : null;

  return (
    <div id="product-detail-modal-overlay" className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl text-gray-800 flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
      >
        {/* Left Hand: Media Studio Grid */}
        <div className="w-full md:w-1/2 p-6 bg-gray-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-150 relative">
          
          {/* Close button for Mobile screen space */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 z-10 transition pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* Main Stage Media Screen */}
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white border border-gray-200/60 shadow-xs relative flex items-center justify-center">
              {activeMedia === 'image' || !driveEmbedUrl ? (
                <img
                  src={activeImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <iframe
                  src={driveEmbedUrl}
                  title="Product Video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              )}

              {/* Dynamic Status Badges over product */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-800 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-emerald-500/10 shadow-xs">
                  {product.category}
                </span>
                {product.stock <= 0 ? (
                  <span className="bg-red-650 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-md uppercase">
                    স্টক আউট (Out)
                  </span>
                ) : product.stock < 5 ? (
                  <span className="bg-orange-550 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-md uppercase">
                    সীমিত স্টক ({product.stock})
                  </span>
                ) : (
                  <span className="bg-emerald-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-md uppercase">
                    স্টক আছে
                  </span>
                )}
              </div>
            </div>

            {/* Selector Gallery / Tabs */}
            <div className="flex items-center gap-3 justify-center">
              {/* Image Gallery Thumbnails */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%]">
                {gallery.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImage(imgUrl);
                      setActiveMedia('image');
                    }}
                    className={`w-11 h-11 rounded-lg border-2 overflow-hidden transition-all shrink-0 bg-white ${
                      activeMedia === 'image' && activeImage === imgUrl
                        ? 'border-emerald-600 scale-105 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={imgUrl} alt="gallery thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Video Tab button if exists */}
              {driveEmbedUrl && (
                <div className="border-l border-gray-250 pl-3 shrink-0">
                  <button
                    onClick={() => setActiveMedia(activeMedia === 'video' ? 'image' : 'video')}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all ${
                      activeMedia === 'video'
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/70'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    {activeMedia === 'video' ? 'ছবি দেখুন' : 'ভিডিও প্লে করুন'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Hand: Product Specs & Actions */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
          {/* Close Header button for Desktop */}
          <div className="hidden md:flex justify-end items-center shrink-0 mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-full transition cursor-pointer"
            >
              <X className="w-5.5 h-5.5" />
            </button>
          </div>

          <div className="space-y-5 flex-1">
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-100/50 rounded-full px-2.5 py-0.5 tracking-wide uppercase">
                {product.category}
              </span>
              <h3 className="text-lg md:text-xl font-bold text-gray-955 leading-tight">
                {product.name}
              </h3>
            </div>

            {/* Price section */}
            <div className="bg-emerald-50/50 border border-emerald-100/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block mb-0.5">মূল্য (Price in BDT)</span>
                <span className="text-xl font-black text-emerald-855 font-mono">৳{product.price.toLocaleString('bn')}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-400 font-bold block uppercase mb-1">স্টক বিবরণ</span>
                <span className="text-[11px] bg-white border border-gray-150 px-2 py-0.5 rounded-md font-bold text-gray-600">
                  {product.stock <= 0 ? 'স্টক আউট' : `${product.stock} টি মজুদ আছে`}
                </span>
              </div>
            </div>

            {/* Description detail */}
            <div className="space-y-1.5">
              <span className="font-bold text-gray-750 text-xs block">পণ্য বিবরণ (Product Description):</span>
              <div className="text-xs text-gray-650 leading-relaxed font-sans bg-gray-50 p-4 rounded-2xl border border-gray-150/50 max-h-[160px] overflow-y-auto">
                {product.description}
              </div>
            </div>

            {/* Highlighted assurances attributes */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-550 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>মেলা ক্যাশব্যাক অফার প্রযোজ্য</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>তাৎক্ষণিক অর্ডার প্রসেসিং</span>
              </div>
            </div>
          </div>

          {/* Checkout/Add logic */}
          <div className="border-t border-gray-100 pt-5 mt-6 flex gap-3 shrink-0">
            <button
              onClick={() => {
                onAddToCart(product);
                // The requirements say adding to cart inside popup should just increment the number without triggering or keeping the popup closed if specified, we will keep detail popup open for further explorer but show instant tactile state or let them view cart, we will just increment.
              }}
              disabled={product.stock <= 0}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white disabled:text-gray-400 font-bold rounded-2xl shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
            >
              <ShoppingCart className="w-4 h-4" />
              কার্টে যোগ করুন (Add to Cart)
            </button>
            <button
              onClick={onClose}
              className="py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-550 font-bold rounded-2xl text-xs cursor-pointer transition shrink-0"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
