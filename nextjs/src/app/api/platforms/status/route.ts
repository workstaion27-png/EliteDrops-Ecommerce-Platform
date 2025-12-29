/**
 * Platforms Status API Route - CJ Dropshipping Only
 * واجهة برمجة التطبيقات لحالة المنصة - CJ Dropshipping فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../../lib/types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - التحقق من حالة منصة CJ
export async function GET() {
  try {
    // جلب الإعدادات
    const { data: settings, error } = await supabase
      .from('platform_config')
      .select('config')
      .eq('id', 'default')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const config = settings?.config || {
      platform: 'cj',
      cj: { enabled: true, appKey: '', secretKey: '' },
    };

    // التحقق من حالة CJ
    const status: Record<string, any> = {
      active_platform: config.platform,
      platforms: {},
    };

    // حالة منصة CJ
    if (config.cj?.enabled && config.cj?.appKey && config.cj?.secretKey) {
      // فحص الاتصال بـ CJ API
      const cjConnected = await testCJConnection(config.cj.appKey, config.cj.secretKey);
      
      status.platforms.cj = {
        enabled: true,
        status: cjConnected ? 'active' : 'connection_failed',
        apiKey: true,
        products_count: 0,
      };
    } else if (config.cj?.appKey || config.cj?.secretKey) {
      status.platforms.cj = {
        enabled: true,
        status: 'not_configured',
        apiKey: false,
        products_count: 0,
      };
    } else {
      status.platforms.cj = {
        enabled: false,
        status: 'disabled',
        apiKey: false,
        products_count: 0,
      };
    }

    // جلب عدد منتجات CJ
    const { count: cjCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'cj');
    status.platforms.cj.products_count = cjCount || 0;

    // جلب إجمالي المنتجات (المحلية + CJ)
    const { count: totalCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    status.platforms.local = {
      enabled: true,
      status: 'active',
      products_count: totalCount || 0,
    };

    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('خطأ في فحص حالة المنصة:', error);
    return NextResponse.json(
      { success: false, error: 'فشل فحص حالة المنصة' },
      { status: 500 }
    );
  }
}

/**
 * فحص الاتصال بـ CJ API
 */
async function testCJConnection(appKey: string, secretKey: string): Promise<boolean> {
  try {
    const crypto = require('crypto');
    const timestamp = Date.now();
    const signStr = `appKey${appKey}timestamp${timestamp}`;
    const sign = crypto
      .createHmac('sha256', secretKey)
      .update(signStr)
      .digest('hex');

    const response = await fetch('https://api.cjdropshipping.com/api/v1/member/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-App-Key': appKey,
        'X-Sign': sign,
        'X-Timestamp': timestamp.toString(),
      },
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('CJ Connection Test Error:', error);
    return false;
  }
}
