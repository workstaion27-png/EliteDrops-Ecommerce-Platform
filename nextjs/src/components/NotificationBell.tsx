/**
 * Notification Bell Component
 * مكون جرس الإشعارات مع قائمة الإشعارات السريعة
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCheck, 
  Trash2, 
  ChevronLeft,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Truck,
  AlertCircle,
  Info
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import type { Database } from '@/lib/types/supabase';

interface NotificationItem {
  id: string;
  title: string;
  message: string | null;
  type: 'order' | 'product' | 'customer' | 'system' | 'payment' | 'shipping';
  priority: 'low' | 'normal' | 'high' | 'critical';
  is_read: boolean;
  link: string | null;
  created_at: string;
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
  order: 'bg-green-100 text-green-600',
  product: 'bg-amber-100 text-amber-600',
  customer: 'bg-blue-100 text-blue-600',
  payment: 'bg-purple-100 text-purple-600',
  shipping: 'bg-indigo-100 text-indigo-600',
  system: 'bg-gray-100 text-gray-600',
};

const priorityColors = {
  low: 'border-l-2 border-gray-300',
  normal: 'border-l-2 border-blue-400',
  high: 'border-l-2 border-amber-400',
  critical: 'border-l-2 border-red-500',
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient<Database>();

  // دالة لتنسيق الوقت
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-SA');
  }, []);

  // جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;
          setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // جلب الإشعارات عند تحميل المكون
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchNotifications]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تعيين كمقروءة
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // التعامل مع النقر على الإشعار
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" dir="rtl">
      {/* زر الجرس */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-blue-600" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {/* عداد الإشعارات */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
        >
          {/* رأس القائمة */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                  {unreadCount} غير مقروء
                </span>
              )}
            </div>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              <span>تعيين الكل كمقروء</span>
            </button>
          </div>

          {/* قائمة الإشعارات */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mb-3 text-gray-300" />
                <p>لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => {
                  const IconComponent = typeIcons[notification.type] || Info;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${
                        priorityColors[notification.priority]
                      } ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        {/* أيقونة النوع */}
                        <div className={`p-2 rounded-lg ${typeColors[notification.type]}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          {notification.message && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {notification.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

              {/* ذيل القائمة */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <a
              href="/admin/notifications"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>عرض جميع الإشعارات</span>
              <ChevronLeft className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
