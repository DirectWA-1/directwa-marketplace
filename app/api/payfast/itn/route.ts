import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const receivedSignature = data.signature;
    const passphrase = process.env.PAYFAST_PASSPHRASE!;

    const calculatedSignature = generateSignature(data, passphrase);

    if (calculatedSignature !== receivedSignature) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    if (data.payment_status === 'COMPLETE') {
      const paymentReference = data.custom_str1;
      const amount = parseFloat(data.amount_gross || '0');
      const buyerEmail = data.email_address;
      const pfPaymentId = data.pf_payment_id;

      // Update pending payment
      await supabase
        .from('pending_payments')
        .update({ status: 'completed', payfast_payment_id: pfPaymentId })
        .eq('reference', paymentReference);

      // Create Order + Escrow
      const { data: pendingPayment } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('reference', paymentReference)
        .single();

      let orderId = null;

      if (pendingPayment) {
        const { data: newOrder } = await supabase
          .from('orders')
          .insert({
            buyer_id: pendingPayment.user_id,
            total_amount: amount,
            payment_method: 'payfast',
            payment_reference: paymentReference,
            payfast_payment_id: pfPaymentId,
            status: 'paid',
          })
          .select()
          .single();

        if (newOrder) {
          orderId = newOrder.id;
          await supabase.from('escrow_transactions').insert({
            order_id: newOrder.id,
            amount: amount,
            status: 'held',
            payment_reference: paymentReference,
            payfast_payment_id: pfPaymentId,
          });
        }
      }

      // ==================== SEND EMAIL ====================
      if (buyerEmail) {
        try {
          await resend.emails.send({
            from: 'DirectWA <noreply@yourdomain.com>', // Change to your verified domain
            to: buyerEmail,
            subject: 'Payment Successful - Order Confirmation',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1E3A5F;">Thank you for your payment!</h2>
                
                <p>Your payment of <strong>R${amount}</strong> has been received successfully.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Order Reference:</strong> ${paymentReference}</p>
                  <p><strong>PayFast Payment ID:</strong> ${pfPaymentId}</p>
                  ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
                </div>

                <p>We will process your order shortly. You will receive another email when your items are shipped.</p>
                
                <p style="margin-top: 30px;">
                  Best regards,<br>
                  <strong>The DirectWA Team</strong>
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
        }
      }

      console.log(`✅ Payment + Email sent for: ${paymentReference}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const { signature, merchant_key, ...params } = data;
  const sortedKeys = Object.keys(params).sort();

  let signatureString = sortedKeys
    .map(key => {
      const value = params[key];
      if (!value) return '';
      return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`;
    })
    .filter(Boolean)
    .join('&');

  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim())}`;
  }

  return crypto.createHash('md5').update(signatureString).digest('hex');
}