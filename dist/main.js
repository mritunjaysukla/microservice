"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const bodyParser = require("body-parser");
async function bootstrap() {
    const logger = new common_1.Logger('ZIP-Microservice');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    await app.listen(3000);
    logger.log('ZIP Microservice running at http://localhost:3000');
    logger.log('Swagger docs available at /api-docs');
}
bootstrap();
//# sourceMappingURL=main.js.map