import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, cart_items, buyer_email, buyer_name, buyer_phone } = body;

    if (!amount || !cart_items || cart_items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    const merchant_id = process.env.PAYFAST_MERCHANT_ID!;
    const passphrase = process.env.PAYFAST_PASSPHRASE!;

    const payment_reference = `PAY-${Date.now()}`;

    // Store pending payment
    await supabase.from('pending_payments').insert({
      reference: payment_reference,
      cart_data: cart_items,
      buyer_email,
      buyer_name,
      amount,
      status: 'pending',
    });

    // Build payment data (DO NOT include merchant_key)
    const paymentData: Record<string, string> = {
      merchant_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      notify_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payfast/itn`,
      amount: parseFloat(amount).toFixed(2),
      item_name: `DirectWA Order - ${cart_items.length} item(s)`,
      email_address: buyer_email,
      name_first: buyer_name?.split(' ')[0] || '',
      custom_str1: payment_reference,
    };

    // Generate signature
    const signature = generateSignature(paymentData, passphrase);
    paymentData.signature = signature;

    // Build final query string
    const queryString = new URLSearchParams(paymentData).toString();

    return NextResponse.json({
      success: true,
      payment_url: `https://www.payfast.co.za/eng/process?${queryString}`,
    });
  } catch (error: any) {
    console.error('PayFast initiate error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}

// ==================== IMPROVED SIGNATURE FUNCTION ====================
function generateSignature(data: Record<string, string>, passphrase: string): string {
  // Remove signature if it exists
  const { signature, ...params } = data;

  // Sort keys alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Build signature string with proper encoding
  let signatureString = sortedKeys
    .map(key => {
      const value = params[key];
      if (value === null || value === undefined || value === '') return '';
      // PayFast expects spaces as '+' not '%20'
      return `${key}=${encodeURIComponent(String(value)).replace(/%20/g, '+')}`;
    })
    .filter(Boolean)
    .join('&');

  // Append passphrase
  if (passphrase) {
    signatureString += `&passphrase=${encodeURIComponent(passphrase.trim())}`;
  }

  // Generate MD5 hash
  return crypto.createHash('md5').update(signatureString).digest('hex');
}