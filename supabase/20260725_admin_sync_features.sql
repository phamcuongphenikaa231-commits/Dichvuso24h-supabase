-- Dịch Vụ Số 24H
-- Migration: Hero trang chủ, thông tin liên hệ đồng bộ và xóa đơn hàng bởi admin
-- Chạy một lần trong Supabase SQL Editor sau các file database V1.

begin;

-- =========================================================
-- 1. DỮ LIỆU CẤU HÌNH HERO / LIÊN HỆ
-- =========================================================

insert into public.site_settings (key, value, is_public)
values (
  'homepage_hero',
  jsonb_build_object(
    'enabled', true,
    'badgeText', 'Hệ thống tự động – Xử lý 24/7',
    'titleBeforeHighlight', 'Dịch vụ số',
    'highlightedTitle', 'nhanh chóng',
    'titleAfterHighlight', 'minh bạch và thuận tiện',
    'description', 'Cửa hàng cung cấp tài khoản số cao cấp và dịch vụ hỗ trợ mạng xã hội chuyên nghiệp. Đặt hàng tự động, nhận hàng nhanh — không cần chờ đợi.',
    'primaryButton', jsonb_build_object(
      'enabled', true,
      'text', 'Khám phá dịch vụ',
      'url', '/dich-vu'
    ),
    'secondaryButton', jsonb_build_object(
      'enabled', true,
      'text', 'Xem hướng dẫn',
      'url', '/huong-dan'
    ),
    'benefits', jsonb_build_array(
      jsonb_build_object('id', 'benefit-warranty', 'text', 'Bảo hành 1 đổi 1', 'icon', 'shield', 'enabled', true),
      jsonb_build_object('id', 'benefit-fast', 'text', 'Kích hoạt tức thì', 'icon', 'zap', 'enabled', true),
      jsonb_build_object('id', 'benefit-support', 'text', 'Hỗ trợ 24/7', 'icon', 'headphones', 'enabled', true)
    ),
    'visual', jsonb_build_object('url', '', 'path', '', 'alt', 'Minh họa hệ thống Dịch Vụ Số 24H'),
    'background', jsonb_build_object(
      'url', '',
      'path', '',
      'fallbackColor', '#0f4c81',
      'overlayOpacity', 55,
      'position', 'center',
      'size', 'cover'
    )
  ),
  true
)
on conflict (key) do nothing;

insert into public.site_settings (key, value, is_public)
values (
  'contact',
  jsonb_build_object(
    'hotline', '0988.247.247',
    'supportEmail', 'hotro@dichvuso24h.vn',
    'address', 'Hà Nội, Việt Nam (Hỗ trợ trực tuyến toàn quốc)',
    'workingHours', '08:00 - 22:00 hằng ngày'
  ),
  true
)
on conflict (key) do nothing;

-- Bổ sung workingHours cho dữ liệu contact cũ mà không ghi đè các thông tin đã có.
update public.site_settings
set
  value = value || jsonb_build_object(
    'workingHours', coalesce(value -> 'workingHours', to_jsonb('08:00 - 22:00 hằng ngày'::text))
  ),
  is_public = true,
  updated_at = now()
where key = 'contact';

insert into public.site_settings (key, value, is_public)
values (
  'social_links',
  jsonb_build_object(
    'facebook', '',
    'telegram', '',
    'youtube', '',
    'zalo', '',
    'tiktok', ''
  ),
  true
)
on conflict (key) do nothing;

-- Đưa bảng site_settings vào Supabase Realtime để trang khách tự nhận thay đổi từ admin.
do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'site_settings'
  ) then
    alter publication supabase_realtime add table public.site_settings;
  end if;
end;
$$;

-- =========================================================
-- 2. SUPABASE STORAGE CHO ẢNH HERO
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-assets',
  'site-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Ảnh trong bucket này được đọc công khai để hiển thị trên trang chủ.
drop policy if exists site_assets_public_read on storage.objects;
create policy site_assets_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'site-assets');

-- Chỉ admin đang hoạt động được tải ảnh Hero lên đúng thư mục quy định.
drop policy if exists site_assets_admin_insert on storage.objects;
create policy site_assets_admin_insert
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and (select private.is_admin())
  and name ~ '^homepage/hero/(background|visual)/[0-9a-fA-F-]+\.(jpg|png|webp)$'
);

drop policy if exists site_assets_admin_update on storage.objects;
create policy site_assets_admin_update
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and (select private.is_admin())
)
with check (
  bucket_id = 'site-assets'
  and (select private.is_admin())
  and name ~ '^homepage/hero/(background|visual)/[0-9a-fA-F-]+\.(jpg|png|webp)$'
);

drop policy if exists site_assets_admin_delete on storage.objects;
create policy site_assets_admin_delete
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and (select private.is_admin())
);

-- =========================================================
-- 3. RPC CẬP NHẬT GHI CHÚ ĐƠN HÀNG
-- =========================================================

create or replace function public.admin_update_order_notes(
  p_order_code text,
  p_note text,
  p_is_public boolean default false
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_clean_note text;
begin
  if not (select private.is_admin()) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select * into v_admin
  from public.profiles
  where id = (select auth.uid());

  v_clean_note := nullif(btrim(p_note), '');
  if v_clean_note is null then
    raise exception 'NOTE_REQUIRED';
  end if;

  select * into v_order
  from public.orders
  where order_code = upper(btrim(p_order_code))
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if p_is_public then
    update public.orders
    set public_note = v_clean_note, updated_at = now()
    where id = v_order.id
    returning * into v_order;
  else
    update public.orders
    set admin_note = v_clean_note, updated_at = now()
    where id = v_order.id
    returning * into v_order;
  end if;

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
    v_order.order_status,
    v_order.order_status,
    v_order.payment_status,
    v_order.payment_status,
    case when p_is_public then 'Cập nhật ghi chú cho khách hàng' else 'Cập nhật ghi chú nội bộ' end,
    v_clean_note,
    'admin'::public.actor_type,
    v_admin.id,
    v_admin.username
  );

  insert into public.activity_logs (
    actor_id, actor_name, actor_role, action, target_type, target_id, detail
  ) values (
    v_admin.id,
    v_admin.username,
    'admin',
    'update_note',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'order_code', v_order.order_code,
      'is_public', p_is_public
    )
  );

  return v_order;
end;
$$;

-- =========================================================
-- 4. RPC XÓA ĐƠN HÀNG
-- =========================================================

create or replace function public.admin_delete_order(
  p_order_code text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.profiles%rowtype;
  v_order public.orders%rowtype;
  v_reason text;
begin
  if not (select private.is_admin()) then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select * into v_admin
  from public.profiles
  where id = (select auth.uid());

  select * into v_order
  from public.orders
  where order_code = upper(btrim(p_order_code))
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  v_reason := nullif(btrim(p_reason), '');

  -- Lưu nhật ký trước khi xóa. activity_logs.target_id không có khóa ngoại tới orders.
  insert into public.activity_logs (
    actor_id, actor_name, actor_role, action, target_type, target_id, detail
  ) values (
    v_admin.id,
    v_admin.username,
    'admin',
    'delete',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'order_code', v_order.order_code,
      'user_id', v_order.user_id,
      'service_name', v_order.service_name,
      'total_amount', v_order.total_amount,
      'reason', v_reason
    )
  );

  -- Hoàn lại bộ đếm mã giảm giá (nếu đơn có sử dụng) rồi dọn bản ghi ON DELETE RESTRICT.
  if v_order.coupon_id is not null then
    update public.coupons
    set used_count = greatest(used_count - 1, 0), updated_at = now()
    where id = v_order.coupon_id;
  end if;

  delete from public.coupon_usages where order_id = v_order.id;

  -- Các bảng order_items, payments và order_status_history tự xóa theo ON DELETE CASCADE.
  -- support_tickets.related_order_id tự chuyển thành NULL theo ON DELETE SET NULL.
  delete from public.orders where id = v_order.id;

  return jsonb_build_object(
    'success', true,
    'order_code', v_order.order_code,
    'deleted_at', now()
  );
end;
$$;

revoke all on function public.admin_update_order_notes(text, text, boolean) from public;
revoke all on function public.admin_delete_order(text, text) from public;

grant execute on function public.admin_update_order_notes(text, text, boolean) to authenticated;
grant execute on function public.admin_delete_order(text, text) to authenticated;

commit;
