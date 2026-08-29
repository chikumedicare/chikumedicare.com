import { Env } from '../types';

export class AppVersionController {
	static async getLatest(request: Request, env: Env) {
		try {
			const release: any = await env.chikusfa_db.prepare('SELECT * FROM app_releases ORDER BY version_code DESC LIMIT 1').first();
			if (!release) {
				return new Response(JSON.stringify({
					version_code: 0,
					version_name: '0.0.0',
					download_url: '',
					is_mandatory: false,
					release_notes: ''
				}), { headers: { 'Content-Type': 'application/json' } });
			}
			return new Response(JSON.stringify(release), { headers: { 'Content-Type': 'application/json' } });
		} catch (err: any) {
			return new Response(JSON.stringify({ error: err.message }), { status: 500 });
		}
	}
}
