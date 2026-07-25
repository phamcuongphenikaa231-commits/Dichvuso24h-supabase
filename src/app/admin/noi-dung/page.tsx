'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { contentService } from '@/services/contentService';
import { Banner, Announcement, FAQ, Policy, FooterContent } from '@/types/admin';
import { HomepageHeroEditor } from '@/components/admin/HomepageHeroEditor';

type Tab = 'hero' | 'banner' | 'announcement' | 'faq' | 'policy' | 'footer';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'hero', label: 'Hero trang chủ', icon: '✨' },
  { key: 'banner', label: 'Banner', icon: '🖼️' },
  { key: 'announcement', label: 'Thông báo', icon: '📢' },
  { key: 'faq', label: 'FAQ', icon: '❓' },
  { key: 'policy', label: 'Chính sách', icon: '📄' },
  { key: 'footer', label: 'Footer', icon: '🔗' },
];

// ─── Banner Tab ───────────────────────────────────────────────────────────────
function BannerTab() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState<Banner[]>(() => contentService.getBanners());
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Banner>>({});

  useEffect(() => {
    const unsub = contentService.subscribe(() => setBanners(contentService.getBanners()));
    return unsub;
  }, []);

  const handleToggle = (id: string, isActive: boolean) => {
    contentService.updateBanner(id, { isActive: !isActive });
    showToast('Đã cập nhật', `Banner ${!isActive ? 'đã bật' : 'đã tắt'}`, 'success');
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    contentService.updateBanner(editing, editData);
    setEditing(null);
    showToast('Đã lưu', 'Banner đã được cập nhật', 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{banners.length} banner</p>
        <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Demo: Thêm banner mới chưa hỗ trợ tải ảnh</div>
      </div>
      {banners.map(b => (
        <div key={b.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          {editing === b.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Tiêu đề</label>
                  <Input defaultValue={b.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Subtitle</label>
                  <Input defaultValue={b.subtitle} onChange={e => setEditData(d => ({ ...d, subtitle: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Link URL</label>
                  <Input defaultValue={b.linkUrl} onChange={e => setEditData(d => ({ ...d, linkUrl: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600 font-medium">Thứ tự</label>
                  <Input type="number" defaultValue={b.displayOrder} onChange={e => setEditData(d => ({ ...d, displayOrder: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}><Check className="w-3 h-3 mr-1" />Lưu</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Hủy</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <GripVertical className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                <div className="w-20 h-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-xl shrink-0">
                  🖼️
                </div>
                <div>
                  <div className="font-medium text-slate-800">{b.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{b.subtitle}</div>
                  <div className="text-xs text-brand-primary mt-1">{b.linkUrl}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={b.isActive ? 'success' : 'secondary'} size="sm">{b.isActive ? 'Bật' : 'Tắt'}</Badge>
                <button onClick={() => handleToggle(b.id, b.isActive)} className="text-slate-400 hover:text-slate-600">
                  {b.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(b.id); setEditData({}); }} className="text-slate-400 hover:text-brand-primary">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { contentService.deleteBanner(b.id); showToast('Đã xóa', 'Banner đã được xóa', 'success'); }} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Announcement Tab ─────────────────────────────────────────────────────────
function AnnouncementTab() {
  const { showToast } = useToast();
  const [items, setItems] = useState<Announcement[]>(() => contentService.getAnnouncements());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ content: '', type: 'info' as Announcement['type'], startDate: '', endDate: '' });

  useEffect(() => {
    const unsub = contentService.subscribe(() => setItems(contentService.getAnnouncements()));
    return unsub;
  }, []);

  const TYPE_COLORS: Record<Announcement['type'], string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  const handleCreate = () => {
    if (!form.content.trim()) return;
    contentService.addAnnouncement({ ...form, isActive: true });
    setForm({ content: '', type: 'info', startDate: '', endDate: '' });
    setShowForm(false);
    showToast('Đã tạo', 'Thông báo mới đã được tạo', 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{items.length} thông báo</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-3 h-3 mr-1" />Thêm</Button>
      </div>
      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
            rows={3}
            placeholder="Nội dung thông báo..."
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
          <div className="grid grid-cols-3 gap-3">
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Announcement['type'] }))}>
              <option value="info">Thông tin</option>
              <option value="warning">Cảnh báo</option>
              <option value="success">Thành công</option>
              <option value="danger">Nguy hiểm</option>
            </select>
            <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <input type="date" className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Tạo</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}
      {items.map(item => (
        <div key={item.id} className={`rounded-xl border p-4 flex items-start justify-between gap-3 ${TYPE_COLORS[item.type]}`}>
          <p className="text-sm flex-1">{item.content}</p>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">{item.isActive ? 'Hiển thị' : 'Ẩn'}</Badge>
            <button onClick={() => { contentService.updateAnnouncement(item.id, { isActive: !item.isActive }); showToast('Đã cập nhật', '', 'success'); }} className="opacity-60 hover:opacity-100">
              {item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={() => { contentService.deleteAnnouncement(item.id); showToast('Đã xóa', '', 'success'); }} className="opacity-60 hover:opacity-100 text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FAQ Tab ──────────────────────────────────────────────────────────────────
function FaqTab() {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>(() => contentService.getFaqs());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: '', answer: '', category: 'Chung' });

  useEffect(() => {
    const unsub = contentService.subscribe(() => setFaqs(contentService.getFaqs()));
    return unsub;
  }, []);

  const handleCreate = () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    contentService.addFaq({ ...form, displayOrder: faqs.length + 1, isActive: true });
    setForm({ question: '', answer: '', category: 'Chung' });
    setShowForm(false);
    showToast('Đã tạo', 'FAQ mới đã được thêm', 'success');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{faqs.length} câu hỏi</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-3 h-3 mr-1" />Thêm FAQ</Button>
      </div>
      {showForm && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Câu hỏi..." />
          <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Danh mục (VD: Thanh toán, Đơn hàng...)" />
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
            rows={4}
            placeholder="Câu trả lời..."
            value={form.answer}
            onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Lưu FAQ</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}
      {faqs.map(faq => (
        <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50"
            onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
          >
            <div>
              <div className="font-medium text-slate-800 text-sm">{faq.question}</div>
              <div className="text-xs text-slate-400 mt-0.5">{faq.category}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={faq.isActive ? 'success' : 'secondary'} size="sm">{faq.isActive ? 'Hiển thị' : 'Ẩn'}</Badge>
              <button
                className="text-red-400 hover:text-red-600 p-1"
                onClick={e => { e.stopPropagation(); contentService.deleteFaq(faq.id); showToast('Đã xóa', 'FAQ đã được xóa', 'success'); }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </button>
          {expanded === faq.id && (
            <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-3">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Policy Tab ───────────────────────────────────────────────────────────────
function PolicyTab() {
  const { showToast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>(() => contentService.getPolicies());
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const unsub = contentService.subscribe(() => setPolicies(contentService.getPolicies()));
    return unsub;
  }, []);

  const handleSave = (id: string) => {
    contentService.updatePolicy(id, { content: editContent });
    setEditing(null);
    showToast('Đã lưu', 'Chính sách đã được cập nhật', 'success');
  };

  return (
    <div className="space-y-3">
      {policies.map(p => (
        <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <div className="font-medium text-slate-800">{p.title}</div>
              <div className="text-xs text-slate-400">Cập nhật: {new Date(p.updatedAt).toLocaleDateString('vi-VN')}</div>
            </div>
            {editing === p.id ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleSave(p.id)}><Check className="w-3 h-3 mr-1" />Lưu</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Hủy</Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => { setEditing(p.id); setEditContent(p.content); }}>
                <Pencil className="w-3 h-3 mr-1" />Chỉnh sửa
              </Button>
            )}
          </div>
          {editing === p.id ? (
            <textarea
              className="w-full px-4 py-3 text-sm text-slate-700 outline-none resize-none font-mono min-h-[200px]"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
          ) : (
            <div className="px-4 py-3 text-sm text-slate-600 whitespace-pre-wrap line-clamp-3">{p.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Footer Tab ───────────────────────────────────────────────────────────────
function FooterTab() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FooterContent>(() => contentService.getFooter());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const unsub = contentService.subscribe(() => {
      setForm(contentService.getFooter());
      setIsDirty(false);
    });
    return unsub;
  }, []);

  const setField = (k: keyof Omit<FooterContent, 'quickLinks'>, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setIsDirty(true);
  };

  const handleSave = () => {
    contentService.updateFooter(form);
    setIsDirty(false);
    showToast('Đã lưu', 'Nội dung footer đã được cập nhật', 'success');
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tên công ty</label>
        <Input value={form.companyName} onChange={e => setField('companyName', e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
          rows={3}
          value={form.description}
          onChange={e => { setForm(f => ({ ...f, description: e.target.value })); setIsDirty(true); }}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Bản quyền</label>
        <Input value={form.copyright} onChange={e => setField('copyright', e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Liên kết nhanh</label>
        {form.quickLinks.map((link, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={link.label}
              onChange={e => {
                const updated = [...form.quickLinks];
                updated[i] = { ...updated[i], label: e.target.value };
                setForm(f => ({ ...f, quickLinks: updated }));
                setIsDirty(true);
              }}
              placeholder="Tên hiển thị"
              className="flex-1"
            />
            <Input
              value={link.url}
              onChange={e => {
                const updated = [...form.quickLinks];
                updated[i] = { ...updated[i], url: e.target.value };
                setForm(f => ({ ...f, quickLinks: updated }));
                setIsDirty(true);
              }}
              placeholder="/duong-dan"
              className="flex-1"
            />
            <button
              onClick={() => {
                setForm(f => ({ ...f, quickLinks: f.quickLinks.filter((_, j) => j !== i) }));
                setIsDirty(true);
              }}
              className="text-red-400 hover:text-red-600 px-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => { setForm(f => ({ ...f, quickLinks: [...f.quickLinks, { label: '', url: '' }] })); setIsDirty(true); }}
          className="text-brand-primary text-sm hover:underline flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />Thêm liên kết
        </button>
      </div>
      <Button onClick={handleSave} disabled={!isDirty}>
        <Check className="w-4 h-4 mr-2" />Lưu footer
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hero');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nội dung Website</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Quản lý banner, thông báo, FAQ, chính sách và thông tin tĩnh</p>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'hero' && <HomepageHeroEditor />}
          {activeTab === 'banner' && <BannerTab />}
          {activeTab === 'announcement' && <AnnouncementTab />}
          {activeTab === 'faq' && <FaqTab />}
          {activeTab === 'policy' && <PolicyTab />}
          {activeTab === 'footer' && <FooterTab />}
        </div>
      </div>
    </div>
  );
}
