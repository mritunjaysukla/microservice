"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppEnv = exports.getConfig = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
}
const envFile = process.env.NODE_ENV === 'development' ? '.env.development' : '.env';
(0, dotenv_1.config)({
    path: (0, path_1.join)(process.cwd(), envFile),
    override: true
});
const getConfig = () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    appEnv: process.env.APP_ENV,
    jwtSecret: process.env.JWT_SECRET,
    logLevel: process.env.LOG_LEVEL || 'info',
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT, 10) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME,
    },
    cache: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
    },
    mail: {
        from: process.env.MAIL_FROM,
        transportOptions: {
            host: process.env.MAIL_HOST,
            port: parseInt(process.env.MAIL_PORT, 10),
            auth: {
                user: process.env.MAIL_AUTH_USER,
                pass: process.env.MAIL_AUTH_PASS,
            },
        },
    },
});
exports.getConfig = getConfig;
var AppEnv;
(function (AppEnv) {
    AppEnv["DEV"] = "dev";
    AppEnv["TEST"] = "test";
    AppEnv["PROD"] = "production";
})(AppEnv = exports.AppEnv || (exports.AppEnv = {}));
//# sourceMappingURL=configuration.js.map