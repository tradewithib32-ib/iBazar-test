/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in BDT (৳) (Base Price / Customer Price)
  managerPrice?: number; // Manager Sales Price
  category: string;
  image: string;
  stock: number;
  galleryImages?: string[];
  videoUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'customer' | 'admin' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface WithdrawalRequest {
  id: string;
  managerId: string;
  managerName: string;
  amount: number;
  method: 'bkash' | 'nagad';
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}
