'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Globe,
  Package,
} from 'lucide-react';

interface PlatformConfig {
  platform: string;
  local: { enabled: boolean };
  zendrop: { enabled: boolean; apiKey?: string };
  appscenic: { enabled: boolean; apiKey?: string };
}

interface PlatformStatus {
  active_platform: string;
  platforms: {
    local: { enabled: boolean; status: string; products_count: number };
    zendrop: { enabled: boolean; status: string; apiKey?: boolean; products_count: number };
    appscenic: { enabled: boolean; status: string; apiKey?: boolean; products_count: number };
  };
}

interface SyncResult {
  synced: number;
  errors: number;
}

export default function PlatformsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'products'>('settings');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
  }, []);

  // جلب الإعدادات وحالة المنصات
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [configRes, statusRes] = await Promise.all([
        fetch('/api/platforms'),
        fetch('/api/platforms/status'),
      ]);

      const configData = await configRes.json();
      const statusData = await statusRes.json();

      if (configData.success) setConfig(configData.data);
      if (statusData.success) setStatus(statusData.data);
    } catch (error) {
      showNotification('error', 'فشل جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  // عرض أيقونة المنصة
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'local':
        return <Database className="w-6 h-6 text-blue-500" />;
      case 'zendrop':
        return <Package className="w-6 h-6 text-purple-500" />;
      case 'appscenic':
        return <Globe className="w-6 h-6 text-green-500" />;
      default:
        return <Settings className="w-6 h-6 text-gray-500" />;
    }
  };

  // عرض حالة المنصة
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 ml-1" />
            نشط
          </span>
        );
      case 'connection_failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 ml-1" />
            فشل الاتصال
          </span>
        );
      case 'not_configured':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 ml-1" />
            غير مُعدّ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            معطّل
          </span>
        );
    }
  };

  // حفظ الإعدادات
  const saveConfig = async (updates: Partial<PlatformConfig>) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
        showNotification('success', 'تم حفظ الإعدادات بنجاح');
        fetchData();
      } else {
        showNotification('error', data.error || 'فشل حفظ الإعدادات');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // تفعيل منصة
  const enablePlatform = async (platform: 'zendrop' | 'appscenic', apiKey?: string) => {
    await saveConfig({
      [platform]: { enabled: true, ...(apiKey && { apiKey }) },
    });
  };

  // تعطيل منصة
  const disablePlatform = async (platform: 'zendrop' | 'appscenic') => {
    await saveConfig({
      [platform]: { enabled: false },
    });
  };

  // تعيين المنصة الفعالة
  const setActivePlatform = async (platform: 'local' | 'zendrop' | 'appscenic') => {
    await saveConfig({ platform });
  };

  // مزامنة المنتجات
  const syncProducts = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);

      const response = await fetch('/api/platforms/sync', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSyncResult(data.data);
        showNotification('success', data.message);
        fetchData();
      } else {
        showNotification('error', data.error || 'فشل المزامنة');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء المزامنة');
    } finally {
      setSyncing(false);
    }
  };

  // عرض إشعار
  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* العنوان والإشعارات */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 ml-3 text-blue-600" />
            إدارة منصات الدروبشيبنج
          </h1>
          <p className="mt-2 text-gray-600">
            اختر منصة الدروبشيبنج المناسبة لك وأدير إعداداتها
          </p>
        </div>

        {/* الإشعار */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 ml-2" />
            ) : (
              <XCircle className="w-5 h-5 ml-2" />
            )}
            {notification.message}
          </div>
        )}

        {/* نتائج المزامنة */}
        {syncResult && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">نتيجة المزامنة</h3>
            <div className="flex gap-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                <span className="text-green-700">نجح: {syncResult.synced}</span>
              </div>
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 ml-2" />
                <span className="text-red-700">أخطاء: {syncResult.errors}</span>
              </div>
            </div>
          </div>
        )}

        {/* التبويبات */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              الإعدادات
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              المنتجات ({status?.platforms.local.products_count || 0} محلية،{' '}
              {status?.platforms.zendrop.products_count || 0} Zendrop،{' '}
              {status?.platforms.appscenic.products_count || 0} AppScenic)
            </button>
          </nav>
        </div>

        {/* محتوى التبويب */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* اختيار المنصة الفعالة */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">المنصة الفعالة</h2>
                <p className="mt-1 text-sm text-gray-500">
                  حدد المنصة التي سيتم استخدامها لإدارة المنتجات والطلبات
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'local', name: 'المنتجات المحلية', description: 'إدارة المنتجات يدوياً' },
                    { id: 'zendrop', name: 'Zendrop', description: 'مزامنة من Zendrop' },
                    { id: 'appscenic', name: 'AppScenic', description: 'مزامنة من AppScenic' },
                  ].map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setActivePlatform(platform.id as any)}
                      className={`relative px-6 py-4 border-2 rounded-lg text-left transition-all ${
                        config?.platform === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getPlatformIcon(platform.id)}
                          <div className="mr-3">
                            <h3 className="text-sm font-medium text-gray-900">{platform.name}</h3>
                            <p className="text-xs text-gray-500">{platform.description}</p>
                          </div>
                        </div>
                        {config?.platform === platform.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* إعدادات Zendrop */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-purple-500 ml-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">إعدادات Zendrop</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      منصة دروبشيبنج متخصصة مع موردين من أمريكا وأوروبا
                    </p>
                  </div>
                </div>
                {getStatusBadge(status?.platforms.zendrop.status || 'disabled')}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">تفعيل Zendrop</span>
                  <button
                    onClick={() => 
                      status?.platforms.zendrop.enabled 
                        ? disablePlatform('zendrop')
                        : enablePlatform('zendrop')
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      status?.platforms.zendrop.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        status?.platforms.zendrop.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {status?.platforms.zendrop.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مفتاح API
                    </label>
                    <input
                      type="password"
                      placeholder="أدخل مفتاح API الخاص بـ Zendrop"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        if (e.target.value.length > 10) {
                          enablePlatform('zendrop', e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* إعدادات AppScenic */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-green-500 ml-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">إعدادات AppScenic</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      منصة دروبشيبنج تعتمد على الذكاء الاصطناعي
                    </p>
                  </div>
                </div>
                {getStatusBadge(status?.platforms.appscenic.status || 'disabled')}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">تفعيل AppScenic</span>
                  <button
                    onClick={() => 
                      status?.platforms.appscenic.enabled 
                        ? disablePlatform('appscenic')
                        : enablePlatform('appscenic')
                    }
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      status?.platforms.appscenic.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        status?.platforms.appscenic.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {status?.platforms.appscenic.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مفتاح API
                    </label>
                    <input
                      type="password"
                      placeholder="أدخل مفتاح API الخاص بـ AppScenic"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        if (e.target.value.length > 10) {
                          enablePlatform('appscenic', e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* زر المزامنة */}
            {config?.platform !== 'local' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">مزامنة المنتجات</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      جلب وتحديث المنتجات من المنصة المحددة
                    </p>
                  </div>
                  <button
                    onClick={syncProducts}
                    disabled={syncing}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ml-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'جاري المزامنة...' : 'مزامنة الآن'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <Database className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="text-2xl font-bold text-blue-900">
                  {status?.platforms.local.products_count || 0}
                </h3>
                <p className="text-sm text-blue-700">منتج محلي</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <Package className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="text-2xl font-bold text-purple-900">
                  {status?.platforms.zendrop.products_count || 0}
                </h3>
                <p className="text-sm text-purple-700">منتج من Zendrop</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <Globe className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="text-2xl font-bold text-green-900">
                  {status?.platforms.appscenic.products_count || 0}
                </h3>
                <p className="text-sm text-green-700">منتج من AppScenic</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
