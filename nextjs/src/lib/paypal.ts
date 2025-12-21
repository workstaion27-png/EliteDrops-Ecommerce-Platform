// src/lib/paypal.ts
import { loadScript } from '@paypal/paypal-js'

export const paypalScriptOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '', // PayPal Client ID
  currency: 'USD',
  intent: 'capture',
  'enable-funding': 'venmo',
  'disable-funding': 'credit,card',
  debug: process.env.NODE_ENV === 'development'
}

// تحميل PayPal SDK
export const loadPayPalScript = async () => {
  const paypal = await loadScript(paypalScriptOptions)
  if (!paypal) {
    throw new Error('Failed to load PayPal SDK')
  }
  return paypal
}