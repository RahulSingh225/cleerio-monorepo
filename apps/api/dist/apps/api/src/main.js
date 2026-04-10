"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const common_2 = require("../../../libs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors({
        origin: (origin, callback) => {
            callback(null, true);
        },
        credentials: true,
    });
    const reflector = app.get(core_1.Reflector);
    app.useGlobalInterceptors(new common_2.ApiResponseInterceptor(reflector));
    app.useGlobalFilters(new common_2.ApiExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.setGlobalPrefix('v1');
    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map