'use client';

import { useState } from 'react';
import { User, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function AccountProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.username || '', // We don't have a separate full name in our mock auth yet, we'll just map it to username for UI
    email: 'khachhang@example.com', // Mock email since our demo auth is phone based
  });

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast(
        'Cập nhật thành công',
        'Thông tin hồ sơ của bạn đã được lưu lại.',
        'success'
      );
      // Optionally we could update the user context here if it supported these fields
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông tin hồ sơ</h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân và liên hệ</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ảnh đại diện</h3>
              <p className="text-sm text-gray-500 mt-1 mb-3">Hỗ trợ JPG, PNG. Kích thước tối đa 2MB.</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" type="button">Thay đổi</Button>
                <Button variant="outline" size="sm" type="button" className="text-red-600 hover:bg-red-50 hover:border-red-200">Xóa</Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {/* Tên tài khoản (Read only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Tên tài khoản (Username)
              </label>
              <Input value={user.username} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>

            {/* Số điện thoại (Read only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Số điện thoại
              </label>
              <div className="relative">
                <Input value={user.phone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')} readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed pr-24" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Đã xác minh</span>
              </div>
            </div>

            {/* Họ và tên */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              <Input 
                name="fullName"
                value={formData.fullName} 
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Địa chỉ Email
              </label>
              <Input 
                name="email"
                type="email"
                value={formData.email} 
                onChange={handleChange}
                placeholder="Ví dụ: email@gmail.com"
              />
            </div>

            {/* Ngày tham gia */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Ngày tham gia
              </label>
              <Input value="23/07/2026" readOnly className="bg-gray-50 text-gray-500 cursor-not-allowed w-full md:w-[calc(50%-12px)]" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
