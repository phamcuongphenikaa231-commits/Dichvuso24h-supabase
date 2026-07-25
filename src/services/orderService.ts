'use client';

import { createClient } from '@/lib/supabase/client';
import {
  CustomerInput,
  DeliveryChannel,
  Order,
  OrderStatus,
  OrderStatusHistory,
  PaymentStatus,
  PurchaseFlowType,
} from '@/types/order';

interface RawOrderRow {
  id: string;
  order_code: string;
  user_id: string;
  service_id: string | null;
  service_name: string;
  service_category_slug: string;
  service_thumbnail_emoji: string;
  service_thumbnail_bg: string;
  purchase_flow_type: PurchaseFlowType;
  quantity: number;
  unit: string;
  unit_price: number | string;
  total_amount: number | string;
  customer_input: CustomerInput | null;
  delivery_channel: DeliveryChannel;
  delivery_value: string | null;
  payment_content: string;
  payment_status: PaymentStatus;
  customer_reported_paid_at: string | null;
  payment_verified_at: string | null;
  order_status: OrderStatus;
  processing_started_at: string | null;
  completed_at: string | null;
  admin_note: string | null;
  public_note: string | null;
  created_at: string;
  updated_at: string;
}

interface RawHistoryRow {
  id: string;
  order_id: string;
  previous_order_status: OrderStatus | null;
  new_order_status: OrderStatus;
  previous_payment_status: PaymentStatus | null;
  new_payment_status: PaymentStatus;
  action: string;
  note: string | null;
  actor_type: 'customer' | 'admin' | 'system';
  actor_id: string | null;
  actor_name: string;
  created_at: string;
}

interface RawProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
}

export interface CreateOrderParams {
  userId: string;
  userName: string;
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  serviceCategory: string;
  serviceThumbnailEmoji: string;
  serviceThumbnailBg: string;
  purchaseFlowType: PurchaseFlowType;
  quantity: number;
  unit: string;
  unitPrice: number;
  customerInput: CustomerInput;
  deliveryChannel: DeliveryChannel;
  deliveryValue: string | null;
}

let ordersCache: Order[] = [];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function mapHistory(row: RawHistoryRow): OrderStatusHistory {
  return {
    id: row.id,
    orderId: row.order_id,
    previousOrderStatus: row.previous_order_status,
    newOrderStatus: row.new_order_status,
    previousPaymentStatus: row.previous_payment_status,
    newPaymentStatus: row.new_payment_status,
    action: row.action,
    note: row.note || undefined,
    actorType: row.actor_type,
    actorId: row.actor_id || '',
    actorName: row.actor_name,
    createdAt: row.created_at,
  };
}

function mapOrder(
  row: RawOrderRow,
  histories: OrderStatusHistory[],
  profile?: RawProfileRow
): Order {
  return {
    id: row.id,
    orderCode: row.order_code,
    userId: row.user_id,
    userName: profile?.full_name || profile?.username || 'Khách hàng',
    serviceId: row.service_id || '',
    serviceName: row.service_name,
    serviceCategory: row.service_category_slug,
    serviceThumbnailEmoji: row.service_thumbnail_emoji,
    serviceThumbnailBg: row.service_thumbnail_bg,
    purchaseFlowType: row.purchase_flow_type,
    quantity: row.quantity,
    unit: row.unit,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    customerInput: row.customer_input || {},
    deliveryChannel: row.delivery_channel,
    deliveryValue: row.delivery_value,
    paymentContent: row.payment_content,
    paymentStatus: row.payment_status,
    customerReportedPaidAt: row.customer_reported_paid_at,
    paymentVerifiedAt: row.payment_verified_at,
    orderStatus: row.order_status,
    processingStartedAt: row.processing_started_at,
    completedAt: row.completed_at,
    statusHistory: histories,
    adminNote: row.admin_note,
    publicNote: row.public_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function hydrateOrders(rows: RawOrderRow[]): Promise<Order[]> {
  if (rows.length === 0) return [];
  const supabase = createClient();
  const orderIds = rows.map((row) => row.id);
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  const [{ data: historyData, error: historyError }, { data: profileData, error: profileError }] =
    await Promise.all([
      supabase
        .from('order_status_history')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: true }),
      supabase.from('profiles').select('id,username,full_name').in('id', userIds),
    ]);

  if (historyError) console.error('Không thể tải timeline đơn hàng:', historyError.message);
  if (profileError) console.error('Không thể tải hồ sơ khách hàng:', profileError.message);

  const historyMap = new Map<string, OrderStatusHistory[]>();
  ((historyData || []) as RawHistoryRow[]).forEach((row) => {
    const list = historyMap.get(row.order_id) || [];
    list.push(mapHistory(row));
    historyMap.set(row.order_id, list);
  });

  const profileMap = new Map<string, RawProfileRow>();
  ((profileData || []) as RawProfileRow[]).forEach((row) => profileMap.set(row.id, row));

  return rows.map((row) => mapOrder(row, historyMap.get(row.id) || [], profileMap.get(row.user_id)));
}

function replaceAll(next: Order[]) {
  ordersCache = [...next].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  notify();
}

function replaceForUser(userId: string, next: Order[]) {
  ordersCache = [
    ...ordersCache.filter((order) => order.userId !== userId),
    ...next,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  notify();
}

function upsertCache(order: Order) {
  const existing = ordersCache.findIndex((item) => item.id === order.id);
  if (existing >= 0) {
    ordersCache = ordersCache.map((item) => (item.id === order.id ? order : item));
  } else {
    ordersCache = [order, ...ordersCache];
  }
  ordersCache.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  notify();
}

async function fetchOne(orderCodeOrId: string): Promise<Order | undefined> {
  const supabase = createClient();
  let query = supabase.from('orders').select('*');
  query = isUuid(orderCodeOrId)
    ? query.eq('id', orderCodeOrId)
    : query.eq('order_code', orderCodeOrId.toUpperCase());
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(`Không thể tải đơn hàng: ${error.message}`);
  if (!data) return undefined;
  const [mapped] = await hydrateOrders([data as RawOrderRow]);
  if (mapped) upsertCache(mapped);
  return mapped;
}

function cleanDatabaseError(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  const message = error.message;
  if (message.includes('ADMIN_REQUIRED')) return 'Bạn không có quyền quản trị.';
  if (message.includes('ORDER_NOT_FOUND')) return 'Không tìm thấy đơn hàng.';
  if (message.includes('INVALID_ORDER_STATE')) return 'Trạng thái đơn hiện tại không cho phép thao tác này.';
  if (message.includes('INVALID_STATUS_TRANSITION')) return 'Không thể chuyển sang trạng thái đã chọn.';
  if (message.includes('SERVICE_NOT_AVAILABLE')) return 'Dịch vụ hiện không khả dụng.';
  if (message.includes('INVALID_QUANTITY')) return 'Số lượng không hợp lệ.';
  if (message.includes('INTERACTION_LINK_REQUIRED')) return 'Vui lòng nhập link bài viết hoặc link trang cần xử lý.';
  if (message.includes('DELIVERY_INFORMATION_REQUIRED')) {
    return 'Vui lòng chọn Email, Zalo hoặc Facebook và nhập thông tin nhận tài khoản.';
  }
  if (message.includes('INVALID_DELIVERY_EMAIL')) return 'Địa chỉ email nhận tài khoản không hợp lệ.';
  if (message.includes('INVALID_DELIVERY_CHANNEL')) return 'Kênh nhận tài khoản không hợp lệ.';
  if (message.includes('orders_delivery_consistency')) {
    return 'Thông tin nhận tài khoản chưa đầy đủ hoặc không phù hợp với loại dịch vụ.';
  }
  return fallback;
}

export const orderService = {
  getOrderByCode(orderCode: string): Order | undefined {
    return ordersCache.find((order) => order.orderCode === orderCode);
  },

  getOrderById(orderId: string): Order | undefined {
    return ordersCache.find((order) => order.id === orderId);
  },

  getOrderForUser(orderCodeOrId: string, userId: string): Order | undefined {
    return ordersCache.find(
      (order) =>
        order.userId === userId &&
        (order.orderCode === orderCodeOrId || order.id === orderCodeOrId)
    );
  },

  getOrdersByUser(userId: string): Order[] {
    return ordersCache.filter((order) => order.userId === userId);
  },

  getAllOrders(): Order[] {
    return [...ordersCache];
  },

  async refreshAllOrders(): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Không thể tải danh sách đơn hàng: ${error.message}`);
    const mapped = await hydrateOrders((data || []) as RawOrderRow[]);
    replaceAll(mapped);
    return mapped;
  },

  async refreshOrdersByUser(userId: string): Promise<Order[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Không thể tải đơn hàng của bạn: ${error.message}`);
    const mapped = await hydrateOrders((data || []) as RawOrderRow[]);
    replaceForUser(userId, mapped);
    return mapped;
  },

  async refreshOrder(orderCodeOrId: string): Promise<Order | undefined> {
    return fetchOne(orderCodeOrId);
  },

  async refreshOrderForUser(orderCodeOrId: string, userId: string): Promise<Order | undefined> {
    const order = await fetchOne(orderCodeOrId);
    return order?.userId === userId ? order : undefined;
  },

  async createOrder(params: CreateOrderParams): Promise<Order> {
    const supabase = createClient();
    let serviceQuery = supabase
      .from('services')
      .select('id,slug,is_active,deleted_at')
      .eq('is_active', true)
      .is('deleted_at', null);

    serviceQuery = isUuid(params.serviceId)
      ? serviceQuery.eq('id', params.serviceId)
      : serviceQuery.eq('slug', params.serviceSlug);

    const { data: service, error: serviceError } = await serviceQuery.maybeSingle();

    if (serviceError) {
      throw new Error(`Không thể kiểm tra dịch vụ: ${serviceError.message}`);
    }
    if (!service) {
      throw new Error('Dịch vụ không tồn tại trong Supabase hoặc đang bị tắt. Vui lòng tải lại trang.');
    }

    const { data, error } = await supabase.rpc('create_order', {
      p_service_id: service.id,
      p_quantity: params.quantity,
      p_customer_input: params.customerInput,
      p_delivery_channel: params.deliveryChannel,
      p_delivery_value: params.deliveryValue,
    });

    if (error) {
      throw new Error(
        cleanDatabaseError(
          new Error(error.message),
          'Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin và thử lại.'
        )
      );
    }
    const raw = Array.isArray(data) ? data[0] : data;
    const order = await fetchOne((raw as RawOrderRow).order_code);
    if (!order) throw new Error('Không thể tải đơn vừa tạo.');
    return order;
  },

  async customerReportPaid(orderCode: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('report_order_payment', { p_order_code: orderCode });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể báo chuyển khoản.') };
    await fetchOne(orderCode);
    return { success: true, message: 'Đã ghi nhận. Admin sẽ xác nhận sớm nhất có thể.' };
  },

  async adminConfirmPayment(orderCode: string, note?: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_confirm_payment', {
      p_order_code: orderCode,
      p_note: note || null,
      p_bank_reference: null,
    });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể xác nhận thanh toán.') };
    await fetchOne(orderCode);
    return { success: true, message: 'Đã xác nhận thanh toán thành công.' };
  },

  async adminMarkPaymentIssue(orderCode: string, note?: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_reject_payment', {
      p_order_code: orderCode,
      p_reason: note || 'Chưa tìm thấy giao dịch phù hợp. Khách hàng vui lòng kiểm tra lại.',
    });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể cập nhật thanh toán.') };
    await fetchOne(orderCode);
    return { success: true, message: 'Đã chuyển đơn sang trạng thái thanh toán có vấn đề.' };
  },

  async adminUpdateOrderStatus(
    orderCode: string,
    newOrderStatus: OrderStatus,
    _adminId: string,
    _adminName: string,
    _action: string,
    note?: string
  ): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_order_status', {
      p_order_code: orderCode,
      p_new_status: newOrderStatus,
      p_note: note || null,
      p_public_note: note || null,
    });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể cập nhật trạng thái.') };
    await fetchOne(orderCode);
    return { success: true, message: 'Đã cập nhật trạng thái đơn hàng.' };
  },

  async adminAddNote(orderCode: string, note: string, isPublic: boolean): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_order_notes', {
      p_order_code: orderCode,
      p_note: note,
      p_is_public: isPublic,
    });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể lưu ghi chú.') };
    await fetchOne(orderCode);
    return { success: true, message: 'Đã lưu ghi chú.' };
  },

  async adminDeleteOrder(orderCode: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_delete_order', {
      p_order_code: orderCode,
      p_reason: reason || null,
    });
    if (error) return { success: false, message: cleanDatabaseError(new Error(error.message), 'Không thể xóa đơn hàng.') };
    ordersCache = ordersCache.filter((order) => order.orderCode !== orderCode);
    notify();
    return { success: true, message: `Đã xóa đơn ${orderCode} khỏi cơ sở dữ liệu.` };
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
