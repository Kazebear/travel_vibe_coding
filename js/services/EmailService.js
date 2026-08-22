import { EMAIL_SENDER } from '../utils/constants.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';

function buildEmailBody(summary) {
  const lines = [];
  lines.push(`Mã booking: ${summary.bookingCode}`);
  lines.push(`Khách hàng: ${summary.customer.fullName}`);
  lines.push('');
  if (summary.flights.length) {
    lines.push('Chuyến bay:');
    summary.flights.forEach((f) => {
      lines.push(`- ${f.airline} ${f.flightNumber}: ${f.origin} → ${f.destination}, ${formatDate(f.date)} ${f.departureTime}, ${formatCurrency(f.price)}`);
    });
    lines.push('');
  }
  if (summary.tours.length) {
    lines.push('Tour:');
    summary.tours.forEach((t) => {
      lines.push(`- ${t.name}: khởi hành ${formatDate(t.date)}, ${t.days} ngày ${t.nights} đêm, ${formatCurrency(t.price)}`);
    });
    lines.push('');
  }
  lines.push(`Tổng tiền: ${formatCurrency(summary.total)}`);
  lines.push(`Thời gian đặt: ${new Date(summary.createdAt).toLocaleString('vi-VN')}`);
  return lines.join('\n');
}

/**
 * EmailService -> EmailJS (nếu được cấu hình window.EMAILJS_CONFIG)
 *              -> mailto fallback
 *              -> Demo mode (console log, không có backend SMTP thật)
 */
export async function sendBookingConfirmationEmail(summary) {
  const body = buildEmailBody(summary);
  const subject = `Xác nhận đặt chỗ TravelViet - ${summary.bookingCode}`;
  const mailtoLink = `mailto:${encodeURIComponent(summary.customer.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  if (window.emailjs && window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.serviceId) {
    try {
      await window.emailjs.send(window.EMAILJS_CONFIG.serviceId, window.EMAILJS_CONFIG.templateId, {
        to_email: summary.customer.email,
        from_email: EMAIL_SENDER,
        subject,
        message: body,
      });
      return { mode: 'emailjs', mailtoLink, body, subject };
    } catch (e) {
      console.warn('[EmailService] Gửi qua EmailJS thất bại, dùng demo mode.', e);
    }
  }

  console.info('[EmailService] Demo mode - email xác nhận booking', {
    from: EMAIL_SENDER,
    to: summary.customer.email,
    subject,
    body,
  });
  return { mode: 'demo', mailtoLink, body, subject };
}
