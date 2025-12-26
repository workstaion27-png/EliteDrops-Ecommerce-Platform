import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - جلب القوالب
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const trigger_event = searchParams.get('trigger_event');
    const is_active = searchParams.get('is_active');

    let query = supabase
      .from('notification_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (channel) query = query.eq('channel', channel);
    if (trigger_event) query = query.eq('trigger_event', trigger_event);
    if (is_active) query = query.eq('is_active', is_active === 'true');

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('خطأ في جلب القوالب:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب القوالب' },
      { status: 500 }
    );
  }
}

// POST - إنشاء قالب جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      channel,
      trigger_event,
      subject,
      body_content,
      is_active,
    } = body;

    if (!name || !channel || !trigger_event || !body_content) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير مكتملة' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notification_templates')
      .insert({
        name,
        description,
        channel,
        trigger_event,
        subject,
        body_content,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('خطأ في إنشاء القالب:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء القالب' },
      { status: 500 }
    );
  }
}

// PUT - تحديث قالب
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف القالب مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notification_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('خطأ في تحديث القالب:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث القالب' },
      { status: 500 }
    );
  }
}

// DELETE - حذف قالب
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف القالب مطلوب' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notification_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'تم حذف القالب' });
  } catch (error) {
    console.error('خطأ في حذف القالب:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف القالب' },
      { status: 500 }
    );
  }
}
