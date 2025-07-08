"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const bodyParser = __importStar(require("body-parser"));
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    if (error && typeof error === 'object' && 'message' in error)
        return String(error.message);
    return 'Unknown error occurred';
}
async function bootstrap() {
    const logger = new common_1.Logger('ZIP-Microservice');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ZIP Microservice')
        .setDescription('Zips presigned S3 files')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    process.on('unhandledRejection', (reason) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        logger.error(`Unhandled Rejection: ${error.message}`);
        if (error.stack) {
            logger.error(error.stack);
        }
    });
    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${getErrorMessage(error)}`);
    });
    await app.listen(3000);
    logger.log('ZIP Microservice running at http://localhost:3000');
    logger.log('Swagger docs available at http://localhost:3000/api-docs');
}
bootstrap();
//# sourceMappingURL=main.js.map