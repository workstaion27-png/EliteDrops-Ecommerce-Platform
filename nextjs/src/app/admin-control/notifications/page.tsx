/**
 * Admin Notifications Center Page
 * صفحة مركز الإشعارات في لوحة التحكم
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Bell, 
  BellRing,
  CheckCheck, 
  Trash2, 
  Check,
  X,
  Filter,
  RefreshCw,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Truck,
  AlertCircle,
  Info,
  Search,
  MoreVertical,
  Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';
import NotificationBell from '@/components/NotificationBell';

interface NotificationItem {
  id: string;
  title: string;
  message: string | null;
  type: 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping';
  priority: 'low' | 'normal' | 'high' | 'critical';
  is_read: boolean;
  link: string | null;
  related_entity_id: string | null;
  created_at: string;
  metadata: any;
}

const typeIcons = {
  order: ShoppingCart,
  product: Package,
  customer: Users,
  payment: CreditCard,
  shipping: Truck,
  system: Info,
};

const typeColors = {
  order: { bg: 'bg-green-100', text: 'text-green-600', label: 'طلبات' },
  product: { bg: 'bg-amber-100', text: 'text-amber-600', label: 'منتجات' },
  customer: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'عملاء' },
  payment: { bg: 'bg-purple-100', text: 'text-purple-600', label: 'مدفوعات' },
  shipping: { bg: 'bg-indigo-100', text: 'text-indigo-600', label: 'شحن' },
  system: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'نظام' },
};

const priorityColors = {
  low: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600' },
  normal: { bg: 'bg-white', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-600' },
  high: { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-600' },
  critical: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-100 text-red-600' },
};

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({
    type: 'all',
    is_read: '',
    priority: 'all',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const supabase = createClient<Database>();

  // دالة لتنسيق الوقت
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة${diffMins > 1 ? '' : ''}`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    if (diffWeeks < 4) return `منذ ${diffWeeks} أسبوع`;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('admin_notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // تطبيق الفلاتر
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.is_read !== '') {
        query = query.eq('is_read', filters.is_read === 'true');
      }
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setNotifications(data || []);
      setPagination((prev) => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }));

      // جلب عدد غير المقروءة
      const { count: unread } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

      setUnreadCount(unread || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, pagination, filters]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // تحديد/إلغاء تحديد إشعار
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // تحديد الكل
  const selectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  // تعيين كمقروءة
  const markAsRead = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .in('id', ids);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // تعيين كغير مقروءة
  const markAsUnread = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: false })
        .in('id', ids);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, is_read: false } : n))
      );
      setUnreadCount((prev) => prev + ids.length);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking as unread:', error);
    }
  };

  // تعيين الكل كمقروءة
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // حذف الإشعارات
  const deleteNotifications = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      setUnreadCount((prev) =>
        Math.max(0, prev - notifications.filter((n) => ids.includes(n.id) && !n.is_read).length)
      );
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  // تغيير الصفحة
  const changePage = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              {unreadCount > 0 ? (
                <BellRing className="w-8 h-8 text-white" />
              ) : (
                <Bell className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مركز الإشعارات</h1>
              <p className="text-gray-600 mt-1">
                لديك <span className="font-bold text-blue-600">{unreadCount}</span> إشعار غير مقروء
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-5 h-5" />
              <span>تعيين الكل كمقروء</span>
            </button>
          </div>
        </div>

        {/* الفلاتر */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* بحث */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="البحث في الإشعارات..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* نوع الإشعار */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الأنواع</option>
              {Object.entries(typeColors).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>

            {/* حالة القراءة */}
            <select
              value={filters.is_read}
              onChange={(e) => setFilters({ ...filters, is_read: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">الكل</option>
              <option value="false">غير مقروء</option>
              <option value="true">مقروء</option>
            </select>

            {/* الأولوية */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">جميع الأولويات</option>
              <option value="low">منخفضة</option>
              <option value="normal">عادية</option>
              <option value="high">عالية</option>
              <option value="critical">حرجة</option>
            </select>

            {/* إعادة تحميل */}
            <button
              onClick={fetchNotifications}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* الإجراءات الجماعية */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {selectedIds.length} إشعار محدد
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAsRead(selectedIds)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>تعيين كمقروء</span>
                </button>
                <button
                  onClick={() => markAsUnread(selectedIds)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>تعيين كغير مقروء</span>
                </button>
                <button
                  onClick={() => deleteNotifications(selectedIds)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* قائمة الإشعارات */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Bell className="w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
              <p>لم يتم استلام أي إشعارات حتى الآن</p>
            </div>
          ) : (
            <>
              {/* رأس القائمة */}
              <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedIds.length === notifications.length}
                  onChange={selectAll}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {notifications.length} إشعار
                </span>
              </div>

              {/* العناصر */}
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const IconComponent = typeIcons[notification.type] || Info;
                  const typeStyle = typeColors[notification.type];
                  const priorityStyle = priorityColors[notification.priority];

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? priorityStyle.bg : ''
                      } ${selectedIds.includes(notification.id) ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* تحديد */}
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification.id)}
                          onChange={() => toggleSelect(notification.id)}
                          className="w-5 h-5 mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />

                        {/* أيقونة النوع */}
                        <div className={`p-2.5 rounded-xl ${typeStyle.bg} ${typeStyle.text}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeStyle.badge} ${typeStyle.text}`}>
                                  {typeStyle.label}
                                </span>
                                {!notification.is_read && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              {notification.message && (
                                <p className="text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                              )}
                            </div>

                            {/* الوقت والإجراءات */}
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-400 whitespace-nowrap">
                                {formatTime(notification.created_at)}
                              </span>
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => markAsRead([notification.id])}
                                    className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                    title="تعيين كمقروء"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotifications([notification.id])}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* الترقيم */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                  <span className="text-sm text-gray-600">
                    صفحة {pagination.page} من {pagination.totalPages} ({pagination.total} إشعار)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => changePage(pageNum)}
                          className={`px-3 py-1.5 text-sm rounded-lg ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
