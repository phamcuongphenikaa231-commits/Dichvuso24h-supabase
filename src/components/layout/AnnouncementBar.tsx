'use client';

import React, { useEffect, useState } from 'react';
import { contentService } from '@/services/contentService';
import { Announcement } from '@/types/admin';
import { Volume2, X } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const refresh = () => setAnnouncements(contentService.getActiveAnnouncements());
    refresh();
    return contentService.subscribe(refresh);
  }, []);

  if (!isVisible || announcements.length === 0) return null;

  return (
    <div className="bg-[#0f4c81] text-white text-xs py-2 px-4 border-b border-[#1b5d98]">
      <div className="container-custom flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-300 shrink-0"><Volume2 className="w-3.5 h-3.5" /></span>
          <span className="truncate font-medium">{announcements[0].content}</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-white/70 hover:text-white transition-colors p-0.5 shrink-0" aria-label="Đóng thông báo"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
};
