'use client';

import { useState } from 'react';
import { KeyRound, Smartphone, Monitor, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { MOCK_ACTIVE_DEVICES } from '@/data/mockCustomerAccount';

export default function AccountSecurityPage() {
  const { showToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [devices, setDevices] = useState(MOCK_ACTIVE_DEVICES);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast('Lỗi', 'Mật khẩu xác nhận không khớp.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setPasswords({ current: '', new: '', confirm: '' });
      showToast(
        'Thành công',
        'Đổi mật khẩu thành công.',
        'success'
      );
    }, 1000);
  };

  const handleSignOutOtherDevices = () => {
    setDevices(devices.filter(d => d.isCurrent));
    showToast(
      'Thành công',
      'Đã đăng xuất khỏi tất cả các thiết bị khác.',
      'success'
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h1>
        <p className="text-gray-500 mt-1">Quản lý mật khẩu và các thiết bị đã đăng nhập</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Password & 2FA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <KeyRound className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Đổi mật khẩu</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-gray-700">Mật khẩu hiện tại</label>
                <Input 
                  name="current"
                  type="password"
                  required
                  value={passwords.current} 
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <Input 
                  name="new"
                  type="password"
                  required
                  minLength={8}
                  value={passwords.new} 
                  onChange={handleChange}
                  placeholder="Tối thiểu 8 ký tự"
                />
              </div>
              <div className="space-y-2 max-w-md">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <Input 
                  name="confirm"
                  type="password"
                  required
                  value={passwords.confirm} 
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
              <div className="pt-2">
                <Button type="submit" isLoading={isSubmitting}>
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>

          {/* 2FA Placeholder */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <ShieldCheck className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Xác thực 2 lớp (2FA)</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-full flex items-center justify-center shrink-0">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Tăng cường bảo mật cho tài khoản</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Xác thực 2 lớp qua ứng dụng Authenticator (Google/Microsoft) hoặc mã SMS sẽ được tích hợp trong phiên bản sắp tới.
                </p>
                <Button variant="outline" disabled className="w-full sm:w-auto">
                  Sắp ra mắt
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col - Active Sessions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Monitor className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Thiết bị đăng nhập</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {devices.map((device) => (
                <div key={device.id} className="p-5 flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${device.isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {device.deviceName.toLowerCase().includes('iphone') || device.deviceName.toLowerCase().includes('mobile') 
                      ? <Smartphone className="w-5 h-5" /> 
                      : <Monitor className="w-5 h-5" />
                    }
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {device.deviceName} {device.isCurrent && <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1">Hiện tại</span>}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">{device.browser} • {device.location}</p>
                    <p className="text-xs text-gray-400 mt-1">Hoạt động: {device.lastActive}</p>
                  </div>
                </div>
              ))}
              
              {devices.length === 1 && (
                <div className="p-5 text-center text-sm text-gray-500">
                  Không có thiết bị nào khác đang đăng nhập.
                </div>
              )}
            </div>
            
            {devices.length > 1 && (
              <div className="p-4 border-t border-gray-100 bg-red-50/30">
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 hover:border-red-300"
                  onClick={handleSignOutOtherDevices}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Đăng xuất khỏi thiết bị khác
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
