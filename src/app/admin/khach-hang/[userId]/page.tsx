'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Unlock, MessageSquare, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { customerService, CustomerSummary } from '@/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { Order, ORDER_STATUS_MAP } from '@/types/order';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { user: adminUser } = useAuth();
  const userId = params.userId as string;
  const [customer, setCustomer] = useState<CustomerSummary>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  useEffect(() => {
    const refresh = async () => {
      const data = await customerService.getById(userId);
      setCustomer(data);
      setOrders(customerService.getOrders(userId));
    };
    refresh();
    return customerService.subscribe(refresh);
  }, [userId]);

  if (!customer) {
    return <div className="text-center py-20"><div className="text-5xl mb-4">🔍</div><h2 className="text-xl font-bold text-slate-700">Không tìm thấy khách hàng</h2><Button className="mt-4" onClick={() => router.push('/admin/khach-hang')}><ArrowLeft className="w-4 h-4 mr-2" /> Quay lại</Button></div>;
  }

  const statusMeta = customer.status === 'locked' ? { label: 'Đã khóa', badge: 'danger' as const } : { label: 'Hoạt động', badge: 'success' as const };

  const handleToggleLock = async () => {
    const nextStatus = customer.status === 'locked' ? 'active' : 'locked';
    const action = nextStatus === 'locked' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${customer.username}"?`)) return;
    const result = await customerService.setStatus(customer.id, nextStatus);
    showToast(result.success ? 'Thành công' : 'Không thể cập nhật', result.message, result.success ? 'success' : 'error');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const result = await customerService.addNote(customer.id, newNote.trim(), adminUser?.fullName || adminUser?.username || 'Quản trị viên');
    if (!result.success) { showToast('Lỗi', result.message, 'error'); return; }
    setNewNote(''); setIsAddingNote(false); showToast('Đã lưu', result.message, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button onClick={() => router.push('/admin/khach-hang')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft className="w-4 h-4" /> Quay lại danh sách</button>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">{(customer.fullName || customer.username)[0]}</div><div><div className="flex items-center gap-2 flex-wrap"><h1 className="text-xl font-bold text-slate-900">{customer.fullName || customer.username}</h1><Badge variant={statusMeta.badge}>{statusMeta.label}</Badge></div><p className="text-sm text-slate-500 mt-0.5">@{customer.username}</p><p className="text-sm text-slate-500">📞 {customer.phoneMasked}</p></div></div>
          <Button variant={customer.status === 'locked' ? 'primary' : 'outline'} className={customer.status !== 'locked' ? 'border-red-300 text-red-600 hover:bg-red-50' : ''} onClick={handleToggleLock}>{customer.status === 'locked' ? <><Unlock className="w-4 h-4 mr-2" />Mở khóa tài khoản</> : <><Lock className="w-4 h-4 mr-2" />Khóa tài khoản</>}</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">{[{ label: 'Tổng đơn hàng', value: customer.totalOrders.toString() }, { label: 'Tổng chi tiêu', value: customer.totalSpent.toLocaleString('vi-VN') + '₫' }, { label: 'Ngày tham gia', value: new Date(customer.createdAt).toLocaleDateString('vi-VN') }, { label: 'Hoạt động gần nhất', value: new Date(customer.lastActiveAt).toLocaleDateString('vi-VN') }].map((item) => <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-center"><div className="text-lg font-bold text-slate-900">{item.value}</div><div className="text-xs text-slate-500 mt-0.5">{item.label}</div></div>)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2"><h2 className="font-bold text-slate-900">Lịch sử đơn hàng</h2><span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{orders.length}</span></div>
          <div className="divide-y divide-slate-100">{orders.map((order) => <button key={order.id} onClick={() => router.push(`/admin/don-hang/${encodeURIComponent(order.orderCode)}`)} className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50"><div><div className="text-xs font-mono text-brand-primary font-semibold">{order.orderCode}</div><div className="text-sm text-slate-700 mt-0.5">{order.serviceName}</div><div className="text-xs text-slate-400">{formatDate(order.createdAt)}</div></div><div className="text-right shrink-0"><div className="font-semibold text-slate-900 text-sm">{order.totalAmount.toLocaleString('vi-VN')}₫</div><Badge variant={ORDER_STATUS_MAP[order.orderStatus].badgeVariant} size="sm">{ORDER_STATUS_MAP[order.orderStatus].label}</Badge></div></button>)}{orders.length === 0 && <p className="text-center text-slate-400 text-sm py-10">Khách hàng chưa có đơn hàng.</p>}</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-slate-400" /><h2 className="font-bold text-slate-900">Ghi chú nội bộ</h2></div><button className="text-xs text-brand-primary hover:underline" onClick={() => setIsAddingNote(!isAddingNote)}>+ Thêm</button></div>
          {isAddingNote && <div className="p-4 border-b border-slate-100 space-y-2"><textarea className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none resize-none" rows={3} placeholder="Nhập ghi chú nội bộ..." value={newNote} onChange={(event) => setNewNote(event.target.value)} /><div className="flex gap-2"><Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}><Send className="w-3 h-3 mr-1.5" />Lưu</Button><Button size="sm" variant="ghost" onClick={() => { setIsAddingNote(false); setNewNote(''); }}>Hủy</Button></div></div>}
          <div className="divide-y divide-slate-100">{customer.notes.length === 0 && <p className="text-center text-slate-400 text-sm py-8">Chưa có ghi chú</p>}{customer.notes.map((note) => <div key={note.id} className="px-4 py-3"><div className="flex items-start justify-between gap-2"><p className="text-sm text-slate-700">{note.content}</p><button onClick={() => customerService.deleteNote(customer.id, note.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div><p className="text-xs text-slate-400 mt-1">{note.authorName} · {formatDate(note.createdAt)}</p></div>)}</div>
        </div>
      </div>
    </div>
  );
}
