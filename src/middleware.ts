import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabasePublishableKey } from '@/lib/supabase/env';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Quyết định các route cần bảo vệ
  const isAccountRoute = path.startsWith('/tai-khoan');
  const isPaymentRoute = path.startsWith('/thanh-toan');
  const isAdminRoute = path.startsWith('/admin');

  // Chưa đăng nhập -> Chuyển về đăng nhập kèm returnUrl
  if ((isAccountRoute || isPaymentRoute || isAdminRoute) && !user) {
    const url = new URL('/dang-nhap', request.url);
    url.searchParams.set('returnUrl', path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Đã đăng nhập, truy cập admin -> Kiểm tra role
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      // User không phải admin -> chuyển hướng về /tai-khoan
      return NextResponse.redirect(new URL('/tai-khoan', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/tai-khoan/:path*',
    '/thanh-toan/:path*',
    '/admin/:path*',
  ],
};
