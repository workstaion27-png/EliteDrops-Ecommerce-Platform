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
    const { data: settings, error } = await this.supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const defaultConfig = {
      platform: 'local',
      local: { enabled: true },
      zendrop: { enabled: false },
      appscenic: { enabled: false },
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
    const { platform, local, zendrop, appscenic } = body;

    // التحقق من صحة البيانات
    const validPlatforms = ['local', 'zendrop', 'appscenic'];
    if (platform && !validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: 'منصة غير صالحة' },
        { status: 400 }
      );
    }

    // جلب الإعدادات الحالية
    const { data: currentSettings } = await this.supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    const currentConfig = currentSettings?.config || {
      platform: 'local',
      local: { enabled: true },
      zendrop: { enabled: false },
      appscenic: { enabled: false },
    };

    // دمج الإعدادات الجديدة
    const newConfig = {
      ...currentConfig,
      ...(platform && { platform }),
      ...(local && { local }),
      ...(zendrop && { 
        zendrop: { 
          ...currentConfig.zendrop, 
          ...zendrop,
          apiKey: zendrop.apiKey ? '[PROTECTED]' : undefined,
        } 
      }),
      ...(appscenic && { 
        appscenic: { 
          ...currentConfig.appscenic, 
          ...appscenic,
          apiKey: appscenic.apiKey ? '[PROTECTED]' : undefined,
        } 
      }),
      updated_at: new Date().toISOString(),
    };

    // حفظ الإعدادات
    const { error } = await this.supabase
      .from('platform_settings')
      .upsert({
        id: 'default',
        config: newConfig,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'تم تحديث إعدادات المنصات بنجاح',
      data: {
        ...newConfig,
        zendrop: { ...newConfig.zendrop, apiKey: undefined },
        appscenic: { ...newConfig.appscenic, apiKey: undefined },
      },
    });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات المنصات:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث إعدادات المنصات' },
      { status: 500 }
    );
  }
}
