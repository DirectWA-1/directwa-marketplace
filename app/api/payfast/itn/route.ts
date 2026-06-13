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

    // Remove signature before generating our own
    const { signature, ...paramsForSignature } = data;

    // Verify signature
    const calculatedSignature = generateSignature(paramsForSignature, passphrase);

    if (calculatedSignature !== receivedSignature) {
      console.error('Invalid PayFast signature');
      return new NextResponse('Invalid signature', { status: 400 });
    }

    // Payment was successful
    if (data.payment_status === 'COMPLETE') {
      const paymentReference = data.custom_str1;
      const amount = parseFloat(data.amount_gross || '0');

      // Update pending payment record
      await supabase
        .from('pending_payments')
        .update({
          status: 'completed',
          payfast_payment_id: data.pf_payment_id,
        })
        .eq('reference', paymentReference);

      // TODO: Create actual order(s) here if needed
      // You can expand this to create records in your orders + escrow tables

      console.log(`Payment successful for reference: ${paymentReference}`);
    }

    // Always respond with "OK" to PayFast
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
      if (value === null || value === undefined || value === '') return '';
      return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`;
    })
    .filter(Boolean)
    .join('&');

  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim())}`;
  }

  return crypto.createHash('md5').update(signatureString).digest('hex');
}