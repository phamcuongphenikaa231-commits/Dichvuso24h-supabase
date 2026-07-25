-- DỊCH VỤ SỐ 24H
-- Đơn tài khoản/dịch vụ thường chỉ cần số lượng; dịch vụ tương tác nhận thêm link trong customer_input.
-- Chạy một lần trong Supabase SQL Editor sau khi cập nhật code.

begin;

create or replace function public.create_order(
  p_service_id uuid,
  p_quantity integer,
  p_customer_input jsonb default '{}'::jsonb,
  p_delivery_channel public.delivery_channel default null,
  p_delivery_value text default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user public.profiles%rowtype;
  v_service public.services%rowtype;
  v_payment_account public.payment_accounts%rowtype;
  v_order public.orders%rowtype;
  v_order_code text;
  v_subtotal numeric(14,0);
  v_attempt integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_user
  from public.profiles
  where id = (select auth.uid())
  for update;

  if not found or v_user.status <> 'active'::public.user_status then
    raise exception 'ACCOUNT_NOT_ACTIVE';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and is_active = true
    and deleted_at is null
  for share;

  if not found or v_service.stock_status <> 'available'::public.service_stock_status then
    raise exception 'SERVICE_NOT_AVAILABLE';
  end if;

  if p_quantity is null
     or p_quantity < v_service.min_quantity
     or p_quantity > v_service.max_quantity then
    raise exception 'INVALID_QUANTITY';
  end if;

  if p_customer_input is null or jsonb_typeof(p_customer_input) <> 'object' then
    raise exception 'INVALID_CUSTOMER_INPUT';
  end if;

  -- Chỉ dịch vụ tương tác bắt buộc có link công khai.
  if v_service.purchase_flow_type = 'interaction'::public.purchase_flow_type then
    if nullif(btrim(p_customer_input ->> 'link'), '') is null then
      raise exception 'INTERACTION_LINK_REQUIRED';
    end if;
  end if;

  -- Website không yêu cầu kênh bàn giao khi tạo đơn.
  p_delivery_channel := null;
  p_delivery_value := null;

  select * into v_payment_account
  from public.payment_accounts
  where method = 'vietqr' and is_active = true
  order by created_at asc
  limit 1;

  if not found then
    raise exception 'PAYMENT_ACCOUNT_NOT_CONFIGURED';
  end if;

  v_subtotal := round(v_service.price * p_quantity, 0);

  loop
    v_order_code := private.generate_order_code();
    exit when not exists (select 1 from public.orders where order_code = v_order_code);
    v_attempt := v_attempt + 1;
    if v_attempt >= 20 then
      raise exception 'ORDER_CODE_GENERATION_FAILED';
    end if;
  end loop;

  insert into public.orders (
    order_code,
    user_id,
    service_id,
    service_name,
    service_category_slug,
    service_thumbnail_emoji,
    service_thumbnail_bg,
    purchase_flow_type,
    quantity,
    unit,
    unit_price,
    subtotal_amount,
    discount_amount,
    total_amount,
    customer_input,
    delivery_channel,
    delivery_value,
    payment_content,
    payment_status,
    order_status
  )
  values (
    v_order_code,
    v_user.id,
    v_service.id,
    v_service.name,
    (select c.slug from public.service_categories c where c.id = v_service.category_id),
    v_service.thumbnail_emoji,
    v_service.thumbnail_bg,
    v_service.purchase_flow_type,
    p_quantity,
    v_service.unit,
    v_service.price,
    v_subtotal,
    0,
    v_subtotal,
    p_customer_input,
    null,
    null,
    v_order_code,
    'unpaid'::public.payment_status,
    'pending_payment'::public.order_status
  )
  returning * into v_order;

  insert into public.order_items (
    order_id, service_id, service_name, service_slug,
    quantity, unit, unit_price, total_amount, metadata
  ) values (
    v_order.id, v_service.id, v_service.name, v_service.slug,
    p_quantity, v_service.unit, v_service.price, v_subtotal,
    jsonb_build_object('purchase_flow_type', v_service.purchase_flow_type)
  );

  insert into public.payments (
    order_id, payment_account_id, method,
    bank_code, bank_name, account_number, account_name,
    amount, currency, transfer_content, status
  ) values (
    v_order.id, v_payment_account.id, v_payment_account.method,
    v_payment_account.bank_code, v_payment_account.bank_name,
    v_payment_account.account_number, v_payment_account.account_name,
    v_order.total_amount, v_order.currency, v_order.payment_content,
    'unpaid'::public.payment_status
  );

  insert into public.order_status_history (
    order_id,
    previous_order_status,
    new_order_status,
    previous_payment_status,
    new_payment_status,
    action,
    note,
    actor_type,
    actor_id,
    actor_name
  ) values (
    v_order.id,
    null,
    'pending_payment'::public.order_status,
    null,
    'unpaid'::public.payment_status,
    'Tạo đơn hàng',
    'Dịch vụ: ' || v_service.name || ' — Số lượng: ' || p_quantity || ' ' || v_service.unit,
    'customer'::public.actor_type,
    v_user.id,
    v_user.username
  );

  return v_order;
end;
$$;

revoke all on function public.create_order(uuid, integer, jsonb, public.delivery_channel, text) from public;
grant execute on function public.create_order(uuid, integer, jsonb, public.delivery_channel, text) to authenticated;

commit;
