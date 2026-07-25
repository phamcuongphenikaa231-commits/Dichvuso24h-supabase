'use client';

import { SupportTicket, TicketMessage, TicketPriority, TicketStatus } from '@/types/admin';

const STORAGE_KEY = 'dv24h_support_tickets';

export const TICKET_PRIORITY_MAP: Record<TicketPriority, { label: string; badge: 'danger' | 'warning' | 'primary' | 'secondary' }> = {
  urgent: { label: 'Khẩn cấp', badge: 'danger' },
  high: { label: 'Cao', badge: 'warning' },
  medium: { label: 'Trung bình', badge: 'primary' },
  low: { label: 'Thấp', badge: 'secondary' },
};

export const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; badge: 'warning' | 'primary' | 'cyan' | 'success' | 'secondary' }> = {
  open: { label: 'Mở', badge: 'warning' },
  in_progress: { label: 'Đang xử lý', badge: 'primary' },
  waiting: { label: 'Chờ khách', badge: 'cyan' },
  resolved: { label: 'Đã giải quyết', badge: 'success' },
  closed: { label: 'Đã đóng', badge: 'secondary' },
};

export const SUPPORT_STAFF = ['admin24h', 'Trần Thị B', 'Lê Văn C'];

const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-DEMO-01',
    subject: 'Kiểm tra trạng thái đơn hàng',
    priority: 'medium',
    status: 'in_progress',
    customerId: 'usr-demo-01',
    customerName: 'Nguyễn Văn Minh',
    customerUsername: 'user0988',
    relatedOrderId: 'DV24H-240726-B9L3',
    relatedOrderService: 'Tăng Follow Facebook Profile Việt Thật',
    assignedTo: 'admin24h',
    createdAt: '2026-07-24T10:30:00.000Z',
    updatedAt: '2026-07-24T10:40:00.000Z',
    tags: ['đơn hàng'],
    messages: [
      {
        id: 'MSG-DEMO-01',
        senderType: 'customer',
        senderName: 'Nguyễn Văn Minh',
        content: 'Nhờ shop kiểm tra giúp tiến độ đơn hàng của tôi.',
        createdAt: '2026-07-24T10:30:00.000Z',
        isInternal: false,
      },
      {
        id: 'MSG-DEMO-02',
        senderType: 'admin',
        senderName: 'admin24h',
        content: 'Shop đã tiếp nhận và đang kiểm tra tiến độ cho bạn.',
        createdAt: '2026-07-24T10:40:00.000Z',
        isInternal: false,
      },
    ],
  },
];

let tickets: SupportTicket[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tickets = raw ? (JSON.parse(raw) as SupportTicket[]) : SEED_TICKETS;
    if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    tickets = SEED_TICKETS;
  }
  initialized = true;
}

function persist() {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  listeners.forEach((listener) => listener());
}

export interface CreateTicketInput {
  customerId: string;
  customerName: string;
  customerUsername: string;
  subject: string;
  content: string;
  topic: string;
  relatedOrderId?: string;
  relatedOrderService?: string;
}

export const supportService = {
  getTickets(): SupportTicket[] {
    ensureInitialized();
    return [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getTicketsByCustomer(customerId: string): SupportTicket[] {
    return this.getTickets().filter((ticket) => ticket.customerId === customerId);
  },

  getById(id: string): SupportTicket | undefined {
    ensureInitialized();
    return tickets.find((ticket) => ticket.id === id);
  },

  createTicket(input: CreateTicketInput): SupportTicket {
    ensureInitialized();
    const now = new Date().toISOString();
    const ticket: SupportTicket = {
      id: `TKT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      subject: input.subject,
      priority: input.topic === 'payment' || input.topic === 'warranty' ? 'high' : 'medium',
      status: 'open',
      customerId: input.customerId,
      customerName: input.customerName,
      customerUsername: input.customerUsername,
      relatedOrderId: input.relatedOrderId || undefined,
      relatedOrderService: input.relatedOrderService || undefined,
      createdAt: now,
      updatedAt: now,
      tags: [input.topic],
      messages: [
        {
          id: crypto.randomUUID(),
          senderType: 'customer',
          senderName: input.customerName,
          content: input.content,
          createdAt: now,
          isInternal: false,
        },
      ],
    };
    tickets = [ticket, ...tickets];
    persist();
    return ticket;
  },

  assign(ticketId: string, assignee: string) {
    ensureInitialized();
    tickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? { ...ticket, assignedTo: assignee, status: ticket.status === 'open' ? 'in_progress' : ticket.status, updatedAt: new Date().toISOString() }
        : ticket
    );
    persist();
  },

  setStatus(ticketId: string, status: TicketStatus) {
    ensureInitialized();
    tickets = tickets.map((ticket) => ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket);
    persist();
  },

  addMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>) {
    ensureInitialized();
    const newMessage: TicketMessage = { ...message, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    tickets = tickets.map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status:
              message.senderType === 'admin' && !message.isInternal
                ? 'waiting'
                : message.senderType === 'customer' && ticket.status === 'waiting'
                  ? 'in_progress'
                  : ticket.status,
            messages: [...ticket.messages, newMessage],
            updatedAt: newMessage.createdAt,
          }
        : ticket
    );
    persist();
  },

  subscribe(listener: () => void): () => void {
    ensureInitialized();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
