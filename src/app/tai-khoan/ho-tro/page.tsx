'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { orderService } from '@/services/orderService';
import { supportService, TICKET_STATUS_MAP } from '@/services/supportService';
import { Order } from '@/types/order';
import { SupportTicket } from '@/types/admin';
import { useAuth } from '@/context/AuthContext';

const TOPIC_LABELS: Record<string, string> = {
  warranty: 'Bảo hành / Lỗi',
  guide: 'Hướng dẫn sử dụng',
  payment: 'Sự cố thanh toán',
  other: 'Khác',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function AccountSupportPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [replyByTicket, setReplyByTicket] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({ topic: 'guide', orderId: '', subject: '', content: '' });

  useEffect(() => {
    if (!user) return;
    const refreshOrders = () => setOrders(orderService.getOrdersByUser(user.id));
    const refreshTickets = () => setTickets(supportService.getTicketsByCustomer(user.id));
    orderService.refreshOrdersByUser(user.id).catch(console.error);
    refreshTickets();
    const unsubscribeOrders = orderService.subscribe(refreshOrders);
    const unsubscribeTickets = supportService.subscribe(refreshTickets);
    return () => { unsubscribeOrders(); unsubscribeTickets(); };
  }, [user]);

  const handleReply = (ticket: SupportTicket) => {
    if (!user) return;
    const content = (replyByTicket[ticket.id] || '').trim();
    if (!content) return;
    supportService.addMessage(ticket.id, {
      senderType: 'customer',
      senderName: user.fullName || user.username,
      content,
      isInternal: false,
    });
    setReplyByTicket((current) => ({ ...current, [ticket.id]: '' }));
    showToast('Đã gửi phản hồi', 'Nội dung của bạn đã được thêm vào phiếu hỗ trợ.', 'success');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const relatedOrder = orders.find((order) => order.orderCode === formData.orderId);
    const ticket = supportService.createTicket({
      customerId: user.id,
      customerName: user.fullName || user.username,
      customerUsername: user.username,
      subject: formData.subject.trim(),
      content: formData.content.trim(),
      topic: formData.topic,
      relatedOrderId: relatedOrder?.orderCode,
      relatedOrderService: relatedOrder?.serviceName,
    });
    setIsModalOpen(false);
    setFormData({ topic: 'guide', orderId: '', subject: '', content: '' });
    showToast('Gửi yêu cầu thành công', `Phiếu hỗ trợ ${ticket.id} đã được gửi.`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Yêu cầu hỗ trợ</h1><p className="text-gray-500 mt-1">Gửi thắc mắc hoặc yêu cầu bảo hành cho chúng tôi</p></div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" />Tạo phiếu hỗ trợ</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {tickets.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const isExpanded = expandedTicketId === ticket.id;
              const statusMeta = TICKET_STATUS_MAP[ticket.status];
              const publicMessages = ticket.messages.filter((message) => !message.isInternal);
              const topic = ticket.tags[0] || 'other';
              return (
                <div key={ticket.id} className="transition-colors hover:bg-gray-50">
                  <button type="button" className="w-full p-5 text-left flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center" onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}>
                    <div className="flex gap-4 items-start w-full">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ticket.status === 'open' || ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-600' : ticket.status === 'waiting' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {ticket.status === 'open' || ticket.status === 'in_progress' ? <Clock className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1"><span className="font-semibold text-gray-900 truncate">{ticket.subject}</span><Badge variant={statusMeta.badge}>{statusMeta.label}</Badge></div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500"><span>{ticket.id}</span><span>•</span><span>{TOPIC_LABELS[topic] || topic}</span>{ticket.relatedOrderId && <><span>•</span><span>Đơn: <Link href={`/tai-khoan/don-hang/${ticket.relatedOrderId}`} className="text-brand-primary hover:underline" onClick={(e) => e.stopPropagation()}>{ticket.relatedOrderId}</Link></span></>}<span>•</span><span>{formatDate(ticket.createdAt)}</span></div>
                      </div>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="p-5 bg-gray-50/50 border-t border-gray-100 text-sm space-y-3">
                      {publicMessages.map((message) => (
                        <div key={message.id}>
                          <p className={`font-semibold mb-1 ${message.senderType === 'admin' ? 'text-brand-primary' : 'text-gray-700'}`}>
                            {message.senderType === 'admin' ? <><CheckCircle2 className="w-4 h-4 inline mr-1" />Hỗ trợ viên:</> : 'Bạn viết:'}
                          </p>
                          <div className={`p-3 rounded-lg whitespace-pre-wrap ${message.senderType === 'admin' ? 'bg-blue-50 border border-blue-100 text-gray-800' : 'bg-white border border-gray-200 text-gray-700'}`}>{message.content}</div>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(message.createdAt)}</p>
                        </div>
                      ))}
                      {(ticket.status === 'open' || ticket.status === 'in_progress') && <p className="text-gray-500 italic flex items-center gap-1"><Clock className="w-4 h-4" /> Chúng tôi đang kiểm tra và sẽ phản hồi sớm nhất.</p>}
                      {!['resolved', 'closed'].includes(ticket.status) && (
                        <div className="pt-2 space-y-2">
                          <Textarea
                            label="Phản hồi thêm"
                            rows={3}
                            value={replyByTicket[ticket.id] || ''}
                            onChange={(event) => setReplyByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                            placeholder="Nhập thông tin bổ sung cho bộ phận hỗ trợ..."
                          />
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              size="sm"
                              disabled={!(replyByTicket[ticket.id] || '').trim()}
                              onClick={() => handleReply(ticket)}
                            >
                              Gửi phản hồi
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-4 text-center flex flex-col items-center"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><LifeBuoy className="w-8 h-8 text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-900 mb-1">Chưa có yêu cầu hỗ trợ nào</h3><p className="text-gray-500 max-w-sm mb-6">Khi gặp vấn đề, hãy tạo phiếu để admin theo dõi và phản hồi.</p><Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Tạo phiếu hỗ trợ</Button></div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo phiếu hỗ trợ mới">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề hỗ trợ <span className="text-red-500">*</span></label><select required className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none" value={formData.topic} onChange={(event) => setFormData({ ...formData, topic: event.target.value })}><option value="guide">Hướng dẫn sử dụng</option><option value="warranty">Yêu cầu bảo hành / Lỗi</option><option value="payment">Sự cố thanh toán</option><option value="other">Khác</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng liên quan (không bắt buộc)</label><select className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none" value={formData.orderId} onChange={(event) => setFormData({ ...formData, orderId: event.target.value })}><option value="">-- Không chọn đơn hàng --</option>{orders.map((order) => <option key={order.id} value={order.orderCode}>{order.orderCode} — {order.serviceName}</option>)}</select></div>
          <Input label="Tiêu đề" required value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} placeholder="Mô tả ngắn vấn đề" />
          <Textarea label="Nội dung" required rows={5} value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} placeholder="Mô tả chi tiết vấn đề bạn đang gặp..." />
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button><Button type="submit" disabled={!formData.subject.trim() || !formData.content.trim()}>Gửi yêu cầu</Button></div>
        </form>
      </Modal>
    </div>
  );
}
