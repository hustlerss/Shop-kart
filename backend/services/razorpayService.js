import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load env explicitly at the top to secure immediate parsing
dotenv.config();

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;
  
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (key_id && key_secret) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
    console.log('Razorpay initialized successfully for live transactions.');
    return razorpayInstance;
  }
  return null;
};

export const createRazorpayOrder = async (amountInINR, receiptId) => {
  const amountInPaise = Math.round(amountInINR * 100);
  const rzp = getRazorpayInstance();

  if (rzp) {
    try {
      const order = await rzp.orders.create({
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

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_secret) {
    try {
      const text = razorpayOrderId + '|' + razorpayPaymentId;
      const generated_signature = crypto
        .createHmac('sha256', key_secret)
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
