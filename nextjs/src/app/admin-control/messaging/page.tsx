'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Mail,
  Phone,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description?: string;
  channel: 'sms' | 'email' | 'both';
  trigger_event: string;
  subject?: string;
  body_content: string;
  is_active: boolean;
  created_at: string;
}

interface Communication {
  id: string;
  order_id: string;
  customer_id: string;
  channel: 'sms' | 'email';
  direction: string;
  status: string;
  subject?: string;
  content_snapshot: string;
  recipient: string;
  created_at: string;
  order?: { order_number: string };
  customer?: { first_name: string; last_name: string };
}

const TRIGGER_EVENTS = [
  { value: 'manual', label: 'يدوي' },
  { value: 'order_placed', label: 'تم استلام الطلب' },
  { value: 'order_confirmed', label: 'تم تأكيد الطلب' },
  { value: 'order_processing', label: 'جاري التحضير' },
  { value: 'order_shipped', label: 'تم الشحن' },
  { value: 'order_delivered', label: 'تم التسليم' },
  { value: 'tracking_added', label: 'تم إضافة التتبع' },
];

const TEMPLATE_VARIABLES = [
  { variable: '{{customer_name}}', description: 'اسم العميل الكامل' },
  { variable: '{{customer_first_name}}', description: 'الاسم الأول' },
  { variable: '{{order_id}}', description: 'رقم الطلب' },
  { variable: '{{order_total}}', description: 'إجمالي الطلب' },
  { variable: '{{tracking_number}}', description: 'رقم التتبع' },
  { variable: '{{tracking_url}}', description: 'رابط التتبع' },
  { variable: '{{carrier_name}}', description: 'شركة الشحن' },
];

export default function MessagingPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [logs, setLogs] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [templatesRes, logsRes] = await Promise.all([
        fetch('/api/messaging/templates'),
        fetch('/api/messaging/logs?limit=50'),
      ]);

      const templatesData = await templatesRes.json();
      const logsData = await logsRes.json();

      if (templatesData.success) setTemplates(templatesData.data || []);
      if (logsData.success) setLogs(logsData.data || []);
    } catch (error) {
      showNotification('error', 'فشل جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;

    try {
      const response = await fetch(`/api/messaging/templates?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'تم حذف القالب بنجاح');
        fetchData();
      } else {
        showNotification('error', data.error || 'فشل حذف القالب');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء الحذف');
    }
  };

  const saveTemplate = async (templateData: Partial<Template>) => {
    try {
      const method = editingTemplate ? 'PUT' : 'POST';
      const body = editingTemplate 
        ? { id: editingTemplate.id, ...templateData }
        : templateData;

      const response = await fetch('/api/messaging/templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', `تم ${editingTemplate ? 'تحديث' : 'إنشاء'} القالب بنجاح`);
        setShowTemplateModal(false);
        setEditingTemplate(null);
        fetchData();
      } else {
        showNotification('error', data.error || 'فشل حفظ القالب');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء الحفظ');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      queued: 'bg-yellow-100 text-yellow-800',
    };

    const labels: Record<string, string> = {
      sent: 'تم الإرسال',
      delivered: 'تم التسليم',
      failed: 'فشل',
      queued: 'قيد الانتظار',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageSquare className="w-8 h-8 ml-3 text-blue-600" />
              إدارة المراسلات
            </h1>
            <p className="mt-2 text-gray-600">
              إدارة قوالب الرسائل وسجل المراسلات مع العملاء
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            قالب جديد
          </button>
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

        {/* التبويبات */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline ml-2" />
                القوالب ({templates.length})
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline ml-2" />
                سجل المراسلات ({logs.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'templates' && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`bg-white rounded-lg border-2 p-4 transition-all ${
                      template.is_active 
                        ? 'border-gray-200 hover:border-blue-300' 
                        : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {template.channel === 'sms' ? (
                          <Phone className="w-5 h-5 text-purple-500 ml-2" />
                        ) : (
                          <Mail className="w-5 h-5 text-blue-500 ml-2" />
                        )}
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setEditingTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {template.description || 'لا يوجد وصف'}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {TRIGGER_EVENTS.find(e => e.value === template.trigger_event)?.label}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {template.is_active ? 'مُفعّل' : 'مُعطّل'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 space-x-reverse">
                        {log.channel === 'sms' ? (
                          <Phone className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Mail className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2 space-x-reverse mb-1">
                            <span className="font-medium">
                              {log.order?.order_number || 'طلب بدون رقم'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {log.content_snapshot}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 space-x-reverse">
                        {getStatusBadge(log.status)}
                        <span className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal إنشاء/تعديل قالب */}
      {showTemplateModal && (
        <TemplateModal
          template={editingTemplate}
          onSave={saveTemplate}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplate(null);
          }}
          variables={TEMPLATE_VARIABLES}
          triggerEvents={TRIGGER_EVENTS}
        />
      )}
    </div>
  );
}

function TemplateModal({
  template,
  onSave,
  onClose,
  variables,
  triggerEvents,
}: {
  template: Template | null;
  onSave: (data: Partial<Template>) => void;
  onClose: () => void;
  variables: { variable: string; description: string }[];
  triggerEvents: { value: string; label: string }[];
}) {
  const [formData, setFormData] = useState<Partial<Template>>({
    name: template?.name || '',
    description: template?.description || '',
    channel: template?.channel || 'email',
    trigger_event: template?.trigger_event || 'manual',
    subject: template?.subject || '',
    body_content: template?.body_content || '',
    is_active: template?.is_active ?? true,
  });

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      body_content: (prev.body_content || '') + variable,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {template ? 'تعديل القالب' : 'قالب جديد'}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم القالب *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="مثال: إشعار الشحن"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">القناة *</label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="email">بريد إلكتروني</option>
                <option value="sms">رسالة نصية</option>
                <option value="both">الكل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حدث الإرسال *</label>
              <select
                value={formData.trigger_event}
                onChange={(e) => setFormData(prev => ({ ...prev, trigger_event: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {triggerEvents.map((event) => (
                  <option key={event.value} value={event.value}>{event.label}</option>
                ))}
              </select>
            </div>

            {formData.channel !== 'sms' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الموضوع</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="مثال: تم شحن طلبك {{order_id}}"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">محتوى الرسالة *</label>
              <div className="flex items-center space-x-2 space-x-reverse">
                {variables.map((v) => (
                  <button
                    key={v.variable}
                    type="button"
                    onClick={() => insertVariable(v.variable)}
                    className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-mono"
                  >
                    {v.variable}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={formData.body_content}
              onChange={(e) => setFormData(prev => ({ ...prev, body_content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              rows={8}
              placeholder="أدخل محتوى الرسالة..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">تفعيل القالب</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                formData.is_active ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                  formData.is_active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4 space-x-reverse">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">إلغاء</button>
          <button
            onClick={() => {
              if (!formData.name || !formData.body_content) {
                alert('الرجاء إدخال اسم القالب ومحتوى الرسالة');
                return;
              }
              onSave(formData);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {template ? 'تحديث' : 'إنشاء'}
          </button>
        </div>
      </div>
    </div>
  );
}
