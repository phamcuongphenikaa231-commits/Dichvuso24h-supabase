import { Banner, Announcement, FAQ, Policy, ContactInfo, FooterContent } from '@/types/admin';

// ─── Banners ──────────────────────────────────────────────────────────────────
let _banners: Banner[] = [
  {
    id: 'BNR001',
    title: 'Dịch vụ tăng follow Instagram uy tín',
    subtitle: 'Tăng 1000 follow chỉ từ 85.000₫ - Bảo hành 30 ngày',
    imageUrl: '/banner-instagram.jpg',
    linkUrl: '/dich-vu/tang-follow-instagram',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'BNR002',
    title: 'Gói YouTube Premium',
    subtitle: 'Sub, View, Like YouTube - Xử lý nhanh 24/7',
    imageUrl: '/banner-youtube.jpg',
    linkUrl: '/dich-vu/youtube',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'BNR003',
    title: 'Flash Sale TikTok',
    subtitle: 'Giảm 30% tất cả dịch vụ TikTok cuối tháng 7',
    imageUrl: '/banner-tiktok.jpg',
    linkUrl: '/dich-vu/tiktok',
    isActive: false,
    displayOrder: 3,
  },
];

// ─── Announcements ────────────────────────────────────────────────────────────
let _announcements: Announcement[] = [
  {
    id: 'ANN001',
    content: '🎉 Chương trình khuyến mãi hè: Giảm 30% tất cả dịch vụ TikTok từ 1/7 - 31/8/2025',
    type: 'success',
    isActive: true,
    startDate: '2025-07-01',
    endDate: '2025-08-31',
  },
  {
    id: 'ANN002',
    content: '⚠️ Hệ thống bảo trì định kỳ vào 02:00 - 04:00 ngày 25/7/2025. Vui lòng không đặt đơn trong thời gian này.',
    type: 'warning',
    isActive: true,
    startDate: '2025-07-24',
    endDate: '2025-07-25',
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────
let _faqs: FAQ[] = [
  {
    id: 'FAQ001',
    question: 'Dịch vụ tăng follow có bảo hành không?',
    answer: 'Có, tất cả dịch vụ tại DVS24H đều có bảo hành từ 7 - 90 ngày tùy gói. Nếu follow/like/view tụt trong thời gian bảo hành, chúng tôi sẽ bù miễn phí.',
    category: 'Bảo hành',
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'FAQ002',
    question: 'Tôi có thể hủy đơn sau khi đặt không?',
    answer: 'Bạn có thể hủy đơn trong vòng 30 phút sau khi đặt nếu đơn chưa bắt đầu xử lý. Sau khi xử lý, đơn không thể hủy.',
    category: 'Đơn hàng',
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'FAQ003',
    question: 'Hỗ trợ những phương thức thanh toán nào?',
    answer: 'Hiện tại chúng tôi hỗ trợ: MB Bank, MoMo, VietQR và chuyển khoản thủ công qua Zalo. Thông tin chi tiết trong trang thanh toán.',
    category: 'Thanh toán',
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'FAQ004',
    question: 'Tài khoản mạng xã hội của tôi có bị ảnh hưởng không?',
    answer: 'Dịch vụ của chúng tôi được thực hiện theo phương thức an toàn, giảm thiểu rủi ro tối đa. Tuy nhiên, việc sử dụng dịch vụ bên thứ ba có thể vi phạm TOS của nền tảng. Khách hàng chịu hoàn toàn trách nhiệm.',
    category: 'An toàn',
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'FAQ005',
    question: 'Thời gian xử lý đơn là bao lâu?',
    answer: 'Tùy loại dịch vụ: Follow/Like thường 1-24h, Sub YouTube 1-3 ngày, View 30 phút - 2h. Chi tiết xem trong trang mô tả dịch vụ.',
    category: 'Đơn hàng',
    displayOrder: 5,
    isActive: true,
  },
];

// ─── Policies ─────────────────────────────────────────────────────────────────
let _policies: Policy[] = [
  {
    id: 'POL001',
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    content: `# Chính sách bảo mật\n\nChúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng...\n\n## Thu thập thông tin\nChúng tôi thu thập các thông tin cần thiết để cung cấp dịch vụ...\n\n## Sử dụng thông tin\nThông tin chỉ được dùng để xử lý đơn hàng và hỗ trợ khách hàng...`,
    updatedAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'POL002',
    slug: 'dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    content: `# Điều khoản sử dụng\n\nKhi sử dụng dịch vụ tại DVS24H, bạn đồng ý với các điều khoản sau...\n\n## Quy định chung\n- Không sử dụng dịch vụ cho mục đích bất hợp pháp\n- Không chia sẻ tài khoản\n\n## Miễn trừ trách nhiệm\nChúng tôi không chịu trách nhiệm về thiệt hại do vi phạm TOS nền tảng...`,
    updatedAt: '2025-06-01T08:00:00Z',
  },
  {
    id: 'POL003',
    slug: 'chinh-sach-bao-hanh',
    title: 'Chính sách bảo hành & hoàn tiền',
    content: `# Chính sách bảo hành & hoàn tiền\n\n## Bảo hành\nMỗi dịch vụ có thời hạn bảo hành riêng (7-90 ngày). Trong thời gian bảo hành nếu số lượng tụt quá 10% sẽ được bù miễn phí.\n\n## Hoàn tiền\nChúng tôi hỗ trợ hoàn tiền trong các trường hợp: đơn không được xử lý trong 24h, lỗi hệ thống...`,
    updatedAt: '2025-06-15T08:00:00Z',
  },
];

// ─── Contact ──────────────────────────────────────────────────────────────────
let _contact: ContactInfo = {
  hotline: '0901 234 567',
  email: 'support@dichvuso24h.vn',
  address: 'Hà Nội, Việt Nam (Hỗ trợ trực tuyến)',
  workingHours: 'Thứ 2 - Chủ nhật: 08:00 - 22:00',
  facebookUrl: 'https://facebook.com/dichvuso24h',
  telegramUrl: 'https://t.me/dichvuso24h',
  youtubeUrl: 'https://youtube.com/@dichvuso24h',
  zaloUrl: 'https://zalo.me/0901234567',
};

// ─── Footer ───────────────────────────────────────────────────────────────────
let _footer: FooterContent = {
  companyName: 'Dịch Vụ Số 24H',
  description: 'Nền tảng cung cấp dịch vụ tăng tương tác mạng xã hội uy tín, nhanh chóng tại Việt Nam.',
  copyright: '© 2025 DVS24H. All rights reserved.',
  quickLinks: [
    { label: 'Trang chủ', url: '/' },
    { label: 'Dịch vụ', url: '/danh-muc' },
    { label: 'Liên hệ', url: '/lien-he' },
    { label: 'Điều khoản', url: '/dieu-khoan-su-dung' },
  ],
};

// ─── Store ────────────────────────────────────────────────────────────────────
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach(l => l()); }

export const adminContentStore = {
  // Banners
  getBanners: () => _banners,
  updateBanner: (id: string, data: Partial<Banner>) => {
    _banners = _banners.map(b => b.id === id ? { ...b, ...data } : b);
    notify();
  },
  addBanner: (data: Omit<Banner, 'id'>) => {
    _banners = [..._banners, { ...data, id: `BNR${Date.now()}` }];
    notify();
  },
  deleteBanner: (id: string) => {
    _banners = _banners.filter(b => b.id !== id);
    notify();
  },

  // Announcements
  getAnnouncements: () => _announcements,
  updateAnnouncement: (id: string, data: Partial<Announcement>) => {
    _announcements = _announcements.map(a => a.id === id ? { ...a, ...data } : a);
    notify();
  },
  addAnnouncement: (data: Omit<Announcement, 'id'>) => {
    _announcements = [{ ...data, id: `ANN${Date.now()}` }, ..._announcements];
    notify();
  },
  deleteAnnouncement: (id: string) => {
    _announcements = _announcements.filter(a => a.id !== id);
    notify();
  },

  // FAQs
  getFaqs: () => _faqs,
  updateFaq: (id: string, data: Partial<FAQ>) => {
    _faqs = _faqs.map(f => f.id === id ? { ...f, ...data } : f);
    notify();
  },
  addFaq: (data: Omit<FAQ, 'id'>) => {
    _faqs = [..._faqs, { ...data, id: `FAQ${Date.now()}` }];
    notify();
  },
  deleteFaq: (id: string) => {
    _faqs = _faqs.filter(f => f.id !== id);
    notify();
  },

  // Policies
  getPolicies: () => _policies,
  updatePolicy: (id: string, data: Partial<Policy>) => {
    _policies = _policies.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    notify();
  },

  // Contact
  getContact: () => _contact,
  updateContact: (data: Partial<ContactInfo>) => {
    _contact = { ..._contact, ...data };
    notify();
  },

  // Footer
  getFooter: () => _footer,
  updateFooter: (data: Partial<FooterContent>) => {
    _footer = { ..._footer, ...data };
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
