'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { activityLogService, ACTION_LABELS } from '@/services/activityLogService';
import { ActivityLog, LogAction } from '@/types/admin';
import { removeAccents } from '@/utils/filterServices';

const PAGE_SIZE = 15;

const ACTION_BADGE: Record<LogAction, 'primary' | 'danger' | 'warning' | 'success' | 'secondary' | 'outline'> = {
  create: 'success',
  update: 'primary',
  delete: 'danger',
  lock: 'warning',
  unlock: 'success',
  approve: 'success',
  reject: 'danger',
  assign: 'cyan' as 'primary',
  export: 'outline',
  login: 'secondary',
  logout: 'secondary',
  refund: 'warning',
  close: 'secondary',
  open: 'success',
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  order: '📦 Đơn hàng',
  customer: '👤 Khách hàng',
  ticket: '🎧 Ticket',
  coupon: '🏷️ Mã giảm giá',
  settings: '⚙️ Cài đặt',
  content: '📄 Nội dung',
  system: '🖥️ Hệ thống',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export default function AdminLogsPage() {
  const [allLogs, setAllLogs] = useState<ActivityLog[]>(() => activityLogService.getLogs());

  useEffect(() => activityLogService.subscribe(() => setAllLogs(activityLogService.getLogs())), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<LogAction | 'all'>('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueActors = [...new Set(allLogs.map(l => l.actor))];

  const filtered = useMemo(() => {
    let result: ActivityLog[] = [...allLogs];
    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase().trim());
      result = result.filter(l =>
        removeAccents(l.actor.toLowerCase()).includes(q) ||
        removeAccents(l.target.toLowerCase()).includes(q) ||
        removeAccents(l.detail.toLowerCase()).includes(q)
      );
    }
    if (actionFilter !== 'all') result = result.filter(l => l.action === actionFilter);
    if (actorFilter !== 'all') result = result.filter(l => l.actor === actorFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allLogs, searchQuery, actionFilter, actorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nhật ký Hoạt động</h1>
        <p className="text-gray-500 mt-0.5 text-sm">
          Tổng <strong>{allLogs.length}</strong> bản ghi · Hiển thị <strong>{filtered.length}</strong> kết quả
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Người thực hiện, đối tượng, chi tiết..."
              className="pl-9"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={actorFilter}
            onChange={e => { setActorFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">Tất cả người dùng</option>
            {uniqueActors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value as LogAction | 'all'); setCurrentPage(1); }}
          >
            <option value="all">Tất cả hành động</option>
            {(Object.entries(ACTION_LABELS) as [LogAction, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button
            onClick={() => { setSearchQuery(''); setActionFilter('all'); setActorFilter('all'); setCurrentPage(1); }}
            className="text-sm text-brand-primary hover:underline whitespace-nowrap flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />Xóa lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Người thực hiện</th>
                <th className="px-4 py-3">Hành động</th>
                <th className="px-4 py-3">Đối tượng</th>
                <th className="px-4 py-3">Chi tiết</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(log => {
                const badge = ACTION_BADGE[log.action] || 'secondary';
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          log.actorRole === 'system' ? 'bg-slate-200 text-slate-600' : 'bg-brand-primary/10 text-brand-primary'
                        }`}>
                          {log.actorRole === 'system' ? '🤖' : log.actor[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-slate-700">{log.actor}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge as Parameters<typeof Badge>[0]['variant']} size="sm">
                        {ACTION_LABELS[log.action]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-500">{TARGET_TYPE_LABELS[log.targetType] || log.targetType}</div>
                      <div className="font-mono text-xs text-brand-primary">{log.target}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[250px]">
                      <div className="text-xs text-slate-600 truncate" title={log.detail}>{log.detail}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.ipAddress}</td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-medium">Không tìm thấy bản ghi nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} bản ghi</span>
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
