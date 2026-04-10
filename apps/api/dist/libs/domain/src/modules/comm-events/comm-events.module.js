"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommEventsModule = void 0;
const common_1 = require("@nestjs/common");
const comm_events_controller_1 = require("./comm-events.controller");
const comm_events_service_1 = require("./comm-events.service");
let CommEventsModule = class CommEventsModule {
};
exports.CommEventsModule = CommEventsModule;
exports.CommEventsModule = CommEventsModule = __decorate([
    (0, common_1.Module)({
        controllers: [comm_events_controller_1.CommEventsController],
        providers: [comm_events_service_1.CommEventsService],
        exports: [comm_events_service_1.CommEventsService],
    })
], CommEventsModule);
//# sourceMappingURL=comm-events.module.js.map