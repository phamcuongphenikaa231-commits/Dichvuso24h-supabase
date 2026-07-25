'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Eye, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { supportService, TICKET_PRIORITY_MAP, TICKET_STATUS_MAP, SUPPORT_STAFF } from '@/services/supportService';
import { SupportTicket, TicketStatus, TicketPriority } from '@/types/admin';
import { removeAccents } from '@/utils/filterServices';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminSupportPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>(() => supportService.getTickets());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = supportService.subscribe(() => setTickets(supportService.getTickets()));
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let result = [...tickets];
    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase().trim());
      result = result.filter(t =>
        removeAccents(t.subject.toLowerCase()).includes(q) ||
        removeAccents(t.customerName.toLowerCase()).includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') result = result.filter(t => t.priority === priorityFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAssign = (ticketId: string, assignee: string) => {
    supportService.assign(ticketId, assignee);
    setAssigningId(null);
    showToast('Phân công thành công', `Ticket đã được giao cho ${assignee}`, 'success');
  };

  const handleToggleStatus = (ticket: SupportTicket) => {
    const isClosed = ticket.status === 'closed';
    const newStatus: TicketStatus = isClosed ? 'open' : 'closed';
    supportService.setStatus(ticket.id, newStatus);
    showToast('Cập nhật', `Ticket đã được ${isClosed ? 'mở lại' : 'đóng'}`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hỗ trợ & Ticket</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Tổng <strong>{tickets.length}</strong> ticket · <strong>{tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length}</strong> đang mở
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Mã ticket, chủ đề, khách hàng..."
              className="pl-9"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as TicketStatus | 'all'); setCurrentPage(1); }}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(TICKET_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={priorityFilter}
            onChange={e => { setPriorityFilter(e.target.value as TicketPriority | 'all'); setCurrentPage(1); }}
          >
            <option value="all">Tất cả ưu tiên</option>
            {Object.entries(TICKET_PRIORITY_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Mã / Chủ đề</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ưu tiên</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Đơn liên quan</th>
                <th className="px-4 py-3">Phụ trách</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(ticket => {
                const priorityMeta = TICKET_PRIORITY_MAP[ticket.priority];
                const statusMeta = TICKET_STATUS_MAP[ticket.status];
                return (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-brand-primary font-semibold">{ticket.id}</div>
                      <div className="text-xs text-slate-700 max-w-[180px] truncate mt-0.5">{ticket.subject}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-800">{ticket.customerName}</div>
                      <div className="text-xs text-slate-400">@{ticket.customerUsername}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={priorityMeta.badge} size="sm">{priorityMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMeta.badge} size="sm">{statusMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {ticket.relatedOrderId ? (
                        <div>
                          <div className="font-mono text-brand-primary">{ticket.relatedOrderId}</div>
                          <div className="text-slate-400 max-w-[120px] truncate">{ticket.relatedOrderService}</div>
                        </div>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {assigningId === ticket.id ? (
                        <select
                          className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                          defaultValue={ticket.assignedTo || ''}
                          onChange={e => e.target.value && handleAssign(ticket.id, e.target.value)}
                          onBlur={() => setAssigningId(null)}
                          autoFocus
                        >
                          <option value="">-- Chọn --</option>
                          {SUPPORT_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      ) : (
                        <button
                          className="text-xs text-slate-500 hover:text-brand-primary flex items-center gap-1"
                          onClick={() => setAssigningId(ticket.id)}
                        >
                          <UserCheck className="w-3 h-3" />
                          {ticket.assignedTo || <span className="text-slate-300">Chưa phân công</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(ticket.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2"
                          onClick={() => router.push(`/admin/ho-tro/${ticket.id}`)}
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 text-xs ${ticket.status === 'closed' ? 'text-green-600' : 'text-red-500'}`}
                          onClick={() => handleToggleStatus(ticket)}
                        >
                          {ticket.status === 'closed' ? 'Mở lại' : 'Đóng'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🎧</div>
                    <p className="font-medium">Không tìm thấy ticket nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} kết quả</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
