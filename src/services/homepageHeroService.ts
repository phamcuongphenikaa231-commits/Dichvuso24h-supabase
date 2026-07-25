'use client';

import { createClient } from '@/lib/supabase/client';
import {
  DEFAULT_HOMEPAGE_HERO,
  HomepageHeroContent,
} from '@/types/site';

const SETTINGS_KEY = 'homepage_hero';
const BUCKET = 'site-assets';
const MAX_BACKGROUND_SIZE = 5 * 1024 * 1024;
const MAX_VISUAL_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

let cachedHero: HomepageHeroContent = DEFAULT_HOMEPAGE_HERO;
const listeners = new Set<() => void>();
let realtimeStarted = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureRealtimeSubscription() {
  if (realtimeStarted || typeof window === 'undefined') return;
  realtimeStarted = true;
  const supabase = createClient();
  supabase
    .channel('dv24h-homepage-hero-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'site_settings', filter: `key=eq.${SETTINGS_KEY}` },
      () => {
        void homepageHeroService.refresh();
      }
    )
    .subscribe();
}


function mergeHero(value?: Partial<HomepageHeroContent> | null): HomepageHeroContent {
  if (!value) return DEFAULT_HOMEPAGE_HERO;
  return {
    ...DEFAULT_HOMEPAGE_HERO,
    ...value,
    primaryButton: {
      ...DEFAULT_HOMEPAGE_HERO.primaryButton,
      ...(value.primaryButton || {}),
    },
    secondaryButton: {
      ...DEFAULT_HOMEPAGE_HERO.secondaryButton,
      ...(value.secondaryButton || {}),
    },
    benefits: Array.isArray(value.benefits)
      ? value.benefits.slice(0, 4)
      : DEFAULT_HOMEPAGE_HERO.benefits,
    visual: {
      ...DEFAULT_HOMEPAGE_HERO.visual,
      ...(value.visual || {}),
    },
    background: {
      ...DEFAULT_HOMEPAGE_HERO.background,
      ...(value.background || {}),
    },
  };
}

function validateFile(file: File, kind: 'background' | 'visual') {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Chỉ chấp nhận ảnh JPG, PNG hoặc WebP.');
  }
  const maxSize = kind === 'background' ? MAX_BACKGROUND_SIZE : MAX_VISUAL_SIZE;
  if (file.size > maxSize) {
    throw new Error(
      kind === 'background'
        ? 'Ảnh nền không được vượt quá 5 MB.'
        : 'Ảnh minh họa không được vượt quá 3 MB.'
    );
  }
}

function extensionFor(file: File) {
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

async function uploadAsset(file: File, kind: 'background' | 'visual') {
  validateFile(file, kind);
  const supabase = createClient();
  const path = `homepage/hero/${kind}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Không thể tải ảnh lên: ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function removeAsset(path?: string) {
  if (!path) return;
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export const homepageHeroService = {
  getCached(): HomepageHeroContent {
    return cachedHero;
  },

  async refresh(): Promise<HomepageHeroContent> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      console.error('Không thể tải Hero từ Supabase:', error.message);
      return cachedHero;
    }

    cachedHero = mergeHero((data?.value || null) as Partial<HomepageHeroContent> | null);
    notify();
    return cachedHero;
  },

  async save(
    content: HomepageHeroContent,
    files?: { background?: File | null; visual?: File | null }
  ): Promise<HomepageHeroContent> {
    const supabase = createClient();
    const previous = cachedHero;
    const uploadedPaths: string[] = [];
    let next = mergeHero(content);

    try {
      if (files?.background) {
        const uploaded = await uploadAsset(files.background, 'background');
        uploadedPaths.push(uploaded.path);
        next = {
          ...next,
          background: { ...next.background, ...uploaded },
        };
      }

      if (files?.visual) {
        const uploaded = await uploadAsset(files.visual, 'visual');
        uploadedPaths.push(uploaded.path);
        next = {
          ...next,
          visual: { ...next.visual, ...uploaded },
        };
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from('site_settings').upsert(
        {
          key: SETTINGS_KEY,
          value: next,
          is_public: true,
          updated_by: user?.id || null,
        },
        { onConflict: 'key' }
      );

      if (error) throw new Error(`Không thể lưu Hero: ${error.message}`);

      cachedHero = next;
      notify();

      if (files?.background && previous.background.path && previous.background.path !== next.background.path) {
        await removeAsset(previous.background.path);
      }
      if (files?.visual && previous.visual.path && previous.visual.path !== next.visual.path) {
        await removeAsset(previous.visual.path);
      }

      return cachedHero;
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from(BUCKET).remove(uploadedPaths);
      }
      throw error;
    }
  },

  async clearAsset(kind: 'background' | 'visual'): Promise<HomepageHeroContent> {
    const previousPath = cachedHero[kind].path;
    const next: HomepageHeroContent =
      kind === 'background'
        ? {
            ...cachedHero,
            background: {
              ...cachedHero.background,
              url: '',
              path: '',
            },
          }
        : {
            ...cachedHero,
            visual: {
              ...cachedHero.visual,
              url: '',
              path: '',
            },
          };

    const saved = await this.save(next);
    await removeAsset(previousPath);
    return saved;
  },

  async restoreDefault(): Promise<HomepageHeroContent> {
    const previous = cachedHero;
    const saved = await this.save(DEFAULT_HOMEPAGE_HERO);
    await Promise.all([removeAsset(previous.background.path), removeAsset(previous.visual.path)]);
    return saved;
  },

  subscribe(listener: () => void): () => void {
    ensureRealtimeSubscription();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
