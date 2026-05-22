import Razorpay from 'razorpay';
import crypto from 'crypto';

const isRazorpayConfigured = !!(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
);

let razorpayInstance = null;

if (isRazorpayConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.log('Razorpay credentials missing. Using Mock Payment Gateway fallback.');
}

export const createRazorpayOrder = async (amountInINR, receiptId) => {
  const amountInPaise = Math.round(amountInINR * 100);

  if (isRazorpayConfigured && razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId || `receipt_${Date.now()}`,
      });
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        mock: false,
      };
    } catch (error) {
      console.error('Razorpay Order Creation failed, falling back to mock order:', error);
    }
  }

  // Fallback / Mock mode order creation
  const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
  return {
    success: true,
    orderId: mockOrderId,
    amount: amountInPaise,
    currency: 'INR',
    mock: true,
  };
};

export const verifyRazorpayPayment = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  if (razorpayOrderId.startsWith('order_mock_')) {
    // Mock validation success
    return true;
  }

  if (isRazorpayConfigured) {
    try {
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      return generated_signature === razorpaySignature;
    } catch (error) {
      console.error('Razorpay Signature Verification error:', error);
      return false;
    }
  }

  return false;
};
