'use client';

import { createClient } from '@/lib/supabase/client';
import { AuthUser } from '@/types/auth';

interface RawProfile {
  id: string;
  role?: string;
  status?: string;
  email?: string;
  created_at?: string;
}

export const authService = {
  // Trả về danh sách user dạng AuthUser từ public.profiles
  async getAllUsers(): Promise<AuthUser[]> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) {
        console.error('Error fetching users from Supabase profiles:', error);
        return [];
      }
      const profiles = (data || []) as RawProfile[];
      return profiles.map((p) => {
        const email = p.email || '';
        const username = email ? email.split('@')[0] : 'User';
        return {
          id: p.id,
          username,
          phone: '',
          fullName: username,
          role: (p.role as 'user' | 'admin') || 'user',
          status: (p.status as 'active' | 'locked') || 'active',
          createdAt: p.created_at || new Date().toISOString(),
        };
      });
    } catch (err) {
      console.error('Exception in getAllUsers:', err);
      return [];
    }
  },

  // Lấy chi tiết user theo ID
  async getUserById(userId: string): Promise<AuthUser | undefined> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error || !data) {
        return undefined;
      }
      const p = data as RawProfile;
      const email = p.email || '';
      const username = email ? email.split('@')[0] : 'User';
      return {
        id: p.id,
        username,
        phone: '',
        fullName: username,
        role: (p.role as 'user' | 'admin') || 'user',
        status: (p.status as 'active' | 'locked') || 'active',
        createdAt: p.created_at || new Date().toISOString(),
      };
    } catch (err) {
      console.error('Exception in getUserById:', err);
      return undefined;
    }
  },

  // Cập nhật trạng thái của user (khóa/mở khóa)
  async setUserStatus(userId: string, status: 'active' | 'locked'): Promise<{ success: boolean; message: string }> {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);
      if (error) {
        console.error('Error updating profile status:', error);
        return { success: false, message: 'Không thể cập nhật trạng thái trong cơ sở dữ liệu.' };
      }
      return {
        success: true,
        message: status === 'locked' ? 'Đã khóa tài khoản thành công.' : 'Đã mở khóa tài khoản thành công.',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu.';
      return { success: false, message: errMsg };
    }
  },
};
