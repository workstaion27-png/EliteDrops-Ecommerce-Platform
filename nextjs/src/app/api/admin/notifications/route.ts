/**
 * Admin Notifications API
 * واجهة برمجة التطبيقات لإدارة إشعارات لوحة التحكم
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';

const supabase = createClient<Database>();

// GET - جلب الإشعارات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const isRead = searchParams.get('is_read');
    const priority = searchParams.get('priority');

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    // تطبيق الفلاتر
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (isRead !== null && isRead !== '') {
      query = query.eq('is_read', isRead === 'true');
    }
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // جلب عدد الإشعارات غير المقروءة
    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      unreadCount: unreadCount || 0,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'فشل جلب الإشعارات' },
      { status: 500 }
    );
  }
}

// POST - إنشاء إشعار جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type = 'system',
      priority = 'normal',
      link,
      related_entity_id,
      recipient_id,
      metadata,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'عنوان الإشعار مطلوب' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        title,
        message,
        type,
        priority,
        link,
        related_entity_id,
        recipient_id,
        metadata,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'تم إنشاء الإشعار بنجاح',
    });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'فشل إنشاء الإشعار' },
      { status: 500 }
    );
  }
}

// PATCH - تحديث الإشعارات (تعيين كمقروءة)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, action } = body;

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { success: false, error: 'معرفات الإشعارات مطلوبة' },
        { status: 400 }
      );
    }

    let error;

    if (action === 'mark_read') {
      // تعيين كمقروءة
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .in('id', ids);

      error = updateError;
    } else if (action === 'mark_unread') {
      // تعيين كغير مقروءة
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: false })
        .in('id', ids);

      error = updateError;
    } else if (action === 'mark_all_read') {
      // تعيين جميع الإشعارات كمقروءة
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      error = updateError;
    } else {
      return NextResponse.json(
        { success: false, error: 'إجراء غير صالح' },
        { status: 400 }
      );
    }

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'mark_all_read' 
        ? 'تم تعيين جميع الإشعارات كمقروءة' 
        : 'تم تحديث الإشعارات بنجاح',
    });
  } catch (error: any) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث الإشعارات' },
      { status: 500 }
    );
  }
}

// DELETE - حذف الإشعارات
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',').filter(Boolean);

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'معرفات الإشعارات مطلوبة' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .in('id', ids);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `تم حذف ${ids.length} إشعار بنجاح`,
    });
  } catch (error: any) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'فشل حذف الإشعارات' },
      { status: 500 }
    );
  }
}
