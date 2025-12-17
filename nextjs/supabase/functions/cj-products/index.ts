Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const cjApiKey = Deno.env.get('CJ_API_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'list';
        const category = url.searchParams.get('category') || '';
        const search = url.searchParams.get('search') || '';
        const page = url.searchParams.get('page') || '1';

        // If CJ API key is available, fetch from CJ Dropshipping
        if (cjApiKey) {
            let cjUrl = 'https://developers.cjdropshipping.com/api/product/list';
            const params = new URLSearchParams({
                pageNum: page,
                pageSize: '20',
            });
            if (category) params.append('categoryId', category);
            if (search) params.append('productName', search);

            const cjResponse = await fetch(`${cjUrl}?${params.toString()}`, {
                headers: {
                    'CJ-Access-Token': cjApiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (cjResponse.ok) {
                const cjData = await cjResponse.json();
                
                // Transform CJ products and sync to database
                if (cjData.data && cjData.data.list) {
                    const products = cjData.data.list.map((p: any) => ({
                        cj_product_id: p.pid,
                        name: p.productName,
                        description: p.productNameEn || p.productName,
                        price: parseFloat(p.sellPrice) || 19.99,
                        compare_price: parseFloat(p.sellPrice) * 1.5,
                        images: p.productImage ? [p.productImage] : [],
                        category: p.categoryName || 'General',
                        inventory_count: 100,
                        is_active: true,
                    }));

                    return new Response(JSON.stringify({ data: { products, total: cjData.data.total } }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            }
        }

        // Fallback: Fetch from local database
        let dbUrl = `${supabaseUrl}/rest/v1/products?is_active=eq.true&order=created_at.desc`;
        if (category) dbUrl += `&category=eq.${encodeURIComponent(category)}`;
        if (search) dbUrl += `&name=ilike.*${encodeURIComponent(search)}*`;

        const dbResponse = await fetch(dbUrl, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey!,
            }
        });

        const products = await dbResponse.json();

        return new Response(JSON.stringify({ data: { products, total: products.length } }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('CJ Products error:', error);
        return new Response(JSON.stringify({
            error: { code: 'PRODUCTS_FAILED', message: error.message }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
