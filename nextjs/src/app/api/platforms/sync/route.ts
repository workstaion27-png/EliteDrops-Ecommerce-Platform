import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - مزامنة المنتجات من المنصة الفعالة
export async function POST(request: NextRequest) {
  try {
    const { data: settings, error } = await this.supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    if (error) throw error;

    const config = settings?.config;
    const activePlatform = config?.platform;

    if (!activePlatform || activePlatform === 'local') {
      return NextResponse.json(
        { success: false, error: 'المنصة المحلية لا تحتاج لمزامنة' },
        { status: 400 }
      );
    }

    let result;

    if (activePlatform === 'zendrop' && config.zendrop?.apiKey) {
      const { createZendropSync } = await import('@/lib/zendrop-sync');
      
      const { data: supabaseSettings } = await this.supabase
        .from('settings')
        .select('supabase_url, supabase_service_key')
        .single();

      if (!supabaseSettings) {
        return NextResponse.json(
          { success: false, error: 'إعدادات Supabase غير موجودة' },
          { status: 500 }
        );
      }

      const sync = createZendropSync({
        apiKey: config.zendrop.apiKey,
        supabaseUrl: supabaseSettings.supabase_url,
        supabaseServiceKey: supabaseSettings.supabase_service_key,
      });

      result = await sync.syncAllProducts((event) => {
        console.log(`Zendrop Sync: ${event.type}`, event);
      });

      return NextResponse.json({
        success: result.errors === 0,
        message: `مزامنة Zendrop: ${result.synced} منتج، ${result.errors} أخطاء`,
        data: result,
      });
    }

    if (activePlatform === 'appscenic' && config.appscenic?.apiKey) {
      const { createAppScenicSync } = await import('@/lib/appscenic-sync');
      
      const { data: supabaseSettings } = await this.supabase
        .from('settings')
        .select('supabase_url, supabase_service_key')
        .single();

      if (!supabaseSettings) {
        return NextResponse.json(
          { success: false, error: 'إعدادات Supabase غير موجودة' },
          { status: 500 }
        );
      }

      const sync = createAppScenicSync({
        apiKey: config.appscenic.apiKey,
        supabaseUrl: supabaseSettings.supabase_url,
        supabaseServiceKey: supabaseSettings.supabase_service_key,
      });

      result = await sync.syncAllProducts((event) => {
        console.log(`AppScenic Sync: ${event.type}`, event);
      });

      return NextResponse.json({
        success: result.errors === 0,
        message: `مزامنة AppScenic: ${result.synced} منتج، ${result.errors} أخطاء`,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'المنصة غير مُعدّة للمزامنة' },
      { status: 400 }
    );
  } catch (error) {
    console.error('خطأ في المزامنة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل عملية المزامنة' },
      { status: 500 }
    );
  }
}
