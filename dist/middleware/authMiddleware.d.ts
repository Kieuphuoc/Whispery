import { RequestHandler } from 'express';
export declare const authenticate: RequestHandler;
export declare const optionalAuthenticate: RequestHandler;
export declare const authorize: (allowedRoles: string[]) => RequestHandler;
//# sourceMappingURL=authMiddleware.d.ts.map