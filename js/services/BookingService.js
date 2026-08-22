import * as BookingRepository from '../repositories/BookingRepository.js';
import { getCart, clearCart, getCartTotal } from './CartService.js';
import { sendBookingConfirmationEmail } from './EmailService.js';
import { isValidEmail, isValidPhone, required } from '../utils/validation.js';

function generateBookingCode() {
  return 'TV' + Date.now().toString(36).toUpperCase();
}

export function validateBookingForm(data) {
  const errors = {};
  if (!required(data.fullName)) errors.fullName = 'Vui lòng nhập họ tên.';
  if (!isValidEmail(data.email)) errors.email = 'Email không hợp lệ.';
  if (!isValidPhone(data.phone)) errors.phone = 'Số điện thoại không hợp lệ.';
  if (!required(data.country)) errors.country = 'Vui lòng nhập quốc gia.';
  if (!required(data.address)) errors.address = 'Vui lòng nhập địa chỉ.';
  return errors;
}

export async function createBookingFromCart(customer, userId) {
  const cart = getCart();
  if (!cart.flights.length && !cart.tours.length) {
    throw new Error('Giỏ hàng đang trống.');
  }

  const total = getCartTotal();
  const bookingCode = generateBookingCode();
  const bookingId = BookingRepository.createBooking({
    booking_code: bookingCode,
    user_id: userId || null,
    customer_name: customer.fullName,
    customer_email: customer.email,
    customer_phone: customer.phone,
    country: customer.country,
    address: customer.address,
    total_amount: total,
  });

  cart.flights.forEach((f) => BookingRepository.addBookingFlight(bookingId, f.flightId, f.fareClass, f.price));
  cart.tours.forEach((t) => BookingRepository.addBookingTour(bookingId, t.tourId, t.price));

  const summary = {
    bookingCode,
    customer,
    total,
    flights: cart.flights,
    tours: cart.tours,
    createdAt: new Date().toISOString(),
  };

  const emailResult = await sendBookingConfirmationEmail(summary);
  clearCart();
  return { ...summary, email: emailResult };
}
