/**
 * Form Validation Rules with clear Vietnamese error messages
 */

export function validateUsername(username: string): string | undefined {
  const trimmed = username.trim();

  if (!trimmed) {
    return 'Vui lòng nhập tên tài khoản.';
  }
  if (username.startsWith(' ') || username.endsWith(' ')) {
    return 'Tên tài khoản không được chứa khoảng trắng ở đầu hoặc cuối.';
  }
  if (trimmed.length < 4 || trimmed.length > 30) {
    return 'Tên tài khoản phải từ 4 đến 30 ký tự.';
  }
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return 'Tên tài khoản chỉ bao gồm chữ cái, chữ số, dấu chấm hoặc gạch dưới.';
  }

  return undefined;
}

export function validatePhone(phone: string): string | undefined {
  const trimmed = phone.trim();

  if (!trimmed) {
    return 'Vui lòng nhập số điện thoại.';
  }
  // Vietnamese phone pattern: 10 digits starting with 03, 05, 07, 08, 09
  const vnPhoneRegex = /^(03|05|07|08|09)\d{8}$/;
  if (!vnPhoneRegex.test(trimmed)) {
    return 'Số điện thoại không hợp lệ (Phải bao gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09).';
  }

  return undefined;
}

export function validateIdentifier(identifier: string): string | undefined {
  const trimmed = identifier.trim();
  if (!trimmed) {
    return 'Vui lòng nhập số điện thoại hoặc tên tài khoản.';
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return 'Vui lòng nhập mật khẩu.';
  }
  if (password.length < 8) {
    return 'Mật khẩu phải có tối thiểu 8 ký tự.';
  }

  return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) {
    return 'Vui lòng xác nhận mật khẩu.';
  }
  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không trùng khớp.';
  }

  return undefined;
}

export function validateTermsAgreement(agreed: boolean): string | undefined {
  if (!agreed) {
    return 'Bạn cần phải đồng ý với điều khoản sử dụng để tiếp tục.';
  }
  return undefined;
}
