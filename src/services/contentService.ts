'use client';

import { adminContentStore } from '@/data/mockAdminContent';
import { Announcement, Banner, ContactInfo, FAQ, FooterContent, Policy } from '@/types/admin';

const STORAGE_KEY = 'dv24h_site_content';

interface ContentState {
  banners: Banner[];
  announcements: Announcement[];
  faqs: FAQ[];
  policies: Policy[];
  contact: ContactInfo;
  footer: FooterContent;
}

const DEFAULT_STATE: ContentState = {
  banners: adminContentStore.getBanners(),
  announcements: adminContentStore.getAnnouncements(),
  faqs: adminContentStore.getFaqs(),
  policies: adminContentStore.getPolicies(),
  contact: adminContentStore.getContact(),
  footer: adminContentStore.getFooter(),
};

let state: ContentState = DEFAULT_STATE;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state = raw ? { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<ContentState>) } : DEFAULT_STATE;
    if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    state = DEFAULT_STATE;
  }
  initialized = true;
}

function persist() {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((listener) => listener());
}

export const contentService = {
  getBanners(): Banner[] { ensureInitialized(); return [...state.banners]; },
  updateBanner(id: string, data: Partial<Banner>) { ensureInitialized(); state = { ...state, banners: state.banners.map((item) => item.id === id ? { ...item, ...data } : item) }; persist(); },
  addBanner(data: Omit<Banner, 'id'>) { ensureInitialized(); state = { ...state, banners: [...state.banners, { ...data, id: `BNR-${crypto.randomUUID().slice(0, 8)}` }] }; persist(); },
  deleteBanner(id: string) { ensureInitialized(); state = { ...state, banners: state.banners.filter((item) => item.id !== id) }; persist(); },

  getAnnouncements(): Announcement[] { ensureInitialized(); return [...state.announcements]; },
  getActiveAnnouncements(): Announcement[] {
    ensureInitialized();
    const today = new Date().toISOString().slice(0, 10);
    return state.announcements.filter((item) => item.isActive && (!item.startDate || item.startDate <= today) && (!item.endDate || item.endDate >= today));
  },
  updateAnnouncement(id: string, data: Partial<Announcement>) { ensureInitialized(); state = { ...state, announcements: state.announcements.map((item) => item.id === id ? { ...item, ...data } : item) }; persist(); },
  addAnnouncement(data: Omit<Announcement, 'id'>) { ensureInitialized(); state = { ...state, announcements: [{ ...data, id: `ANN-${crypto.randomUUID().slice(0, 8)}` }, ...state.announcements] }; persist(); },
  deleteAnnouncement(id: string) { ensureInitialized(); state = { ...state, announcements: state.announcements.filter((item) => item.id !== id) }; persist(); },

  getFaqs(): FAQ[] { ensureInitialized(); return [...state.faqs]; },
  updateFaq(id: string, data: Partial<FAQ>) { ensureInitialized(); state = { ...state, faqs: state.faqs.map((item) => item.id === id ? { ...item, ...data } : item) }; persist(); },
  addFaq(data: Omit<FAQ, 'id'>) { ensureInitialized(); state = { ...state, faqs: [...state.faqs, { ...data, id: `FAQ-${crypto.randomUUID().slice(0, 8)}` }] }; persist(); },
  deleteFaq(id: string) { ensureInitialized(); state = { ...state, faqs: state.faqs.filter((item) => item.id !== id) }; persist(); },

  getPolicies(): Policy[] { ensureInitialized(); return [...state.policies]; },
  updatePolicy(id: string, data: Partial<Policy>) { ensureInitialized(); state = { ...state, policies: state.policies.map((item) => item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item) }; persist(); },

  getContact(): ContactInfo { ensureInitialized(); return state.contact; },
  updateContact(data: Partial<ContactInfo>) { ensureInitialized(); state = { ...state, contact: { ...state.contact, ...data } }; persist(); },

  getFooter(): FooterContent { ensureInitialized(); return state.footer; },
  updateFooter(data: Partial<FooterContent>) { ensureInitialized(); state = { ...state, footer: { ...state.footer, ...data } }; persist(); },

  subscribe(listener: () => void): () => void { ensureInitialized(); listeners.add(listener); return () => listeners.delete(listener); },
};
