import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type PayfastData = Record<string, string>;

function encodePayFast(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

function generatePayFastSignature(data: PayfastData, passphrase?: string) {
  const orderedKeys = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'notify_url',
    'name_first',
    'name_last',
    'email_address',
    'm_payment_id',
    'amount',
    'item_name',
    'item_description',
    'custom_str1',
    'custom_str2',
    'custom_str3',
    'custom_str4',
    'custom_str5',
  ];

  const signatureBase = orderedKeys
    .filter((key) => {
      const value = data[key];
      return value !== undefined && value !== null && String(value).trim() !== '';
    })
    .map((key) => `${key}=${encodePayFast(String(data[key]).trim())}`)
    .join('&');

  const finalString =
    passphrase && passphrase.trim() !== ''
      ? `${signatureBase}&passphrase=${encodePayFast(passphrase.trim())}`
      : signatureBase;

  return crypto.createHash('md5').update(finalString).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, cart_items, buyer_email, buyer_name, user_id } = body;

    if (!amount || !cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return NextResponse.json({ error: 'Invalid cart data' }, { status: 400 });
    }

    const merchant_id = process.env.PAYFAST_MERCHANT_ID;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!merchant_id || !merchant_key || !siteUrl) {
      return NextResponse.json(
        { error: 'Missing PayFast configuration' },
        { status: 500 }
      );
    }

    const payment_reference = `PAY-${Date.now()}`;
    const formattedAmount = Number(amount).toFixed(2);

    const firstName = buyer_name?.trim()?.split(' ')[0] || 'Customer';
    const lastName =
      buyer_name?.trim()?.split(' ').slice(1).join(' ') || 'DirectWA Buyer';

    const { error: insertError } = await supabase.from('pending_payments').insert({
      reference: payment_reference,
      user_id: user_id || null,
      buyer_email: buyer_email || null,
      buyer_name: buyer_name || null,
      amount: Number(formattedAmount),
      cart_items,
      status: 'pending',
    });

    if (insertError) {
      console.error('Pending payment insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create pending payment' },
        { status: 500 }
      );
    }

    const paymentData: PayfastData = {
      merchant_id,
      merchant_key,
      return_url: `${siteUrl}/payment/success`,
      cancel_url: `${siteUrl}/checkout`,
      notify_url: `${siteUrl}/api/payfast/itn`,
      name_first: firstName,
      name_last: lastName,
      email_address: buyer_email || '',
      m_payment_id: payment_reference,
      amount: formattedAmount,
      item_name: `DirectWA Order - ${cart_items.length} item(s)`,
      item_description: `DirectWA marketplace order ${payment_reference}`,
      custom_str1: payment_reference,
    };

    const signature = generatePayFastSignature(paymentData, passphrase);

    return NextResponse.json({
      success: true,
      payment_url: '[payfast.co.za](https://www.payfast.co.za/eng/process)',
      payment_data: {
        ...paymentData,
        signature,
      },
      reference: payment_reference,
    });
  } catch (error) {
    console.error('PayFast initiate error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
