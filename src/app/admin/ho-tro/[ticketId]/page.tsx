'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { supportService, TICKET_PRIORITY_MAP, TICKET_STATUS_MAP, SUPPORT_STAFF } from '@/services/supportService';
import { SupportTicket, TicketStatus } from '@/types/admin';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function AdminTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | undefined>(() => supportService.getById(ticketId));
  const [replyContent, setReplyContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [assignee, setAssignee] = useState(ticket?.assignedTo || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = supportService.subscribe(() => {
      const t = supportService.getById(ticketId);
      setTicket(t);
      if (t) setAssignee(t.assignedTo || '');
    });
    return unsub;
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate-700">Không tìm thấy ticket</h2>
        <Button className="mt-4" onClick={() => router.push('/admin/ho-tro')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  const priorityMeta = TICKET_PRIORITY_MAP[ticket.priority];
  const statusMeta = TICKET_STATUS_MAP[ticket.status];
  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved';

  const handleSendReply = () => {
    if (!replyContent.trim()) return;
    supportService.addMessage(ticket.id, {
      senderType: 'admin',
      senderName: assignee || 'admin24h',
      content: replyContent.trim(),
      isInternal,
    });
    setReplyContent('');
    showToast('Đã gửi', isInternal ? 'Ghi chú nội bộ đã thêm' : 'Phản hồi đã gửi', 'success');
  };

  const handleAssign = () => {
    if (!assignee) return;
    supportService.assign(ticket.id, assignee);
    showToast('Phân công', `Đã phân công cho ${assignee}`, 'success');
  };

  const handleToggleStatus = () => {
    const newStatus: TicketStatus = isClosed ? 'open' : 'closed';
    supportService.setStatus(ticket.id, newStatus);
    showToast('Cập nhật', `Ticket đã được ${isClosed ? 'mở lại' : 'đóng'}`, 'success');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Back */}
      <button onClick={() => router.push('/admin/ho-tro')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-brand-primary font-bold">{ticket.id}</span>
              <Badge variant={priorityMeta.badge} size="sm">{priorityMeta.label}</Badge>
              <Badge variant={statusMeta.badge} size="sm">{statusMeta.label}</Badge>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{ticket.subject}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Khách: <strong>{ticket.customerName}</strong> (@{ticket.customerUsername})
              {ticket.relatedOrderId && (
                <span className="ml-2">· Đơn: <strong className="text-brand-primary">{ticket.relatedOrderId}</strong></span>
              )}
            </p>
          </div>
          <div className="flex gap-2 items-start shrink-0">
            <Button
              variant={isClosed ? 'primary' : 'outline'}
              size="sm"
              className={!isClosed ? 'border-red-300 text-red-600 hover:bg-red-50' : ''}
              onClick={handleToggleStatus}
            >
              {isClosed ? 'Mở lại ticket' : 'Đóng ticket'}
            </Button>
          </div>
        </div>

        {/* Assign */}
        <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-100">
          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-sm text-slate-600 shrink-0">Phụ trách:</label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none flex-1 max-w-xs"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
          >
            <option value="">-- Chưa phân công --</option>
            {SUPPORT_STAFF.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={handleAssign} disabled={!assignee}>Lưu</Button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-sm">Hội thoại ({ticket.messages.filter(m => !m.isInternal).length} tin)</h2>
        </div>
        <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
          {ticket.messages.map(msg => {
            const isAdmin = msg.senderType === 'admin';
            const isSystem = msg.senderType === 'system';
            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    🤖 {msg.content}
                  </span>
                </div>
              );
            }
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.isInternal ? 'opacity-70' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${
                    isAdmin
                      ? msg.isInternal
                        ? 'bg-amber-50 border border-amber-200 text-amber-900'
                        : 'bg-brand-primary text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {msg.isInternal && <div className="text-xs font-medium mb-1 opacity-70">🔒 Ghi chú nội bộ</div>}
                    {msg.content}
                  </div>
                  <div className={`text-xs text-slate-400 mt-1 ${isAdmin ? 'text-right' : ''}`}>
                    {msg.senderName} · {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {!isClosed && (
          <div className="p-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300"
                  checked={isInternal}
                  onChange={e => setIsInternal(e.target.checked)}
                />
                <span className="text-slate-600">Ghi chú nội bộ (ẩn với khách)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <textarea
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                rows={3}
                placeholder={isInternal ? 'Nhập ghi chú nội bộ...' : 'Nhập phản hồi cho khách...'}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
                }}
              />
              <Button onClick={handleSendReply} disabled={!replyContent.trim()} className="self-end">
                <Send className="w-4 h-4 mr-2" />Gửi
              </Button>
            </div>
            <p className="text-xs text-slate-400">Ctrl+Enter để gửi nhanh</p>
          </div>
        )}
        {isClosed && (
          <div className="p-4 border-t border-slate-100 text-center text-sm text-slate-400">
            Ticket đã đóng. Mở lại để tiếp tục hội thoại.
          </div>
        )}
      </div>
    </div>
  );
}
