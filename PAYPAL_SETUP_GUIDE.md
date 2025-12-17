# 💳 تحديث نظام الدفع إلى PayPal

## 🎯 لماذا PayPal؟

### ✅ مميزات PayPal
- **مجاني للمتاجر**: لا توجد رسوم إعداد
- **يدعم الفيزا والماستر كارد**: عبر PayPal
- **ثقة عالية**: المستخدمون يعرفونه جيداً
- **حماية قوية**: Disputes وسحب الأموال
- **دعم عربي**: متوفر في المنطقة

### 🌍 يقبل عملات كتيرة
- USD, EUR, GBP, SAR, AED, EGP
- تحويل تلقائي للعملات
- أسعار تنافسية

## 📋 التحديث المطلوب

### 1. إضافة PayPal SDK
```bash
# في nextjs/package.json
npm install @paypal/react-paypal-js @paypal/paypal-js
```

### 2. استبدال Stripe بـ PayPal
```javascript
// src/lib/paypal.ts
import { loadScript } from '@paypal/paypal-js'

export const paypalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
  'enable-funding': 'venmo',
  'disable-fundion': 'credit,card',
}
```

### 3. مكون PayPal
```javascript
// src/components/PayPalCheckout.tsx
import { PayPalButtons } from '@paypal/react-paypal-js'

export function PayPalCheckout({ amount, items, onSuccess }) {
  return (
    <PayPalButtons
      createOrder={(data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: amount.toString()
            },
            items: items
          }]
        })
      }}
      onApprove={async (data, actions) => {
        const details = await actions.order.capture()
        onSuccess(details)
      }}
    />
  )
}
```

## 🚀 التحديث السريع (ساعتين)

### الخطوة 1: إعداد PayPal
1. أنشئ حساب PayPal Business
2. احصل على Client ID
3. أضف متغيرات البيئة

### الخطوة 2: تحديث الكود
- استبدال Stripe components بـ PayPal
- تحديث checkout page
- تحديث order creation

### الخطوة 3: الاختبار
- اختبار الدفع
- تأكيد الطلبات
- تحديث قاعدة البيانات

## 💰 تكلفة PayPal
- **إعداد**: مجاني
- **رسوم المعاملة**: 2.9% + $0.30 (US)
- **رسوم دولية**: 4.4% + رسوم ثابتة
- **بدون اشتراك شهري**

## 🔧 مقارنة Stripe vs PayPal

| الميزة | Stripe | PayPal |
|---------|--------|--------|
| سهولة الإعداد | متوسط | سهل |
| رسوم المعاملة | 2.9% + $0.30 | 2.9% + $0.30 |
| ثقة المستخدمين | عالية | عالية جداً |
| دعم عربي | جيد | ممتاز |
| مميزات متقدمة | أكثر | أقل |

## 🎯 التوصية

**إذا كنت تريد:**
- **سهولة للمستخدم**: PayPal أفضل
- **مميزات متقدمة**: Stripe أفضل  
- **إعداد سريع**: PayPal أفضل
- **رسوم أقل**: متساويان تقريباً

---

**هل تريد أن أحدث المشروع لـ PayPal؟** 🚀