#!/bin/bash

# Quick Deployment Script for LuxuryHub E-commerce Platform

echo "🚀 بدء عملية النشر لـ LuxuryHub E-commerce Platform"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 خطوات النشر:${NC}"
echo ""

# Step 1: Check environment
echo -e "${YELLOW}الخطوة 1: فحص متغيرات البيئة${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ ملف .env موجود${NC}"
else
    echo -e "${RED}❌ ملف .env غير موجود - سيتم إنشاؤه${NC}"
fi

# Step 2: Database setup
echo ""
echo -e "${YELLOW}الخطوة 2: إعداد قاعدة البيانات${NC}"
echo "   📝 انسخ محتوى 'supabase-schema.sql' إلى Supabase SQL Editor"
echo "   📋 تأكد من إنشاء الجداول:"
echo "      - customers"
echo "      - products" 
echo "      - orders"
echo "      - order_items"
echo "      - shipping_tracking"
echo ""

read -p "   ✅ هل أكملت إعداد قاعدة البيانات؟ (y/n): " db_confirm

if [ "$db_confirm" = "y" ] || [ "$db_confirm" = "Y" ]; then
    echo -e "${GREEN}✅ تم تأكيد إعداد قاعدة البيانات${NC}"
else
    echo -e "${YELLOW}⚠️  تأكد من إعداد قاعدة البيانات قبل المتابعة${NC}"
fi

# Step 3: Build test
echo ""
echo -e "${YELLOW}الخطوة 3: اختبار البناء${NC}"
echo "   🔨 تشغيل npm install..."
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم تثبيت المكتبات بنجاح${NC}"
else
    echo -e "${RED}❌ فشل في تثبيت المكتبات${NC}"
    exit 1
fi

echo "   🔨 تشغيل npm run build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ تم بناء المشروع بنجاح${NC}"
else
    echo -e "${RED}❌ فشل في بناء المشروع${NC}"
    echo "   📋 تحقق من الأخطاء أعلاه"
    exit 1
fi

# Step 4: Vercel deployment instructions
echo ""
echo -e "${YELLOW}الخطوة 4: النشر على Vercel${NC}"
echo "   🌐 اذهب إلى: https://vercel.com"
echo "   📚 أنشئ حساب جديد أو سجل دخول"
echo "   🔗 اختر 'New Project'"
echo "   📦 اختر مستودع: EliteDrops-Ecommerce-Platform"
echo ""

echo -e "${BLUE}📝 متغيرات البيئة المطلوبة في Vercel:${NC}"
echo "   نسخ من ملف: VERCEL_ENV.txt"
echo ""

# Step 5: Testing instructions
echo -e "${YELLOW}الخطوة 5: اختبار النشر${NC}"
echo "   بعد النشر، اختبر:"
echo "   🔗 الموقع الرئيسي: /"
echo "   🎛️ لوحة التحكم: /admin-control"
echo "   📧 تسجيل الدخول: admin@luxuryhub.com"
echo "   🔑 كلمة المرور: luxuryhub-admin-secure-password-2025"
echo ""

# Step 6: CJ Integration
echo -e "${YELLOW}الخطوة 6: اختبار CJ Integration${NC}"
echo "   🔗 اذهب إلى تبويب 'CJdropshipping' في لوحة التحكم"
echo "   🔍 اختبر الاتصال مع CJ"
echo "   📦 جرب البحث عن المنتجات"
echo "   📥 جرب استيراد منتج"
echo ""

# Summary
echo -e "${GREEN}🎉 تم الانتهاء من قائمة التحقق!${NC}"
echo ""
echo -e "${BLUE}📚 ملفات مفيدة:${NC}"
echo "   📖 DEPLOYMENT_GUIDE.md - دليل النشر المفصل"
echo "   📖 README.md - دليل التشغيل العام"
echo "   📖 VERCEL_ENV.txt - متغيرات البيئة"
echo "   📖 IMPLEMENTATION_SUMMARY.md - ملخص التنفيذ"
echo ""
echo -e "${GREEN}🚀 موقعك جاهز للنشر على Vercel!${NC}"
echo ""
echo -e "${YELLOW}💡 نصائح:${NC}"
echo "   1. تأكد من إعداد قاعدة البيانات أولاً"
echo "   2. انسخ متغيرات البيئة بعناية"
echo "   3. اختبر جميع الوظائف بعد النشر"
echo "   4. راجع logs في Vercel إذا واجهت مشاكل"
echo ""