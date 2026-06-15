import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

type PayFastFields = Record<string, string>;

function encodePayFastValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

function generatePayFastSignature(data: PayFastFields, passphrase?: string) {
  const entries = Object.entries(data).filter(
    ([key, value]) =>
      key !== 'signature' &&
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
  );

  const payload = entries
    .map(([key, value]) => `${key}=${encodePayFastValue(String(value).trim())}`)
    .join('&');

  const signatureString =
    passphrase && passphrase.trim() !== ''
      ? `${payload}&passphrase=${encodePayFastValue(passphrase.trim())}`
      : payload;

  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: PayFastFields = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const receivedSignature = data.signature || '';
    const passphrase = process.env.PAYFAST_PASSPHRASE || '';

    const calculatedSignature = generatePayFastSignature(data, passphrase);

    if (!receivedSignature || calculatedSignature !== receivedSignature) {
      console.error('PayFast ITN signature mismatch', {
        receivedSignature,
        calculatedSignature,
        data,
      });

      return new NextResponse('Invalid signature', { status: 400 });
    }

    const paymentReference = data.custom_str1 || data.m_payment_id || '';
    const pfPaymentId = data.pf_payment_id || '';
    const paymentStatus = data.payment_status || '';
    const amountGross = Number(data.amount_gross || '0');
    const buyerEmail = data.email_address || '';

    if (!paymentReference) {
      return new NextResponse('Missing payment reference', { status: 400 });
    }

    const { data: pendingPayment, error: pendingPaymentError } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('reference', paymentReference)
      .single();

    if (pendingPaymentError || !pendingPayment) {
      console.error('Pending payment not found for ITN', {
        paymentReference,
        pendingPaymentError,
      });

      return new NextResponse('Pending payment not found', { status: 404 });
    }

    const expectedAmount = Number(pendingPayment.amount || 0);

    if (Number(expectedAmount.toFixed(2)) !== Number(amountGross.toFixed(2))) {
      console.error('PayFast ITN amount mismatch', {
        paymentReference,
        expectedAmount,
        amountGross,
      });

      return new NextResponse('Amount mismatch', { status: 400 });
    }

    if (paymentStatus !== 'COMPLETE') {
      await supabase
        .from('pending_payments')
        .update({
          status: paymentStatus.toLowerCase(),
          payfast_payment_id: pfPaymentId || null,
        })
        .eq('reference', paymentReference);

      return new NextResponse('OK', { status: 200 });
    }

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_reference', paymentReference)
      .maybeSingle();

    if (existingOrder) {
      await supabase
        .from('pending_payments')
        .update({
          status: 'completed',
          payfast_payment_id: pfPaymentId || null,
        })
        .eq('reference', paymentReference);

      return new NextResponse('OK', { status: 200 });
    }

    await supabase
      .from('pending_payments')
      .update({
        status: 'completed',
        payfast_payment_id: pfPaymentId || null,
      })
      .eq('reference', paymentReference);

    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: pendingPayment.user_id,
        total_amount: amountGross,
        payment_method: 'payfast',
        payment_reference: paymentReference,
        payfast_payment_id: pfPaymentId,
        status: 'paid',
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      console.error('Failed to create order from ITN', orderError);
      return new NextResponse('Failed to create order', { status: 500 });
    }

    const { data: existingEscrow } = await supabase
      .from('escrow_transactions')
      .select('id')
      .eq('order_id', newOrder.id)
      .maybeSingle();

    if (!existingEscrow) {
      await supabase.from('escrow_transactions').insert({
        order_id: newOrder.id,
        amount: amountGross,
        status: 'held',
        payment_reference: paymentReference,
        payfast_payment_id: pfPaymentId,
      });
    }

    if (buyerEmail) {
      try {
        await resend.emails.send({
          from: 'DirectWA <noreply@yourdomain.com>',
          to: buyerEmail,
          subject: 'Payment Successful - Order Confirmation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1E3A5F;">Thank you for your payment!</h2>

              <p>Your payment of <strong>R${amountGross.toFixed(2)}</strong> has been received successfully.</p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order Reference:</strong> ${paymentReference}</p>
                <p><strong>PayFast Payment ID:</strong> ${pfPaymentId}</p>
                <p><strong>Order ID:</strong> ${newOrder.id}</p>
              </div>

              <p>We will process your order shortly. You will receive another email when your items are shipped.</p>

              <p style="margin-top: 30px;">
                Best regards,<br />
                <strong>The DirectWA Team</strong>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    console.log(`Payment completed for reference: ${paymentReference}`);

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
