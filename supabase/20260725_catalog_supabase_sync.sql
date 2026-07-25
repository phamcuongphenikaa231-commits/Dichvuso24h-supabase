-- Dịch Vụ Số 24H
-- Đồng bộ danh mục/dịch vụ giữa admin, giao diện khách và Supabase.
-- Chạy sau bộ database V1 và migration 20260725_admin_sync_features.sql.

begin;

-- Bảo đảm các cột dùng cho đồng bộ catalog tồn tại.
alter table public.service_categories
  add column if not exists legacy_key text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

alter table public.services
  add column if not exists legacy_key text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists deleted_at timestamptz;

create unique index if not exists service_categories_legacy_key_uidx
  on public.service_categories(legacy_key)
  where legacy_key is not null;

create unique index if not exists services_legacy_key_uidx
  on public.services(legacy_key)
  where legacy_key is not null;

-- Bật realtime để những tab đang mở tự cập nhật khi admin sửa dữ liệu.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'services'
  ) then
    alter publication supabase_realtime add table public.services;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'service_categories'
  ) then
    alter publication supabase_realtime add table public.service_categories;
  end if;
end
$$;

-- RLS: khách chỉ đọc catalog đang hoạt động; admin được CRUD đầy đủ.
alter table public.services enable row level security;
alter table public.service_categories enable row level security;

drop policy if exists services_public_select on public.services;
create policy services_public_select on public.services
for select to anon, authenticated
using ((is_active and deleted_at is null) or (select private.is_admin()));

drop policy if exists services_admin_all on public.services;
create policy services_admin_all on public.services
for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

drop policy if exists categories_public_select on public.service_categories;
create policy categories_public_select on public.service_categories
for select to anon, authenticated
using ((is_active and deleted_at is null) or (select private.is_admin()));

drop policy if exists categories_admin_all on public.service_categories;
create policy categories_admin_all on public.service_categories
for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

grant select on public.services, public.service_categories to anon, authenticated;
grant insert, update, delete on public.services, public.service_categories to authenticated;

commit;

-- Kiểm tra sau khi chạy
select 'services' as table_name, count(*) as row_count from public.services
union all
select 'service_categories', count(*) from public.service_categories;
