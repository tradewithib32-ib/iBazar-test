/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Samsung Galaxy A54 5G',
    description: 'High-performance Android smartphone with 120Hz Super AMOLED display, premium cameras, and 5000mAh battery. Excellent value in Bangladesh.',
    price: 48999,
    managerPrice: 42000,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600',
    stock: 12,
    galleryImages: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600'
    ],
    videoUrl: 'https://drive.google.com/file/d/1_T03mIq9b4O8u_7N-nInZ8E3C6mCjUq9/view'
  },
  {
    id: 'prod-2',
    name: 'AcousticPro Wireless Earbuds',
    description: 'Active Noise Cancelling (ANC) true wireless earbuds with deep bass, IPX5 water resistance, and up to 30 hours of play time.',
    price: 3200,
    managerPrice: 2400,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600',
    stock: 25,
    galleryImages: [
      'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'
    ]
  },
  {
    id: 'prod-3',
    name: 'Premium Leather Wallets for Men',
    description: '100% genuine export-quality leather wallet with multiple card slots and secure coin pocket. Crafted in Bangladesh.',
    price: 1450,
    managerPrice: 1100,
    category: 'Clothing & Fashion',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600',
    stock: 45
  },
  {
    id: 'prod-4',
    name: 'Apex Classic Leather Formal Shoes',
    description: 'Timeless elegant leather smart formal shoe for office wear, weddings, and premium meetings. Extremely comfortable design.',
    price: 3890,
    managerPrice: 3000,
    category: 'Clothing & Fashion',
    image: 'https://images.unsplash.com/photo-1486308512493-af649beb6b3c?auto=format&fit=crop&q=80&w=600',
    stock: 18
  },
  {
    id: 'prod-5',
    name: 'Smart Fitness Band Series 7',
    description: 'Heart rate tracker, blood oxygen sensor, 24 sporty workout modes, sleep tracking, and customizable watch faces with 14-day battery.',
    price: 2450,
    managerPrice: 1800,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=600',
    stock: 20
  },
  {
    id: 'prod-6',
    name: 'Anti-Theft Commuter Backpack 25L',
    description: 'Spacious water-resistant backpack with dedicated 15.6-inch laptop pocket, hidden zippers, and built-in USB charging port.',
    price: 1850,
    managerPrice: 1300,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600',
    stock: 30
  },
  {
    id: 'prod-7',
    name: 'Pure Cotton Traditional Kurta',
    description: 'Premium quality organic cotton Kurta for Eid, festivals, and smart casual ethnic wear. Styled with subtle modern embroidery.',
    price: 2800,
    managerPrice: 2200,
    category: 'Clothing & Fashion',
    image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?auto=format&fit=crop&q=80&w=600',
    stock: 15
  },
  {
    id: 'prod-8',
    name: 'Automatic Multi-Cooker Kettle (1.8L)',
    description: 'Efficient stainless steel electric kettle that can boil water, brew tea/coffee, cook noodles, and boil eggs within minutes.',
    price: 1650,
    managerPrice: 1200,
    category: 'Home Appliances',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600',
    stock: 10
  }
];
