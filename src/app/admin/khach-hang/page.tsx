'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, Lock, Unlock, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { customerService, CustomerSummary } from '@/services/customerService';
import { removeAccents } from '@/utils/filterServices';

const PAGE_SIZE = 10;
const STATUS_META = {
  active: { label: 'Hoạt động', badge: 'success' as const },
  locked: { label: 'Đã khóa', badge: 'danger' as const },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'locked' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const refresh = async () => {
      const data = await customerService.getCustomers();
      setCustomers(data);
    };
    refresh();
    return customerService.subscribe(refresh);
  }, []);

  const filtered = useMemo(() => {
    let result = [...customers];
    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase().trim());
      result = result.filter((customer) =>
        removeAccents((customer.fullName || customer.username).toLowerCase()).includes(q) ||
        removeAccents(customer.username.toLowerCase()).includes(q) ||
        customer.phone.includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((customer) => customer.status === statusFilter);
    return result;
  }, [customers, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleToggleLock = async (customer: CustomerSummary) => {
    const nextStatus = customer.status === 'locked' ? 'active' : 'locked';
    const action = nextStatus === 'locked' ? 'khóa' : 'mở khóa';
    if (!confirm(`Bạn có chắc muốn ${action} tài khoản "${customer.username}"?`)) return;
    const result = await customerService.setStatus(customer.id, nextStatus);
    showToast(result.success ? 'Thành công' : 'Không thể cập nhật', result.message, result.success ? 'success' : 'error');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khách hàng</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Tổng <strong>{customers.length}</strong> tài khoản · Hiển thị <strong>{filtered.length}</strong> kết quả</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
          <UserPlus className="w-4 h-4" /> Tài khoản được tạo từ luồng đăng ký
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input placeholder="Tên, username, số điện thoại..." className="pl-9" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setCurrentPage(1); }} />
          </div>
          <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value as typeof statusFilter); setCurrentPage(1); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="locked">Đã khóa</option>
          </select>
          <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCurrentPage(1); }} className="text-sm text-brand-primary hover:underline whitespace-nowrap">Xóa bộ lọc</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Tài khoản</th><th className="px-4 py-3">Số điện thoại</th><th className="px-4 py-3 text-center">Số đơn</th><th className="px-4 py-3 text-right">Tổng chi tiêu</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày tham gia</th><th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((customer) => {
                const statusMeta = STATUS_META[customer.status];
                return (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">{(customer.fullName || customer.username)[0]}</div><div><div className="font-medium text-slate-800 text-xs">{customer.fullName || customer.username}</div><div className="text-slate-400 text-xs">@{customer.username}</div></div></div></td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{customer.phoneMasked}</td>
                    <td className="px-4 py-3 text-center font-semibold">{customer.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-semibold">{customer.totalSpent.toLocaleString('vi-VN')}₫</td>
                    <td className="px-4 py-3"><Badge variant={statusMeta.badge}>{statusMeta.label}</Badge></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(customer.createdAt)}</td>
                    <td className="px-4 py-3"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="sm" className="px-2" onClick={() => router.push(`/admin/khach-hang/${customer.id}`)} title="Xem chi tiết"><Eye className="w-4 h-4 text-slate-500" /></Button><Button variant="ghost" size="sm" className={`px-2 ${customer.status === 'locked' ? 'text-green-600' : 'text-red-500'}`} onClick={() => handleToggleLock(customer)} title={customer.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}>{customer.status === 'locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</Button></div></td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400"><div className="text-4xl mb-3">👥</div><p className="font-medium">Không tìm thấy khách hàng nào</p></td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} kết quả</span>
          <div className="flex gap-2"><Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)}><ChevronLeft className="w-4 h-4" /></Button><Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => page + 1)}><ChevronRight className="w-4 h-4" /></Button></div>
        </div>
      </div>
    </div>
  );
}
