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

    // Verify signature (exclude merchant_key and signature)
    const calculatedSignature = generateSignature(data, passphrase);

    if (calculatedSignature !== receivedSignature) {
      console.error('Invalid PayFast signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Process successful payment
    if (data.payment_status === 'COMPLETE') {
      const paymentReference = data.custom_str1;
      const amount = parseFloat(data.amount_gross || '0');
      const pfPaymentId = data.pf_payment_id;

      // Update pending payment
      await supabase
        .from('pending_payments')
        .update({
          status: 'completed',
          payfast_payment_id: pfPaymentId,
        })
        .eq('reference', paymentReference);

      // Create Order + Escrow record
      const { data: pendingPayment } = await supabase
        .from('pending_payments')
        .select('*')
        .eq('reference', paymentReference)
        .single();

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
          await supabase.from('escrow_transactions').insert({
            order_id: newOrder.id,
            amount: amount,
            status: 'held',
            payment_reference: paymentReference,
            payfast_payment_id: pfPaymentId,
          });
        }
      }

      console.log(`✅ Payment completed for reference: ${paymentReference}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayFast ITN error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

// ==================== SIGNATURE VERIFICATION (Consistent with Initiate) ====================
function generateSignature(data: Record<string, string>, passphrase: string): string {
  // Exclude signature and merchant_key when verifying
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