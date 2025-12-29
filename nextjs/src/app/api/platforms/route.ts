/**
 * Platforms API Route - CJ Dropshipping Only
 * واجهة برمجة التطبيقات للمنصات - CJ Dropshipping فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';

// تهيئة Supabase
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - جلب إعدادات المنصات
export async function GET() {
  try {
    const { data: settings, error } = await supabase
      .from('platform_config')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const defaultConfig = {
      platform: 'cj',
      cj: { 
        enabled: true, 
        appKey: '', 
        secretKey: '' 
      },
    };

    return NextResponse.json({
      success: true,
      data: settings?.config || defaultConfig,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'فشل جلب إعدادات المنصات' },
      { status: 500 }
    );
  }
}

// PUT - تحديث إعدادات المنصات
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, cj } = body;

    // التحقق من صحة البيانات
    const validPlatforms = ['local', 'cj'];
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'منصة غير صالحة' },
        { status: 400 }
      );
    }

    // جلب الإعدادات الحالية
    const { data: currentSettings } = await supabase
      .from('platform_config')
      .select('config')
      .eq('id', 'default')
      .single();

    const currentConfig = currentSettings?.config || {
      platform: 'cj',
      cj: { enabled: true, appKey: '', secretKey: '' },
    };

    // دمج الإعدادات الجديدة
    const newConfig = {
      ...currentConfig,
      ...(platform && { platform }),
      ...(cj && { 
        cj: { 
          ...currentConfig.cj, 
          ...cj,
          // إخفاء مفاتيح API في الاستجابة
          appKey: cj.appKey ? '[PROTECTED]' : currentConfig.cj.appKey,
          secretKey: cj.secretKey ? '[PROTECTED]' : currentConfig.cj.secretKey,
        } 
      }),
      updated_at: new Date().toISOString(),
    };

    // حفظ الإعدادات
    const { error } = await supabase
      .from('platform_config')
      .upsert({
        id: 'default',
        config: newConfig,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'تم تحديث إعدادات المنصة بنجاح',
      data: {
        ...newConfig,
        cj: { ...newConfig.cj, appKey: '', secretKey: '' },
      },
    });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات المنصة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث إعدادات المنصة' },
      { status: 500 }
    );
  }
}
