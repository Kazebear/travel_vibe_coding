import { getUserByEmail, getUserByUsername, createUser } from '../repositories/UserRepository.js';
import { sha256Hex } from '../utils/hash.js';
import { setCurrentUser, getState } from '../state.js';
import { isValidEmail, isValidUsername, isValidPassword, isValidPhone10, isValidAddress, required } from '../utils/validation.js';

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    full_name: row.full_name,
    phone: row.phone,
    country: row.country,
    address: row.address,
    avatar: row.avatar,
    created_at: row.created_at,
  };
}

export async function login(identifier, password) {
  if (!identifier || !password) throw new Error('Vui lòng nhập đầy đủ thông tin đăng nhập.');
  const user = isValidEmail(identifier) ? getUserByEmail(identifier) : getUserByUsername(identifier);
  if (!user) throw new Error('Tài khoản không tồn tại.');
  const hash = await sha256Hex(password);
  if (hash !== user.password_hash) throw new Error('Mật khẩu không đúng.');
  const publicUser = toPublicUser(user);
  setCurrentUser(publicUser);
  return publicUser;
}

export async function register(data) {
  if (!required(data.fullName)) throw new Error('Vui lòng nhập họ tên.');
  if (!isValidUsername(data.username)) {
    throw new Error('Username phải từ 5-15 ký tự và không chứa ký tự đặc biệt.');
  }
  if (!isValidEmail(data.email)) throw new Error('Email không hợp lệ.');
  if (!isValidPassword(data.password)) throw new Error('Password phải từ 5-15 ký tự.');
  if (data.password !== data.confirmPassword) throw new Error('Xác nhận mật khẩu không khớp.');
  if (!isValidPhone10(data.phone)) throw new Error('Số điện thoại phải gồm đúng 10 chữ số.');
  if (!isValidAddress(data.address, 100)) throw new Error('Địa chỉ không được vượt quá 100 ký tự.');
  if (getUserByEmail(data.email)) throw new Error('Email đã được sử dụng.');
  if (getUserByUsername(data.username)) throw new Error('Username đã được sử dụng.');

  const hash = await sha256Hex(data.password);
  const id = createUser({
    username: data.username,
    email: data.email,
    password_hash: hash,
    full_name: data.fullName,
    phone: data.phone,
    address: data.address || '',
    role: 'user',
  });
  const user = {
    id,
    username: data.username,
    email: data.email.toLowerCase(),
    role: 'user',
    full_name: data.fullName,
    phone: data.phone,
    country: '',
    address: data.address || '',
    avatar: '',
    created_at: new Date().toISOString(),
  };
  setCurrentUser(user);
  return user;
}

export function logout() {
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
  const user = getUserByEmail(email);
  if (!user) throw new Error('Email không tồn tại trong hệ thống.');
  return true;
}

export function refreshCurrentUser(row) {
  setCurrentUser(toPublicUser(row));
}
