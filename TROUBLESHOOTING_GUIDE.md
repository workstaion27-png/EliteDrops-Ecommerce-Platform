# 🔧 دليل استكشاف الأخطاء وإصلاحها

## 🚨 **مشاكل شائعة وحلولها**

### **1. مشاكل النشر على Vercel**

#### **❌ خطأ: "Build failed"**
```
السبب المحتمل:
- ملف package.json مفقود
- تبعيات ناقصة
- خطأ في الكود
- مسار خاطئ للملفات

الحلول:
✅ تأكد من اختيار المجلد الصحيح: ./nextjs
✅ تأكد من وجود package.json في nextjs/
✅ تحقق من build command: pnpm build
✅ تحقق من console logs في Vercel
```

#### **❌ خطأ: "Module not found"**
```
السبب المحتمل:
- تبعيات غير مثبتة
- استيراد خاطئ للملفات
- مسار خاطئ

الحلول:
✅ تأكد من Install Command: pnpm install
✅ تحقق من استيرادات الملفات
✅ تأكد من أسماء الملفات والمسارات
```

#### **❌ خطأ: "Environment variable not found"**
```
السبب المحتمل:
- متغيرات البيئة ناقصة
- أسماء خاطئة
- قيم ناقصة

الحلول:
✅ تأكد من إضافة جميع Environment Variables
✅ تأكد من أسماء المتغيرات صحيحة:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - ADMIN_ROUTE
✅ أعد النشر بعد إضافة المتغيرات
```

---

### **2. مشاكل Supabase**

#### **❌ خطأ: "Failed to connect to Supabase"**
```
السبب المحتمل:
- URL خاطئ
- API Key خاطئ
- RLS policies خاطئة

الحلول:
✅ تأكد من SUPABASE_URL:
   https://pjbsymhweggqowdxloya.supabase.co
✅ تأكد من SUPABASE_ANON_KEY:
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqYnN5bWh3ZWdncW93ZHhsb3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NzQ1MjcsImV4cCI6MjA4MTQ1MDUyN30.07koQWWRAOl0WF8hFSK4Nqr07e4WkkuiywLmHiKI4jw
✅ تحقق من RLS policies في Supabase
```

#### **❌ خطأ: "Table doesn't exist"**
```
السبب المحتمل:
- الجداول لم يتم إنشاؤها
- أسماء جداول خاطئة

الحلول:
✅ تأكد من تشغيل migrations في Supabase
✅ تحقق من أسماء الجداول:
   - products
   - orders
   - order_items
   - customers
   - cart_items
   - payment_gateways
   - cj_dropshipping_settings
```

#### **❌ خطأ: "Permission denied"**
```
السبب المحتمل:
- RLS policies تمنع الوصول
- API Key لا يملك الصلاحيات

الحلول:
✅ تحقق من RLS policies في Supabase
✅ تأكد من أن ANON KEY له صلاحيات القراءة
✅ تحقق من privacy settings للجداول
```

---

### **3. مشاكل لوحة التحكم**

#### **❌ خطأ: "Cannot access admin panel"**
```
السبب المحتمل:
- بيانات دخول خاطئة
- مسار خاطئ
- middleware يمنع الوصول

الحلول:
✅ تأكد من بيانات الدخول:
   Username: elitedrops_admin_2024
   Password: SecureAdminPass123
✅ تأكد من الرابط: /dashboard_control_2024
✅ تحقق من middleware.ts
```

#### **❌ خطأ: "Login failed"**
```
السبب المحتمل:
- بيانات دخول خاطئة
- session expired
- cache مشكلة

الحلول:
✅ تأكد من البيانات صحيحة
✅ امسح cache المتصفح
✅ جرب incognito mode
✅ تحقق من localStorage
```

#### **❌ خطأ: "Admin features not working"**
```
السبب المحتمل:
- متغيرات البيئة ناقصة
- مشكلة في authentication
- مشكلة في API

الحلول:
✅ تأكد من ADMIN_USERNAME و ADMIN_PASSWORD في env vars
✅ تحقق من adminAuth.ts
✅ تحقق من console logs
```

---

### **4. مشاكل PayPal**

#### **❌ خطأ: "PayPal SDK not loaded"**
```
السبب المحتمل:
- SDK لم يتم تحميله
- مشكلة في الشبكة
- إعدادات خاطئة

الحلول:
✅ تأكد من تحميل PayPal SDK في page.tsx
✅ تحقق من internet connection
✅ تحقق من browser console للأخطاء
```

#### **❌ خطأ: "Payment failed"**
```
السبب المحتمل:
- API keys خاطئة
- مشكلة في PayPal account
- خطأ في الكود

الحلول:
✅ تحقق من PayPal Developer Dashboard
✅ تأكد من API credentials صحيحة
✅ تحقق من sandbox/live mode
✅ تحقق من console logs
```

---

### **5. مشاكل التصميم والواجهة**

#### **❌ خطأ: "Blank white page"**
```
السبب المحتمل:
- خطأ في JavaScript
- مشكلة في routing
- CSS لم يتم تحميله

الحلول:
✅ افتح Developer Console (F12)
✅ تحقق من أخطاء JavaScript
✅ تحقق من network requests
✅ تأكد من next.config.js صحيح
```

#### **❌ خطأ: "Styles not loading"**
```
السبب المحتمل:
- Tailwind CSS لم يتم تحميله
- مشكلة في postcss
- ملفات CSS مفقودة

الحلول:
✅ تأكد من tailwind.config.js
✅ تأكد من postcss.config.js
✅ تحقق من globals.css
✅ تأكد من @tailwind directives
```

#### **❌ خطأ: "Images not showing"**
```
السبب المحتمل:
- مسارات الصور خاطئة
- الصور غير موجودة
- مشكلة في Next.js Image component

الحلول:
✅ تحقق من مسارات الصور
✅ تأكد من وجود الصور في public/
✅ تحقق من next.config.js image settings
✅ تحقق من Image component usage
```

---

### **6. مشاكل الأداء**

#### **❌ خطأ: "Slow loading"**
```
السبب المحتمل:
- صور كبيرة
- كود غير محسن
- استعلامات قاعدة بيانات بطيئة

الحلول:
✅ ضغط الصور
✅ تحسين الصور (WebP format)
✅ تحسين database queries
✅ تفعيل caching
✅ تحسين bundle size
```

#### **❌ خطأ: "Memory issues"**
```
السبب المحتمل:
- memory leaks
- استعلامات كبيرة
- state management مشكلة

الحلول:
✅ تحقق من useEffect cleanup
✅ تحسين state management
✅ تقليل data fetched
✅ تحسين component re-rendering
```

---

## 🔍 **أدوات التشخيص**

### **Developer Console (F12):**
```
✅ Console: لرؤية أخطاء JavaScript
✅ Network: لرؤية requests و responses
✅ Performance: لتحليل الأداء
✅ Application: لرؤية localStorage و cookies
```

### **Vercel Logs:**
```
1. اذهب لمشروعك في Vercel
2. اضغط على "Functions"
3. اختر function لرؤية logs
4. تحقق من build logs و runtime logs
```

### **Supabase Logs:**
```
1. اذهب لـ Supabase Dashboard
2. اختر مشروعك
3. اضغط على "Logs"
4. تحقق من API logs و database logs
```

### **Network Tab:**
```
✅ لرؤية failed requests
✅ لرؤية response times
✅ لرؤية headers و cookies
✅ لرؤية request payloads
```

---

## 🛠️ **خطوات التشخيص العامة**

### **1. تحقق من Console Errors:**
```
1. افتح Developer Console (F12)
2. اذهب للـ Console tab
3. ابحث عن أخطاء حمراء
4. انقر على أخطاء لرؤية التفاصيل
```

### **2. تحقق من Network Requests:**
```
1. افتح Network tab في Console
2. أعد تحميل الصفحة
3. ابحث عن requests فشلت (أحمر)
4. انقر على request لرؤية التفاصيل
```

### **3. تحقق من Environment Variables:**
```
1. في Vercel Dashboard
2. اذهب لـ Settings > Environment Variables
3. تأكد من جميع المتغيرات موجودة
4. تأكد من القيم صحيحة
```

### **4. تحقق من Build Process:**
```
1. في Vercel Dashboard
2. اذهب للـ Deployments tab
3. انقر على آخر deployment
4. تحقق من build logs
```

---

## 📞 **الحصول على المساعدة**

### **GitHub Issues:**
```
إنشاء issue جديد:
1. اذهب لـ GitHub repository
2. اضغط على "Issues"
3. اضغط "New issue"
4. اكتب المشكلة بالتفصيل
5. أرفق screenshots و console logs
```

### **معلومات مهمة للإبلاغ عن المشاكل:**
```
✅ وصف المشكلة
✅ الخطوات المتكررة
✅ Console errors (إن وجدت)
✅ Browser و version
✅ URL للموقع
✅ Screenshots
✅ Expected behavior vs Actual behavior
```

---

## 🎯 **نصائح للوقاية**

### **الاختبار المستمر:**
```
✅ اختبر الموقع بعد كل تغيير
✅ اختبر على أجهزة مختلفة
✅ اختبر في browsers مختلفة
✅ اختبر performance بانتظام
```

### **المراقبة:**
```
✅ فعّل Vercel Analytics
✅ راقب console errors
✅ راقب performance metrics
✅ راقب user feedback
```

### **النسخ الاحتياطي:**
```
✅ احتفظ بنسخة من الكود
✅ احتفظ بقاعدة البيانات
✅ وثق جميع التغييرات
✅ احتفظ بـ environment variables
```

---

## ✅ **Checklist سريع للحلول**

### **عند مواجهة مشكلة:**
- [ ] تحقق من Console Errors
- [ ] تحقق من Network Requests
- [ ] تحقق من Environment Variables
- [ ] تحقق من Build Logs
- [ ] أعد النشر
- [ ] امسح Cache
- [ ] جرب Incognito Mode

### **لوحة التحكم لا تعمل:**
- [ ] تحقق من بيانات الدخول
- [ ] تحقق من ADMIN_* environment variables
- [ ] تحقق من الرابط: /dashboard_control_2024
- [ ] تحقق من middleware.ts

### **الموقع لا يحمل:**
- [ ] تحقق من Vercel deployment status
- [ ] تحقق من build errors
- [ ] تحقق من environment variables
- [ ] تحقق من console errors

**🚀 معظم المشاكل يمكن حلها باتباع هذه الخطوات!**