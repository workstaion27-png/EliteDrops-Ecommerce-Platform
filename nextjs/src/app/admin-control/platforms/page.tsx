/**
 * CJ Dropshipping Platform Management Page
 * صفحة إدارة منصة CJ Dropshipping مع الذكاء الاصطناعي
 * نظام إضافة المنتجات تلقائياً بالذكاء الاصطناعي
 */

'use client';

import { useState, useEffect, useCallback } from 'react'; 
import { 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Package,
  Cpu,
  Zap,
  TrendingUp,
  Target,
  Plus,
  Trash2,
} from 'lucide-react';

import { createClient } from '@/lib/supabase';
import type { Database as DB } from '../../../lib/types/supabase';

interface PlatformConfig {
  platform: string;
  cj: { 
    enabled: boolean; 
    apiKey?: string;
    appKey?: string;
    secretKey?: string;
  };
}

interface PlatformStatus {
  active_platform: string;
  platforms: {
    cj: { 
      enabled: boolean; 
      status: string; 
      apiKey?: boolean; 
      products_count: number 
    };
  };
}

interface SyncResult {
  synced: number;
  errors: number;
  imported: number;
  rejected: number;
}

interface AIConfig {
  enabled: boolean;
  keywords: string[];
  minProfitMargin: number;
  maxDailyImports: number;
  autoApproveScore: number;
  excludeWords: string[];
}

interface AIImportResult {
  success: boolean;
  imported_count: number;
  rejected_count: number;
  results: Array<{
    product_id: string;
    title: string;
    score: number;
    decision: string;
  }>;
}

export default function PlatformsPage() {
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [aiResult, setAIResult] = useState<AIImportResult | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'products' | 'ai'>('settings');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // AI Configuration State
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    enabled: false,
    keywords: [],
    minProfitMargin: 30,
    maxDailyImports: 5,
    autoApproveScore: 80,
    excludeWords: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [newExcludeWord, setNewExcludeWord] = useState('');
  
  const supabase = createClient();

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchData();
    fetchAIConfig();
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

  // جلب إعدادات الذكاء الاصطناعي
  const fetchAIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_product_config')
        .select('*')
        .single();

      if (data && !error) {
        setAIConfig({
          enabled: data.enabled || false,
          keywords: data.keywords || [],
          minProfitMargin: data.min_profit_margin || 30,
          maxDailyImports: data.max_daily_imports || 5,
          autoApproveScore: data.auto_approve_score || 80,
          excludeWords: data.exclude_words || [],
        });
      }
    } catch (error) {
      console.log('لم يتم العثور على إعدادات AI سابقة');
    }
  };

  // حفظ إعدادات الذكاء الاصطناعي
  const saveAIConfig = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('ai_product_config')
        .upsert({
          id: 'default',
          enabled: aiConfig.enabled,
          keywords: aiConfig.keywords,
          min_profit_margin: aiConfig.minProfitMargin,
          max_daily_imports: aiConfig.maxDailyImports,
          auto_approve_score: aiConfig.autoApproveScore,
          exclude_words: aiConfig.excludeWords,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      showNotification('success', 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح');
    } catch (error) {
      showNotification('error', 'فشل حفظ إعدادات الذكاء الاصطناعي');
    } finally {
      setSaving(false);
    }
  };

  // إضافة كلمة مفتاحية
  const addKeyword = () => {
    if (newKeyword.trim() && !aiConfig.keywords.includes(newKeyword.trim())) {
      setAIConfig({
        ...aiConfig,
        keywords: [...aiConfig.keywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  // إزالة كلمة مفتاحية
  const removeKeyword = (keyword: string) => {
    setAIConfig({
      ...aiConfig,
      keywords: aiConfig.keywords.filter(k => k !== keyword),
    });
  };

  // إضافة كلمة استبعاد
  const addExcludeWord = () => {
    if (newExcludeWord.trim() && !aiConfig.excludeWords.includes(newExcludeWord.trim())) {
      setAIConfig({
        ...aiConfig,
        excludeWords: [...aiConfig.excludeWords, newExcludeWord.trim()],
      });
      setNewExcludeWord('');
    }
  };

  // إزالة كلمة استبعاد
  const removeExcludeWord = (word: string) => {
    setAIConfig({
      ...aiConfig,
      excludeWords: aiConfig.excludeWords.filter(w => w !== word),
    });
  };

  // تشغيل الذكاء الاصطناعي لإضافة المنتجات
  const runAIImport = async () => {
    try {
      setAiRunning(true);
      setAIResult(null);

      const response = await fetch('/api/cj/ai-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: aiConfig.keywords,
          minProfitMargin: aiConfig.minProfitMargin,
          maxProducts: aiConfig.maxDailyImports,
          minScore: aiConfig.autoApproveScore,
          excludeWords: aiConfig.excludeWords,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAIResult(data);
        showNotification('success', `تم تحليل ${data.total_analyzed} منتج، تم إضافة ${data.imported_count} منتج`);
        fetchData();
      } else {
        showNotification('error', data.error || 'فشل عملية الإضافة التلقائية');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء تشغيل الذكاء الاصطناعي');
    } finally {
      setAiRunning(false);
    }
  };

  // حفظ إعدادات CJ
  const saveCJConfig = async (updates: { appKey?: string; secretKey?: string }) => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/platforms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cj: { 
            enabled: true,
            ...config?.cj,
            ...updates
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(data.data);
        showNotification('success', 'تم حفظ إعدادات CJ بنجاح');
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
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // عرض أيقونة المنصة
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'cj':
        return <Package className="w-6 h-6 text-orange-500" />;
      case 'local':
        return <Database className="w-6 h-6 text-blue-500" />;
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
            <Package className="w-8 h-8 ml-3 text-orange-500" />
            منصة CJ Dropshipping
          </h1>
          <p className="mt-2 text-gray-600">
            إدارة منصة CJ Dropshipping وإضافة المنتجات تلقائياً بالذكاء الاصطناعي
          </p>
        </div>

        {/* الإشعار */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 ml-2" />
            ) : notification.type === 'error' ? (
              <XCircle className="w-5 h-5 ml-2" />
            ) : (
              <Zap className="w-5 h-5 ml-2" />
            )}
            {notification.message}
          </div>
        )}

        {/* التبويبات */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات المنصة
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              المنتجات ({status?.platforms.cj.products_count || 0} من CJ)
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ai'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Cpu className="w-4 h-4 ml-1 inline" />
              الذكاء الاصطناعي
            </button>
          </nav>
        </div>

        {/* محتوى التبويب - الإعدادات */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* إعدادات CJ */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-orange-500 ml-3" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">إعدادات CJDropshipping</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      منصة دروبشيبنج صينية رائدة مع منتجات عالية الجودة
                    </p>
                  </div>
                </div>
                {getStatusBadge(status?.platforms.cj.status || 'disabled')}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Key (مفتاح التطبيق)
                  </label>
                  <input
                    type="text"
                    defaultValue={config?.cj?.appKey || ''}
                    placeholder="أدخل App Key من CJ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    onBlur={(e) => {
                      if (e.target.value !== config?.cj?.appKey) {
                        saveCJConfig({ appKey: e.target.value });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key (المفتاح السري)
                  </label>
                  <input
                    type="password"
                    defaultValue={config?.cj?.secretKey || ''}
                    placeholder="أدخل Secret Key من CJ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    onBlur={(e) => {
                      if (e.target.value !== config?.cj?.secretKey) {
                        saveCJConfig({ secretKey: e.target.value });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="text-sm text-gray-500">
                    <a 
                      href="https://developers.cjdropshipping.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-500"
                    >
                      احصل على مفاتيح API من هنا
                    </a>
                  </div>
                  <button
                    onClick={syncProducts}
                    disabled={syncing || !config?.cj?.enabled}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ml-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'جاري المزامنة...' : 'مزامنة المنتجات'}
                  </button>
                </div>
              </div>
            </div>

            {/* نتائج المزامنة */}
            {syncResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
          </div>
        )}

        {/* محتوى التبويب - المنتجات */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-6">
                <Package className="w-8 h-8 text-orange-500 mb-2" />
                <h3 className="text-2xl font-bold text-orange-900">
                  {status?.platforms.cj.products_count || 0}
                </h3>
                <p className="text-sm text-orange-700">منتج من CJDropshipping</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6">
                <Database className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="text-2xl font-bold text-blue-900">
                  {status?.platforms.cj.products_count || 0}
                </h3>
                <p className="text-sm text-blue-700">إجمالي المنتجات (بعد التصفية)</p>
              </div>
            </div>
          </div>
        )}

        {/* محتوى التبويب - الذكاء الاصطناعي */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            {/* عنوان الذكاء الاصطناعي */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white">
              <div className="flex items-center mb-2">
                <Cpu className="w-8 h-8 ml-3" />
                <h2 className="text-2xl font-bold">نظام إضافة المنتجات بالذكاء الاصطناعي</h2>
              </div>
              <p className="text-orange-100">
                سيقوم الذكاء الاصطناعي بتحليل منتجات CJ واختيار الأفضل منها تلقائياً بناءً على معاييرك
              </p>
            </div>

            {/* إعدادات الذكاء الاصطناعي */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 ml-2 text-orange-500" />
                معايير الاختيار
              </h3>

              {/* تفعيل النظام */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">تفعيل الإضافة التلقائية</h4>
                  <p className="text-sm text-gray-500">تشغيل النظام لإضافة المنتجات تلقائياً</p>
                </div>
                <button
                  onClick={() => setAIConfig({ ...aiConfig, enabled: !aiConfig.enabled })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    aiConfig.enabled ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      aiConfig.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* الكلمات المفتاحية */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline ml-1" />
                  الكلمات المفتاحية للبحث
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="أضف كلمة مفتاحية (مثل: phone case, watch, jewelry)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <button
                    onClick={addKeyword}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiConfig.keywords.map((keyword) => (
                    <span key={keyword} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)} className="ml-2 text-orange-600 hover:text-orange-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* كلمات الاستبعاد */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <XCircle className="w-4 h-4 inline ml-1" />
                  كلمات الاستبعاد (للمنتجات غير المرغوب فيها)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newExcludeWord}
                    onChange={(e) => setNewExcludeWord(e.target.value)}
                    placeholder="أضف كلمة استبعاد (مثل: adult, cheap)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && addExcludeWord()}
                  />
                  <button
                    onClick={addExcludeWord}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiConfig.excludeWords.map((word) => (
                    <span key={word} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                      {word}
                      <button onClick={() => removeExcludeWord(word)} className="ml-2 text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* هامش الربح */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  هامش الربح الأدنى: {aiConfig.minProfitMargin}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={aiConfig.minProfitMargin}
                  onChange={(e) => setAIConfig({ ...aiConfig, minProfitMargin: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>10%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* الحد الأقصى للمنتجات اليومية */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للمنتجات اليومية: {aiConfig.maxDailyImports}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={aiConfig.maxDailyImports}
                  onChange={(e) => setAIConfig({ ...aiConfig, maxDailyImports: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* درجة الموافقة التلقائية */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درجة الموافقة التلقائية (0-100): {aiConfig.autoApproveScore}
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={aiConfig.autoApproveScore}
                  onChange={(e) => setAIConfig({ ...aiConfig, autoApproveScore: parseInt(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  المنتجات التي تحصل على درجة أعلى من هذا سيتم إضافتها تلقائياً
                </p>
              </div>

              {/* زر الحفظ */}
              <button
                onClick={saveAIConfig}
                disabled={saving}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>

            {/* تشغيل الذكاء الاصطناعي */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 ml-2 text-orange-500" />
                    تشغيل التحليل والإضافة
                  </h3>
                  <p className="text-sm text-gray-500">
                    سيقوم النظام بتحليل المنتجات من CJ وإضافة الأفضل منها
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الكلمات المفتاحية:</span>
                    <span className="font-medium ml-2">{aiConfig.keywords.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">الحد اليومي:</span>
                    <span className="font-medium ml-2">{aiConfig.maxDailyImports} منتجات</span>
                  </div>
                  <div>
                    <span className="text-gray-600">هامش الربح:</span>
                    <span className="font-medium ml-2">{aiConfig.minProfitMargin}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">درجة الموافقة:</span>
                    <span className="font-medium ml-2">{aiConfig.autoApproveScore}+</span>
                  </div>
                </div>
              </div>

              <button
                onClick={runAIImport}
                disabled={aiRunning || !aiConfig.enabled || aiConfig.keywords.length === 0}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 transition-all font-medium text-lg flex items-center justify-center"
              >
                {aiRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                    جاري تحليل المنتجات...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 ml-2" />
                    تشغيل الذكاء الاصطناعي الآن
                  </>
                )}
              </button>
            </div>

            {/* نتائج التحليل */}
            {aiResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">نتائج التحليل</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{aiResult.imported_count}</div>
                    <div className="text-sm text-green-700">منتج تمت إضافته</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{aiResult.rejected_count}</div>
                    <div className="text-sm text-red-700">منتج مرفوض</div>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {aiResult.results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg flex items-center justify-between ${
                      result.decision === 'approved' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{result.title}</div>
                        <div className="text-xs text-gray-500">درجة التقييم: {result.score}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.decision === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.decision === 'approved' ? 'تمت إضافته' : 'مرفوض'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
