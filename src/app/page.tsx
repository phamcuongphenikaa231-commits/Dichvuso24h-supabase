'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { formatVND } from '@/utils/format';
import {
  Zap,
  Eye,
  ShieldCheck,
  HeadphonesIcon,
  Package,
  Users,
  Cpu,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/productService';
import { Service } from '@/types/service';
import { homepageHeroService } from '@/services/homepageHeroService';
import { HomepageHeroBenefit, HomepageHeroContent } from '@/types/site';


// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({
  tag,
  title,
  subtitle,
  center = false,
}: {
  tag: string;
  title: React.ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`space-y-3 ${center ? 'text-center' : ''}`}>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f7ff] border border-[#0f4c81]/15 text-xs font-semibold text-[#0f4c81] uppercase tracking-wider">
        {tag}
      </span>
      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-sm text-slate-500 leading-relaxed ${center ? 'max-w-xl mx-auto' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Hero Illustration (SVG – 100% original, no copyright) ──────────────────

function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Dashboard card main */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/80 font-semibold">Hệ thống đang hoạt động</span>
          </div>
          <span className="text-[10px] text-cyan-200 bg-cyan-500/20 px-2 py-0.5 rounded-full font-bold">LIVE</span>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Đơn hôm nay', value: '247', color: 'text-cyan-300' },
            { label: 'Đang xử lý', value: '18', color: 'text-amber-300' },
            { label: 'Hoàn thành', value: '229', color: 'text-emerald-300' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-white/60 mt-0.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Service list */}
        <div className="space-y-2">
          {[
            { name: 'ChatGPT Plus', status: 'Kích hoạt', dot: 'bg-emerald-400' },
            { name: 'Canva Pro', status: 'Kích hoạt', dot: 'bg-emerald-400' },
            { name: 'Tăng Follow FB', status: 'Đang chạy', dot: 'bg-amber-400' },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
              <span className="text-xs text-white/90 font-medium">{item.name}</span>
              <span className={`flex items-center gap-1.5 text-[10px] font-semibold text-white/70`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Mini chart bars */}
        <div className="mt-4 flex items-end gap-1 h-12 pt-2">
          {[40, 65, 50, 80, 55, 90, 75, 95, 60, 85].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-cyan-400/60 to-cyan-200/30"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="text-[10px] text-white/40 text-center mt-1">Biểu đồ đơn hàng 10 ngày gần nhất</p>
      </div>

      {/* Floating badge 1 */}
      <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Tự động 24/7
      </div>

      {/* Floating badge 2 */}
      <div className="absolute -bottom-3 -left-3 bg-white text-[#0f4c81] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-slate-200">
        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Bảo hành 1 đổi 1
      </div>
    </div>
  );
}



// ─── Main Page ───────────────────────────────────────────────────────────────

function HeroBenefitIcon({ benefit }: { benefit: HomepageHeroBenefit }) {
  if (benefit.icon === 'zap') return <Zap className="w-4 h-4 text-amber-300" />;
  if (benefit.icon === 'headphones') return <HeadphonesIcon className="w-4 h-4 text-cyan-300" />;
  if (benefit.icon === 'check') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
}

export default function HomePage() {
  const [hero, setHero] = useState<HomepageHeroContent>(() => homepageHeroService.getCached());
  const [featuredServices, setFeaturedServices] = useState<Service[]>(() =>
    productService.getFeatured().slice(0, 8)
  );
  const [categories, setCategories] = useState(() => productService.getCategories());

  useEffect(() => {
    const refresh = () => {
      setFeaturedServices(productService.getFeatured().slice(0, 8));
      setCategories(productService.getCategories());
    };
    refresh();
    return productService.subscribe(refresh);
  }, []);

  useEffect(() => {
    let mounted = true;
    homepageHeroService.refresh().then((value) => {
      if (mounted) setHero(value);
    });
    const unsubscribe = homepageHeroService.subscribe(() => {
      if (mounted) setHero(homepageHeroService.getCached());
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-0">

      {/* ═══════════════════════════════════════════════════════
          SECTION 1 – HERO
      ═══════════════════════════════════════════════════════ */}
      {hero.enabled && (
        <section
          className="text-white relative overflow-hidden"
          style={{
            backgroundColor: hero.background.fallbackColor,
            backgroundImage: hero.background.url ? `url(${hero.background.url})` : undefined,
            backgroundPosition: hero.background.position,
            backgroundSize: hero.background.size,
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div
            className="absolute inset-0 bg-slate-950 pointer-events-none"
            style={{ opacity: hero.background.url ? hero.background.overlayOpacity / 100 : 0.05 }}
          />
          {!hero.background.url && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d3f6e] via-[#0f4c81] to-[#1565a0] pointer-events-none" />
          )}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
            <div className="absolute left-0 bottom-0 w-72 h-72 bg-[#0f4c81]/30 rounded-full blur-2xl" />
          </div>

          <div className="container-custom relative z-10 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="space-y-6 text-center lg:text-left">
              {hero.badgeText && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {hero.badgeText}
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {hero.titleBeforeHighlight}{' '}
                {hero.highlightedTitle && <span className="text-cyan-300">{hero.highlightedTitle}</span>}
                {hero.highlightedTitle && hero.titleAfterHighlight ? ', ' : ' '}
                {hero.titleAfterHighlight}
              </h1>

              {hero.description && (
                <p className="text-base text-white/80 leading-relaxed max-w-lg mx-auto lg:mx-0 whitespace-pre-line">
                  {hero.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {hero.primaryButton.enabled && hero.primaryButton.text && hero.primaryButton.url && (
                  <Link href={hero.primaryButton.url}>
                    <Button variant="accent" size="lg" className="shadow-lg shadow-cyan-500/25 font-bold">
                      {hero.primaryButton.text} <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
                {hero.secondaryButton.enabled && hero.secondaryButton.text && hero.secondaryButton.url && (
                  <Link href={hero.secondaryButton.url}>
                    <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold">
                      {hero.secondaryButton.text}
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-2 text-xs text-white/70">
                {hero.benefits.filter((benefit) => benefit.enabled && benefit.text).map((benefit) => (
                  <span key={benefit.id} className="flex items-center gap-1.5">
                    <HeroBenefitIcon benefit={benefit} /> {benefit.text}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              {hero.visual.url ? (
                <div className="relative w-full max-w-md mx-auto lg:mx-0">
                  <img
                    src={hero.visual.url}
                    alt={hero.visual.alt}
                    className="w-full max-h-[430px] object-contain rounded-2xl drop-shadow-2xl"
                  />
                </div>
              ) : (
                <HeroIllustration />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 – BENEFITS BAR
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-100">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                bg: 'bg-amber-50',
                title: 'Xử lý nhanh',
                desc: 'Tài khoản kích hoạt ngay sau khi thanh toán, dịch vụ khởi chạy trong vòng vài phút.',
              },
              {
                icon: <Eye className="w-6 h-6 text-[#0f4c81]" />,
                bg: 'bg-[#f0f7ff]',
                title: 'Thông tin minh bạch',
                desc: 'Giá niêm yết rõ ràng, không phát sinh phí ẩn. Thông tin dịch vụ trình bày đầy đủ.',
              },
              {
                icon: <HeadphonesIcon className="w-6 h-6 text-[#06b6d4]" />,
                bg: 'bg-cyan-50',
                title: 'Hỗ trợ 24/7',
                desc: 'Đội ngũ CSKH trực tuyến liên tục qua Zalo, Telegram. Phản hồi nhanh nhất có thể.',
              },
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
                bg: 'bg-emerald-50',
                title: 'Bảo hành rõ ràng',
                desc: 'Mỗi dịch vụ có chính sách bảo hành cụ thể. Đổi mới nếu gặp sự cố trong thời hạn.',
              },
            ].map((b, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`p-3 rounded-xl ${b.bg} shrink-0`}>{b.icon}</div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3 – CATEGORY HIGHLIGHTS
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-16">
        <div className="container-custom space-y-10">
          <SectionHeader
            tag="Danh mục"
            title="Khám phá các nhóm dịch vụ"
            subtitle="Từ tài khoản cao cấp đến dịch vụ tương tác mạng xã hội – tất cả trong một cửa hàng."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                slug: 'kho-tai-khoan',
                icon: <Package className="w-7 h-7 text-[#0f4c81]" />,
                iconBg: 'bg-[#f0f7ff]',
                title: 'Kho tài khoản',
                desc: 'ChatGPT Plus, Canva Pro, YouTube Premium, Spotify và nhiều hơn nữa.',
                href: '/danh-muc/kho-tai-khoan',
                accent: 'border-[#0f4c81]/20 hover:border-[#0f4c81]/40',
              },
              {
                slug: 'dich-vu-tuong-tac',
                icon: <Users className="w-7 h-7 text-[#06b6d4]" />,
                iconBg: 'bg-cyan-50',
                title: 'Dịch vụ tương tác',
                desc: 'Tăng Follow, Like, View cho Facebook, TikTok, YouTube và Telegram.',
                href: '/danh-muc/dich-vu-tuong-tac',
                accent: 'border-cyan-200 hover:border-cyan-400',
              },
              {
                slug: 'cong-cu-so',
                icon: <Cpu className="w-7 h-7 text-amber-600" />,
                iconBg: 'bg-amber-50',
                title: 'Công cụ số',
                desc: 'VPS, Proxy, hosting tốc độ cao phục vụ nuôi nick và chạy tool.',
                href: '/danh-muc/cong-cu-so',
                accent: 'border-amber-200 hover:border-amber-400',
              },
              {
                slug: 'dich-vu-khac',
                icon: <LayoutGrid className="w-7 h-7 text-emerald-600" />,
                iconBg: 'bg-emerald-50',
                title: 'Dịch vụ khác',
                desc: 'Thiết kế website, tư vấn marketing và các giải pháp số theo yêu cầu.',
                href: '/danh-muc/dich-vu-khac',
                accent: 'border-emerald-200 hover:border-emerald-400',
              },
            ].map((cat) => {
              const categoryMatch = categories.find((c) => c.slug === cat.slug);
              const count = categoryMatch ? categoryMatch.count : 0;
              return (
              <Link key={cat.title} href={cat.href}>
                <div
                  className={`bg-white rounded-2xl border-2 p-6 flex flex-col gap-4 h-full cursor-pointer transition-all hover:shadow-md ${cat.accent}`}
                >
                  <div className={`w-14 h-14 rounded-xl ${cat.iconBg} flex items-center justify-center`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-900">{cat.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{count} dịch vụ</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </Link>
            )})}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4 – FEATURED SERVICES (6–8 cards)
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="container-custom space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <SectionHeader
              tag="Nổi bật"
              title={
                <>
                  Dịch vụ được{' '}
                  <span className="text-[#0f4c81]">đặt nhiều nhất</span>
                </>
              }
              subtitle="Danh sách các gói dịch vụ và tài khoản đang được đăng ký nhiều nhất hiện tại."
            />
            <Link href="/kho-tai-khoan" className="shrink-0">
              <Button variant="outline" size="sm" className="text-[#0f4c81] border-[#0f4c81]/30 hover:bg-[#f0f7ff] whitespace-nowrap">
                Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredServices.map((srv) => (
              <div
                key={srv.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Thumbnail Image */}
                <div className="relative w-full h-40 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100 flex items-center justify-center">
                  {srv.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={srv.thumbnailUrl} alt={srv.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-5xl ${srv.thumbnail?.bg || 'bg-slate-100'}`}>
                      {srv.thumbnail?.emoji || '📦'}
                    </div>
                  )}
                  {/* Category overlay */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider rounded backdrop-blur-sm truncate max-w-[80%]">
                    {productService.getCategories().find((category) => category.slug === srv.category)?.name || srv.category}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Title and Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 flex-1 group-hover:text-[#0f4c81] transition-colors">
                      {srv.name}
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 bg-[#f0f7ff] text-[#0f4c81]">
                      Nổi bật
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{srv.processingTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Còn hàng – Có thể đặt ngay</span>
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Từ</span>
                      <span className="text-base font-black text-[#0f4c81]">
                        {formatVND(srv.price)}
                      </span>
                    </div>
                    <Link href={`/dich-vu/${srv.slug}`}>
                      <Button variant="primary" size="sm" className="shrink-0 whitespace-nowrap">
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}
