import { NextRequest, NextResponse } from 'next/server'

// مسار لوحة التحكم المخصص (يتم قراءته من متغيرات البيئة)
const ADMIN_ROUTE = process.env.ADMIN_ROUTE || '/dashboard_control_2024'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // استثناء صفحة تسجيل الدخول من middleware
  if (pathname === `${ADMIN_ROUTE}/login` || pathname === '/admin/login') {
    return NextResponse.next()
  }
  
  // التحقق من الوصول للوحة التحكم
  if (pathname.startsWith(ADMIN_ROUTE) || pathname.startsWith('/admin')) {
    return handleAdminAccess(request)
  }
  
  return NextResponse.next()
}

function handleAdminAccess(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTE) || pathname.startsWith('/admin')
  
  // إذا كان المسار القديم (/admin) أعيد التوجيه للمسار الجديد
  // لكن فقط إذا لم نكن في صفحة login
  if (pathname.startsWith('/admin') && ADMIN_ROUTE !== '/admin' && !pathname.endsWith('/login')) {
    const newPath = pathname.replace('/admin', ADMIN_ROUTE)
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  
  // التحقق من الجلسة
  const session = getSessionFromRequest(request)
  
  // إذا لم توجد جلسة، إعادة توجيه لصفحة تسجيل الدخول
  if (!session) {
    // إنشاء URL آمن للـ login
    const loginPath = `${ADMIN_ROUTE}/login`
    const loginUrl = new URL(loginPath, request.url)
    
    // إضافة redirect parameter فقط إذا كان المسار الحالي ليس login
    if (!pathname.endsWith('/login')) {
      loginUrl.searchParams.set('redirect', pathname)
    }
    
    return NextResponse.redirect(loginUrl)
  }
  
  // التحقق من صحة الجلسة
  if (!isValidSession(session)) {
    // حذف session غير صالح وإنشاء response آمن
    const response = NextResponse.redirect(new URL(`${ADMIN_ROUTE}/login`, request.url))
    deleteSessionFromResponse(response)
    return response
  }
  
  // تحديث نشاط الجلسة
  updateSessionActivity(request, session)
  
  return NextResponse.next()
}

// استخراج الجلسة من request
function getSessionFromRequest(request: NextRequest) {
  // محاولة من cookies
  const sessionCookie = request.cookies.get('admin_session')?.value
  
  // محاولة من headers (لـ API calls)
  const sessionHeader = request.headers.get('x-admin-session')
  
  if (sessionCookie) {
    try {
      return JSON.parse(sessionCookie)
    } catch {
      return null
    }
  }
  
  if (sessionHeader) {
    try {
      return JSON.parse(sessionHeader)
    } catch {
      return null
    }
  }
  
  return null
}

// التحقق من صحة الجلسة
function isValidSession(session: any): boolean {
  if (!session || !session.isAuthenticated || !session.token) {
    return false
  }
  
  // التحقق من انتهاء صلاحية الجلسة
  const now = Date.now()
  const loginTime = session.loginTime || 0
  const sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || '3600') * 1000 // 1 hour
  
  if (now - loginTime > sessionTimeout) {
    return false
  }
  
  // التحقق من نشاط المستخدم (30 دقيقة idle timeout)
  const lastActivity = session.lastActivity || 0
  const idleTimeout = 30 * 60 * 1000 // 30 minutes
  
  if (now - lastActivity > idleTimeout) {
    return false
  }
  
  // التحقق من صحة token
  if (!isValidToken(session.token)) {
    return false
  }
  
  return true
}

// التحقق من صحة token
function isValidToken(token: string): boolean {
  return typeof token === 'string' && token.length === 64 && /^[A-Za-z0-9]+$/.test(token)
}

// تحديث نشاط الجلسة
function updateSessionActivity(request: NextRequest, session: any) {
  const updatedSession = {
    ...session,
    lastActivity: Date.now()
  }
  
  // تحديث في response headers للاستخدام في client
  const response = NextResponse.next()
  response.headers.set('x-session-updated', 'true')
  
  return response
}

// حذف الجلسة من response
function deleteSessionFromResponse(response: NextResponse) {
  response.cookies.delete('admin_session')
  response.headers.set('x-session-cleared', 'true')
}

// إعداد headers للحماية
export const config = {
  matcher: [
    /*
     * تطابق فقط مسارات لوحة الإدارة:
     * - المسار الجديد: /dashboard_control_2024/*
     * - المسار القديم: /admin/*
     * - صفحات API الخاصة بالإدارة
     */
    '/dashboard_control_2024/:path*',
    '/admin/:path*',
  ],
}