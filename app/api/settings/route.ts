import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { storeName, storePhone, storeEmail, storeAddress, taxRate, shippingCost, currency } = body;

    // Get or create settings record
    const { data: existingSettings } = await supabaseAdmin
      .from('website_settings')
      .select('*')
      .eq('id', '1')
      .single();

    let settings;

    if (existingSettings) {
      const { data, error } = await supabaseAdmin
        .from('website_settings')
        .update({
          store_name: storeName,
          store_phone: storePhone,
          store_email: storeEmail,
          store_address: storeAddress,
          tax_rate: taxRate,
          shipping_cost: shippingCost,
          currency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', '1')
        .select()
        .single();

      if (error) throw error;
      settings = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('website_settings')
        .insert({
          id: '1',
          store_name: storeName,
          store_phone: storePhone,
          store_email: storeEmail,
          store_address: storeAddress,
          tax_rate: taxRate,
          shipping_cost: shippingCost,
          currency,
        })
        .select()
        .single();

      if (error) throw error;
      settings = data;
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { data: settings } = await supabaseAdmin
      .from('website_settings')
      .select('*')
      .eq('id', '1')
      .single();

    if (!settings) {
      return NextResponse.json({
        id: '1',
        store_name: 'Rich Shakes',
        store_phone: '+505 1234 5678',
        store_email: 'info@richshakes.ni',
        store_address: 'Managua, Nicaragua',
        tax_rate: 15,
        shipping_cost: 50,
        currency: 'NIO',
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
