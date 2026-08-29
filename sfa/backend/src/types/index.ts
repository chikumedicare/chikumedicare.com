export interface Env {
	chikusfa_db: D1Database;
	chikusfa_storage?: R2Bucket;
	JWT_SECRET: string;
	NOTIFICATION_PROVIDER?: string;
	FCM_SERVER_KEY?: string;
	FIREBASE_SERVICE_ACCOUNT?: string;
}

export interface AuthUser {
	id: string;
	userId: string;
	fullName: string;
	role: string;
	empCode?: string;
	reportsToId?: string | null;
	reportsToIds?: string[];
	hqId?: string | null;
	coveringHqIds?: string[];
	areaIds?: string[];
	permissions?: string[];
	isActive?: boolean;
}
