"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryLogsModule = void 0;
const common_1 = require("@nestjs/common");
const delivery_logs_controller_1 = require("./delivery-logs.controller");
const delivery_logs_service_1 = require("./delivery-logs.service");
let DeliveryLogsModule = class DeliveryLogsModule {
};
exports.DeliveryLogsModule = DeliveryLogsModule;
exports.DeliveryLogsModule = DeliveryLogsModule = __decorate([
    (0, common_1.Module)({
        controllers: [delivery_logs_controller_1.DeliveryLogsController],
        providers: [delivery_logs_service_1.DeliveryLogsService],
        exports: [delivery_logs_service_1.DeliveryLogsService],
    })
], DeliveryLogsModule);
//# sourceMappingURL=delivery-logs.module.js.map