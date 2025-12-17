Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { amount, currency = 'usd', cartItems, customerEmail, shippingAddress, billingAddress } = await req.json();

        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Cart items are required');
        }

        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey) {
            throw new Error('Stripe not configured');
        }

        // Get user from auth header
        let userId = null;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey!
                    }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    userId = userData.id;
                }
            } catch (error) {
                console.log('Could not get user:', error);
            }
        }

        // Create Stripe payment intent
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString());
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[customer_email]', customerEmail || '');
        stripeParams.append('metadata[user_id]', userId || '');

        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            throw new Error(`Stripe error: ${errorData}`);
        }

        const paymentIntent = await stripeResponse.json();

        // Generate order number
        const orderNumber = `ED-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create order in database
        const orderData = {
            user_id: userId,
            order_number: orderNumber,
            stripe_payment_intent_id: paymentIntent.id,
            status: 'pending',
            total_amount: amount,
            subtotal: amount,
            currency: currency,
            shipping_address: shippingAddress || null,
            billing_address: billingAddress || null,
            customer_email: customerEmail || null,
        };

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey!,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            throw new Error(`Failed to create order: ${errorText}`);
        }

        const order = await orderResponse.json();
        const orderId = order[0].id;

        // Create order items
        const orderItems = cartItems.map((item: any) => ({
            order_id: orderId,
            product_id: item.product_id,
            cj_product_id: item.cj_product_id || null,
            quantity: item.quantity,
            price_at_time: item.price,
            product_name: item.product_name,
            product_image_url: item.product_image_url || null,
            variant_info: item.variant_info || null,
        }));

        await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey!,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderItems)
        });

        return new Response(JSON.stringify({
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                orderId: orderId,
                orderNumber: orderNumber,
                amount: amount,
                currency: currency,
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment intent error:', error);
        return new Response(JSON.stringify({
            error: { code: 'PAYMENT_FAILED', message: error.message }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
