# 🚀 دليل النشر الشامل - LuxuryHub

## 📋 قائمة التحقق من النشر

### ✅ الخطوة 1: إعداد قاعدة البيانات
- [ ] نسخ محتوى `supabase-schema.sql` إلى محرر SQL في Supabase
- [ ] تنفيذ SQL لإنشاء الجداول
- [ ] التحقق من إنشاء الجداول بنجاح

### ✅ الخطوة 2: النشر على Vercel
- [ ] إنشاء حساب على Vercel
- [ ] ربط المستودع بـ Vercel
- [ ] تكوين متغيرات البيئة
- [ ] النشر الأولي

### ✅ الخطوة 3: اختبار النشر
- [ ] الوصول للموقع الرئيسي
- [ ] اختبار لوحة التحكم الإدارية
- [ ] اختبار التكامل مع CJ Dropshipping
- [ ] اختبار عمليات API

### ✅ الخطوة 4: تكوين إضافي
- [ ] إعداد Domain مخصص (اختياري)
- [ ] تكوين SSL
- [ ] إعداد Webhooks في CJ Dropshipping

---

## 🔧 الخطوة 1: إعداد قاعدة البيانات

### 1.1 افتح Supabase Dashboard
1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل دخولك واختر مشروعك
3. اذهب إلى "SQL Editor"

### 1.2 تطبيق مخطط قاعدة البيانات
```sql
-- انسخ محتوى هذا الملف والصقه في محرر SQL:
-- nextjs/supabase-schema.sql
```

### 1.3 التحقق من النتائج
تأكد من ظهور الجداول التالية:
- customers
- products  
- orders
- order_items
- shipping_tracking
- categories
- admin_users
- suppliers

---

## 🌐 الخطوة 2: النشر على Vercel

### 2.1 إنشاء حساب Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخولك باستخدام GitHub

### 2.2 ربط المستودع
1. انقر "New Project"
2. اختر مستودع "EliteDrops-Ecommerce-Platform"
3. انقر "Import"

### 2.3 تكوين الإعدادات
```yaml
Project Name: luxuryhub-ecommerce
Framework Preset: Next.js
Root Directory: nextjs/
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 2.4 تكوين متغيرات البيئة
أضف هذه المتغيرات في Vercel Dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xqajwqrjqgckhgpzrxvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxbmp3cXJqcWdjay1ocGd6cnh2dyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM2Nzg3ODI5LCJleHAiOjIwNTIzNjM4Mjl9.hz2x0J3l5L8zU5o1o4Yb9m0p3r7c2w8q1v9x4m5s3n9f6j8k1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhxbmp3cXJqcWdjay1ocGd6cnh2dyIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MzY3ODc4MjksImV4cCI6MjA1MjM2MzgyOX0.W1s9f0n2c6y1zR4j7t2g8p9b5v3j6k2q1l9r4t7u1m8p3c5n7g4f1h9i3j5k2l6m7r8t9u1v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0

# CJ Dropshipping
CJ_APP_KEY=CJ4990471
CJ_SECRET_KEY=@api@f291f4ea4b7e4b88b816656fef7d7aa8
CJ_PARTNER_ID=CJ4990471

# Security
JWT_SECRET=luxuryhub-super-secret-jwt-key-2025
ENCRYPTION_KEY=luxuryhub-encryption-key-2025

# Admin
ADMIN_EMAIL=admin@luxuryhub.com
ADMIN_PASSWORD=luxuryhub-admin-2025

# Store Config
STORE_NAME=LuxuryHub
STORE_URL=https://your-domain.vercel.app
STORE_CURRENCY=USD
STORE_TAX_RATE=0.08
```

### 2.5 النشر
1. انقر "Deploy"
2. انتظر اكتمال البناء (2-3 دقائق)
3. احصل على رابط موقعك!

---

## 🧪 الخطوة 3: اختبار النشر

### 3.1 اختبار الموقع الرئيسي
- [ ] اذهب إلى رابط Vercel
- [ ] تحقق من تحميل الصفحة الرئيسية
- [ ] تصفح المنتجات
- [ ] اختبر صفحة المنتج الفردي

### 3.2 اختبار لوحة التحكم
- [ ] اذهب إلى `/admin-control`
- [ ] سجل دخول: admin@luxuryhub.com / luxuryhub-admin-2025
- [ ] تحقق من لوحة التحكم والإحصائيات

### 3.3 اختبار CJ Integration
- [ ] اذهب إلى تبويب "CJdropshipping"
- [ ] اختبر الاتصال مع CJ
- [ ] جرب البحث عن المنتجات
- [ ] جرب استيراد منتج

---

## 🔗 الخطوة 4: تكوين Webhooks (اختياري)

### 4.1 إعداد Webhook في CJ Dropshipping
1. اذهب إلى CJ Dropshipping Dashboard
2. Settings → Webhooks
3. Add Webhook:
   ```
   URL: https://your-vercel-domain.vercel.app/api/webhooks/cjdropshipping
   Events: order.status, order.tracking
   ```

### 4.2 اختبار Webhook
- [ ] أنشئ طلب اختبار
- [ ] تحقق من استقبال Webhook
- [ ] تحقق من تحديث حالة الطلب

---

## 🎯 روابط مهمة

### روابط الموقع
- **الموقع الرئيسي**: `https://your-project-name.vercel.app`
- **لوحة التحكم**: `https://your-project-name.vercel.app/admin-control`
- **API Products**: `https://your-project-name.vercel.app/api/products`
- **API Orders**: `https://your-project-name.vercel.app/api/orders`

### لوحة التحكم الإدارية
- **Email**: admin@luxuryhub.com
- **Password**: luxuryhub-admin-2025

---

## 🚨 حل المشاكل الشائعة

### مشكلة: قاعدة البيانات فارغة
**الحل**: تأكد من تنفيذ SQL schema في Supabase

### مشكلة: CJ Integration لا يعمل
**الحل**: 
1. تحقق من متغيرات البيئة في Vercel
2. تأكد من صحة CJ API credentials
3. اختبر الاتصال من لوحة التحكم

### مشكلة: صفحة Admin Control فارغة
**الحل**:
1. تحقق من متغيرات البيئة
2. تأكد من تسجيل الدخول الصحيح
3. تحقق من Console للأخطاء

### مشكلة: المنتجات لا تظهر
**الحل**:
1. تأكد من تفعيل المنتجات في قاعدة البيانات
2. تحقق من إعداد `is_active = true`

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:

1. **تحقق من logs** في Vercel Dashboard
2. **تحقق من Supabase logs** في Dashboard
3. **اختبر API endpoints** مباشرة
4. **راجع documentation** في README.md

---

**🎉 مبروك! متجرك الآن منشور وجاهز للاستخدام!**

**الخطوات التالية:**
1. أضف منتجات من CJ Dropshipping
2. اختبر عملية الطلب الكاملة
3. قم بإعداد Domain مخصص
4. ابدأ في التسويق لمتجرك! 🚀