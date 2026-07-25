'use client';

import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import { AuthUser } from '@/types/auth';
import { Order } from '@/types/order';

const NOTES_KEY = 'dv24h_customer_notes';

export interface CustomerNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface CustomerSummary extends AuthUser {
  phoneMasked: string;
  totalOrders: number;
  totalSpent: number;
  lastActiveAt: string;
  notes: CustomerNote[];
}

type NotesMap = Record<string, CustomerNote[]>;

function readNotes(): NotesMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}') as NotesMap;
  } catch {
    return {};
  }
}

function writeNotes(notes: NotesMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function maskPhone(phone: string) {
  if (!phone) return 'Chưa cung cấp';
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

function summarizeUser(user: AuthUser, orders: Order[], notes: NotesMap): CustomerSummary {
  const userOrders = orders.filter((order) => order.userId === user.id);
  const paidOrders = userOrders.filter((order) => order.paymentStatus === 'verified');
  const lastOrder = userOrders[0];
  return {
    ...user,
    phoneMasked: maskPhone(user.phone),
    totalOrders: userOrders.length,
    totalSpent: paidOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    lastActiveAt: lastOrder?.updatedAt || user.createdAt,
    notes: notes[user.id] || [],
  };
}

const listeners = new Set<() => void>();
let subscribed = false;
function ensureSubscriptions() {
  if (subscribed || typeof window === 'undefined') return;
  subscribed = true;
  orderService.subscribe(() => listeners.forEach((listener) => listener()));
}

export const customerService = {
  async getCustomers(): Promise<CustomerSummary[]> {
    ensureSubscriptions();
    await orderService.refreshAllOrders();
    const orders = orderService.getAllOrders();
    const notes = readNotes();
    const users = await authService.getAllUsers();
    return users
      .filter((user) => user.role === 'user')
      .map((user) => summarizeUser(user, orders, notes))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(userId: string): Promise<CustomerSummary | undefined> {
    const customers = await this.getCustomers();
    return customers.find((customer) => customer.id === userId);
  },

  getOrders(userId: string): Order[] {
    return orderService.getOrdersByUser(userId);
  },

  async setStatus(userId: string, status: AuthUser['status']) {
    const result = await authService.setUserStatus(userId, status);
    if (result.success) listeners.forEach((listener) => listener());
    return result;
  },

  async addNote(userId: string, content: string, authorName: string) {
    const customer = await authService.getUserById(userId);
    if (!customer) return { success: false, message: 'Không tìm thấy khách hàng.' };
    const notes = readNotes();
    const note: CustomerNote = {
      id: crypto.randomUUID(),
      content,
      authorName,
      createdAt: new Date().toISOString(),
    };
    notes[userId] = [note, ...(notes[userId] || [])];
    writeNotes(notes);
    listeners.forEach((listener) => listener());
    return { success: true, message: 'Đã lưu ghi chú.' };
  },

  deleteNote(userId: string, noteId: string) {
    const notes = readNotes();
    notes[userId] = (notes[userId] || []).filter((note) => note.id !== noteId);
    writeNotes(notes);
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void): () => void {
    ensureSubscriptions();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
