export type HeroBenefitIcon = 'shield' | 'zap' | 'headphones' | 'check';

export interface HomepageHeroBenefit {
  id: string;
  text: string;
  icon: HeroBenefitIcon;
  enabled: boolean;
}

export interface HomepageHeroAsset {
  url: string;
  path: string;
  alt: string;
}

export interface HomepageHeroContent {
  enabled: boolean;
  badgeText: string;
  titleBeforeHighlight: string;
  highlightedTitle: string;
  titleAfterHighlight: string;
  description: string;
  primaryButton: {
    enabled: boolean;
    text: string;
    url: string;
  };
  secondaryButton: {
    enabled: boolean;
    text: string;
    url: string;
  };
  benefits: HomepageHeroBenefit[];
  visual: HomepageHeroAsset;
  background: HomepageHeroAsset & {
    overlayOpacity: number;
    position: 'center' | 'top' | 'bottom' | 'left' | 'right';
    size: 'cover' | 'contain';
    fallbackColor: string;
  };
}

export const DEFAULT_HOMEPAGE_HERO: HomepageHeroContent = {
  enabled: true,
  badgeText: 'Hệ thống tự động – Xử lý 24/7',
  titleBeforeHighlight: 'Dịch vụ số',
  highlightedTitle: 'nhanh chóng',
  titleAfterHighlight: 'minh bạch và thuận tiện',
  description:
    'Cửa hàng cung cấp tài khoản số cao cấp và dịch vụ hỗ trợ mạng xã hội chuyên nghiệp. Đặt hàng tự động, nhận hàng nhanh — không cần chờ đợi.',
  primaryButton: {
    enabled: true,
    text: 'Khám phá dịch vụ',
    url: '/dich-vu',
  },
  secondaryButton: {
    enabled: true,
    text: 'Liên hệ hỗ trợ',
    url: '/tai-khoan/ho-tro',
  },
  benefits: [
    { id: 'warranty', text: 'Bảo hành 1 đổi 1', icon: 'shield', enabled: true },
    { id: 'instant', text: 'Kích hoạt tức thì', icon: 'zap', enabled: true },
    { id: 'support', text: 'Hỗ trợ 24/7', icon: 'headphones', enabled: true },
  ],
  visual: {
    url: '',
    path: '',
    alt: 'Bảng điều khiển dịch vụ số đang hoạt động',
  },
  background: {
    url: '',
    path: '',
    alt: 'Ảnh nền khu vực giới thiệu dịch vụ',
    overlayOpacity: 48,
    position: 'center',
    size: 'cover',
    fallbackColor: '#0f4c81',
  },
};
