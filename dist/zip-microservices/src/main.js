"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../zip-microservices/../app.module");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'https://fotosfolio.com',
            'http://localhost:5173',
            'http://localhost:3000',
            'https://dev.fotosfolio.com',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
        credentials: true,
    });
    app.connectMicroservice({
        transport: microservices_1.Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: 3001,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    await app.startAllMicroservices();
    await app.listen(3001);
    console.log(`ZIP Microservice is running on port 3001`);
}
bootstrap();
//# sourceMappingURL=main.js.map