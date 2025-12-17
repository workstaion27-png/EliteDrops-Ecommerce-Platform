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
        const { paymentIntentId, orderId } = await req.json();

        if (!paymentIntentId || !orderId) {
            throw new Error('Payment intent ID and order ID required');
        }

        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        // Verify payment with Stripe
        const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
            }
        });

        if (!stripeResponse.ok) {
            throw new Error('Failed to verify payment');
        }

        const paymentIntent = await stripeResponse.json();

        // Update order status based on payment status
        let orderStatus = 'pending';
        if (paymentIntent.status === 'succeeded') {
            orderStatus = 'paid';
        } else if (paymentIntent.status === 'canceled') {
            orderStatus = 'cancelled';
        }

        // Update order in database
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey!,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: orderStatus,
                updated_at: new Date().toISOString()
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update order status');
        }

        const updatedOrder = await updateResponse.json();

        return new Response(JSON.stringify({
            data: {
                success: true,
                orderStatus: orderStatus,
                paymentStatus: paymentIntent.status,
                order: updatedOrder[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Confirm payment error:', error);
        return new Response(JSON.stringify({
            error: { code: 'CONFIRM_FAILED', message: error.message }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
