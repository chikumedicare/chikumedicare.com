import { Env } from './types';
import { router } from './router';
import { CronService } from './services/CronService';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const origin = request.headers.get('Origin') || '*';
		const corsHeaders: Record<string, string> = {
			'Access-Control-Allow-Origin': origin,
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Financial-Year, X-Device-Id, X-GPS-Enabled, X-Requested-With, X-CSRF-Protection, x-financial-year, x-device-id, x-gps-enabled, x-requested-with, x-csrf-protection',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		if (!env.JWT_SECRET) {
			return new Response(JSON.stringify({ error: 'Server misconfiguration: missing JWT_SECRET' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		try {
			const response = await router.handle(request, env);
			
			// Append CORS headers to the router's response
			const newHeaders = new Headers(response.headers);
			Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));
			
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: newHeaders
			});
		} catch (e: any) {
			console.error('Unhandled request error:', e);
			return new Response(JSON.stringify({ error: 'Internal Server Error', message: e?.message }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}
	},

	async scheduled(event: any, env: Env, ctx: any) {
		const cronService = new CronService();
		await cronService.handleScheduled(env);
	}
};
