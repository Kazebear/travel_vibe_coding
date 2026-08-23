import { supabase, loadProfile } from '../database/supabaseClient.js';
import { getState, setCurrentUser } from '../state.js';
import { isValidEmail, isValidUsername, isValidPassword, isValidPhone10, isValidAddress, required } from '../utils/validation.js';

function mapAuthError(err) {
  const msg = err?.message || '';
  if (msg.includes('Invalid login credentials')) return 'Email/Username hoặc mật khẩu không đúng.';
  if (msg.includes('already registered') || msg.includes('already exists')) return 'Email đã được sử dụng.';
  if (msg.includes('at least 6 characters')) return 'Password phải từ 6-15 ký tự.';
  if (msg.includes('rate limit')) return 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút.';
  return msg || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

export async function login(identifier, password) {
  if (!identifier || !password) throw new Error('Vui lòng nhập đầy đủ thông tin đăng nhập.');

  let email = identifier.trim();
  if (!isValidEmail(email)) {
    const { data: resolvedEmail, error: lookupError } = await supabase.rpc('fn_email_by_username', { p_username: email });
    if (lookupError || !resolvedEmail) throw new Error('Tài khoản không tồn tại.');
    email = resolvedEmail;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapAuthError(error));

  const publicUser = await loadProfile(data.user);
  if (!publicUser) throw new Error('Không thể tải thông tin tài khoản.');
  return publicUser;
}

export async function register(data) {
  if (!required(data.fullName)) throw new Error('Vui lòng nhập họ tên.');
  if (!isValidUsername(data.username)) {
    throw new Error('Username phải từ 5-15 ký tự và không chứa ký tự đặc biệt.');
  }
  if (!isValidEmail(data.email)) throw new Error('Email không hợp lệ.');
  if (!isValidPassword(data.password)) throw new Error('Password phải từ 6-15 ký tự.');
  if (data.password !== data.confirmPassword) throw new Error('Xác nhận mật khẩu không khớp.');
  if (!isValidPhone10(data.phone)) throw new Error('Số điện thoại phải gồm đúng 10 chữ số.');
  if (!isValidAddress(data.address, 100)) throw new Error('Địa chỉ không được vượt quá 100 ký tự.');

  const { data: available } = await supabase.rpc('fn_username_available', { p_username: data.username });
  if (available === false) throw new Error('Username đã được sử dụng.');

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username,
        full_name: data.fullName,
        phone: data.phone,
        address: data.address || '',
      },
    },
  });
  if (error) throw new Error(mapAuthError(error));

  const publicUser = await loadProfile(authData.user);
  if (!publicUser) throw new Error('Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản trước khi đăng nhập.');
  return publicUser;
}

export async function logout() {
  await supabase.auth.signOut();
  setCurrentUser(null);
}

export function getCurrentUser() {
  return getState().currentUser;
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function isAdmin() {
  const u = getCurrentUser();
  return !!u && u.role === 'admin';
}

export async function requestPasswordReset(email) {
  if (!isValidEmail(email)) throw new Error('Email không hợp lệ.');
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(mapAuthError(error));
  return true;
}

export function refreshCurrentUser(row) {
  setCurrentUser({
    id: row.id,
    username: row.username,
    email: getState().currentUser?.email || '',
    role: row.role,
    full_name: row.full_name,
    phone: row.phone,
    country: row.country,
    address: row.address,
    avatar: row.avatar,
    created_at: row.created_at,
  });
}
