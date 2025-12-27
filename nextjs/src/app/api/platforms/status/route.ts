import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - التحقق من حالة الاتصال بكل منصة
export async function GET() {
  try {
    const { data: settings, error } = await this.supabase
      .from('platform_settings')
      .select('config')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const config = settings?.config || {
      platform: 'local',
      local: { enabled: true },
      zendrop: { enabled: false },
      appscenic: { enabled: false },
    };

    // التحقق من حالة كل منصة
    const status: Record<string, any> = {
      active_platform: config.platform,
      platforms: {},
    };

    // حالة المنصة المحلية
    status.platforms.local = {
      enabled: config.local?.enabled ?? true,
      status: 'active',
      products_count: 0,
    };

    // جلب عدد المنتجات المحلية
    const { count: localCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'local');
    status.platforms.local.products_count = localCount || 0;

    // التحقق من Zendrop
    if (config.zendrop?.enabled && config.zendrop?.apiKey) {
      try {
        const { createZendropClient } = await import('@/lib/zendrop');
        const zendropClient = createZendropClient(config.zendrop.apiKey);
        const connected = await zendropClient.testConnection();
        
        status.platforms.zendrop = {
          enabled: true,
          status: connected ? 'active' : 'connection_failed',
          apiKey: !!config.zendrop.apiKey,
        };
      } catch {
        status.platforms.zendrop = {
          enabled: true,
          status: 'error',
          apiKey: true,
        };
      }
    } else {
      status.platforms.zendrop = {
        enabled: false,
        status: config.zendrop?.apiKey ? 'not_configured' : 'disabled',
        apiKey: false,
      };
    }

    // جلب عدد منتجات Zendrop
    const { count: zendropCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'zendrop');
    status.platforms.zendrop.products_count = zendropCount || 0;

    // التحقق من AppScenic
    if (config.appscenic?.enabled && config.appscenic?.apiKey) {
      try {
        const { createAppScenicClient } = await import('@/lib/appscenic');
        const appscenicClient = createAppScenicClient(config.appscenic.apiKey);
        const connected = await appscenicClient.testConnection();
        
        status.platforms.appscenic = {
          enabled: true,
          status: connected ? 'active' : 'connection_failed',
          apiKey: !!config.appscenic.apiKey,
        };
      } catch {
        status.platforms.appscenic = {
          enabled: true,
          status: 'error',
          apiKey: true,
        };
      }
    } else {
      status.platforms.appscenic = {
        enabled: false,
        status: config.appscenic?.apiKey ? 'not_configured' : 'disabled',
        apiKey: false,
      };
    }

    // جلب عدد منتجات AppScenic
    const { count: appscenicCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'appscenic');
    status.platforms.appscenic.products_count = appscenicCount || 0;

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('خطأ في فحص حالة المنصات:', error);
    return NextResponse.json(
      { success: false, error: 'فشل فحص حالة المنصات' },
      { status: 500 }
    );
  }
}
