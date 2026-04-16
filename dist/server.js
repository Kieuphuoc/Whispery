import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { socketService } from './services/socketService.js';
import './configs/passport.js';
import { swaggerSpec } from './configs/swagger.js';
import voiceRoutes from './routes/voiceRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reactionRoutes from './routes/reactionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminStatsRoutes from './routes/adminStatsRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Middleware
app.use(cors());
app.use(express.json());
// Request logger
app.use((req, _res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});
// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Whispery API Documentation'
}));
// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});
// Routes
app.use('/auth', authRoutes);
app.use('/voice', voiceRoutes);
app.use('/comment', commentRoutes);
app.use('/friend', friendRoutes);
app.use('/user', userRoutes);
app.use('/reaction', reactionRoutes);
app.use('/notification', notificationRoutes);
app.use('/report', reportRoutes);
app.use('/admin/stats', adminStatsRoutes);
app.use('/chat', chatRoutes);
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
// Initialize Socket.io
console.log('[SERVER] Initializing Socket.io server...');
socketService.init(httpServer);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), socket: 'initialized' });
});
httpServer.on('error', (err) => {
    console.error('[SERVER] Critical HTTP Server Error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`[SERVER] Port ${PORT} is already in use.`);
    }
    process.exit(1);
});
httpServer.listen(PORT, () => {
    console.log(`[SERVER] Successful startup on port ${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    // Log all routes
    console.log('--- Registered Routes ---');
    const routes = [];
    // In Express 5, _router might be handled differently or removed from public accessibility
    const router = app._router || app.router;
    if (router && router.stack) {
        router.stack.forEach((middleware) => {
            if (middleware.route) { // routes registered directly on the app
                const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
                routes.push(`${methods} ${middleware.route.path}`);
            }
            else if (middleware.name === 'router' && middleware.handle && middleware.handle.stack) { // router middleware
                middleware.handle.stack.forEach((handler) => {
                    const route = handler.route;
                    if (route) {
                        const methods = Object.keys(route.methods).join(',').toUpperCase();
                        const regexpSource = middleware.regexp ? middleware.regexp.source : '';
                        const path = regexpSource
                            .replace('^', '')
                            .replace('\\/?(?=\\/|$)', '')
                            .replace('\\/', '/')
                            .replace('g', '')
                            .replace('i', '');
                        routes.push(`${methods} ${path}${route.path}`);
                    }
                });
            }
        });
        console.log(routes.join('\n'));
    }
    else {
        console.log('Route listing not available for this Express version.');
    }
    console.log('-------------------------');
});
export default app;
//# sourceMappingURL=server.js.map