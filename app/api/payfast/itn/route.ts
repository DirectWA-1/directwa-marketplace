import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => (data[key] = value));

    if (data.payment_status !== 'COMPLETE') {
      return NextResponse.json({ success: true });
    }

    const reference = data.custom_str1;

    // Get the pending payment data
    const { data: pending } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('reference', reference)
      .single();

    if (!pending) {
      console.error('Pending payment not found');
      return NextResponse.json({ success: false });
    }

    const cartItems = pending.cart_data;

    // Group by seller
    const bySeller: any = {};
    cartItems.forEach((item: any) => {
      const sid = item.seller_id || 'unknown';
      if (!bySeller[sid]) bySeller[sid] = [];
      bySeller[sid].push(item);
    });

    // Create order + escrow per seller
    for (const sellerId of Object.keys(bySeller)) {
      const items = bySeller[sellerId];
      const sellerTotal = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

      // Create Order
      const { data: order } = await supabase
        .from('orders')
        .insert({
          buyer_id: 'guest-user',
          seller_id: sellerId,
          listing_id: items[0].id,
          amount: sellerTotal,
          status: 'paid',
          delivery_method: 'delivery',
        })
        .select()
        .single();

      if (order) {
        // Create Escrow
        await supabase.from('escrow_transactions').insert({
          order_id: order.id,
          amount: sellerTotal,
          status: 'held',
        });
      }
    }

    // Mark pending payment as completed
    await supabase
      .from('pending_payments')
      .update({ status: 'completed' })
      .eq('reference', reference);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ITN Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}