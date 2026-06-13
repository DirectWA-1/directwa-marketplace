import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Missing Supabase environment variables' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await request.json();

    const {
      buyer_id,
      seller_id,
      listing_id,
      amount,
      payment_reference,
      delivery_method = 'delivery',
    } = body;

    if (!buyer_id || !seller_id || !listing_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Order with status 'pending'
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id,
        seller_id,
        listing_id,
        amount,
        status: 'pending',           // ← Changed from 'paid' to 'pending'
        delivery_method,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create Escrow Transaction
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_transactions')
      .insert({
        order_id: order.id,
        amount,
        status: 'held',
      })
      .select()
      .single();

    if (escrowError) {
      console.error('Escrow creation error:', escrowError);
      return NextResponse.json(
        { error: 'Failed to create escrow record', details: escrowError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      escrow,
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}