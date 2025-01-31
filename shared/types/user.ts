export interface User {
	username: string;
	name: string;
	baseDN: string;
    domain: string;
	role: string;

    // JWT claims
    exp?: number;
    nbf?: number;
    iat?: number;
}
