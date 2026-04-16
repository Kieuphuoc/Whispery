const logMiddleware = (req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
};
export default logMiddleware;
//# sourceMappingURL=logMiddleware.js.map