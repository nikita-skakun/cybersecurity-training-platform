export interface User {
	username: string;
	name: string;
	baseDN: string;
	domain: string;
	role: string;
	id: number;

	// JWT claims
	exp?: number;
	nbf?: number;
	iat?: number;
}

export interface AdminUserInfo {
	username: string;
	id: number;
	name: string;
	compQuizzes?: number;
	compModules?: number;
	avgScore?: number;
}
