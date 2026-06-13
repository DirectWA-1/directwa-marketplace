import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const receivedSignature = data.signature;
    const passphrase = process.env.PAYFAST_PASSPHRASE!;

    // Remove signature before verification
    const { signature, ...paramsForSignature } = data;
    const calculatedSignature = generateSignature(paramsForSignature, passphrase);

    if (calculatedSignature !== receivedSignature) {
      console.error('Invalid PayFast signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Only process successful payments
    if (data.payment_status === 'COMPLETE') {
      const paymentReference = data.custom_str1; // e.g. PAY-1234567890
      const amount = parseFloat(data.amount_gross || '0');
      const buyerEmail = data.email_address;
      const pfPaymentId = data.pf_payment_id;

      // 1. Update pending_payments status
      await supabase
        .from('pending_payments')
        .update({
          status: 'completed',
          payfast_payment_id: pfPaymentId,
        })
        .eq('reference', paymentReference);

      // 2. Create Order + Escrow record
      // You can expand this logic based on your cart structure
      const { data: pendingPayment } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('reference', paymentReference)
        .single();

      if (pendingPayment) {
        // Create main order
        const { data: newOrder } = await supabase
          .from('orders')
          .insert({
            buyer_id: pendingPayment.buyer_id || null, // You may need to store this earlier
            total_amount: amount,
            payment_method: 'payfast',
            payment_reference: paymentReference,
            payfast_payment_id: pfPaymentId,
            status: 'paid',
          })
          .select()
          .single();

        if (newOrder) {
          // Create escrow transaction
          await supabase.from('escrow_transactions').insert({
            order_id: newOrder.id,
            amount: amount,
            status: 'held',           // Money is held in escrow
            payment_reference: paymentReference,
            payfast_payment_id: pfPaymentId,
          });
        }
      }

      console.log(`✅ Payment successful. Order + Escrow created for: ${paymentReference}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

function generateSignature(data: Record<string, string>, passphrase: string): string {
  const sortedKeys = Object.keys(data).sort();

  let signatureString = sortedKeys
    .map(key => {
      const value = data[key];
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