"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportJobsModule = void 0;
const common_1 = require("@nestjs/common");
const report_jobs_controller_1 = require("./report-jobs.controller");
const report_jobs_service_1 = require("./report-jobs.service");
let ReportJobsModule = class ReportJobsModule {
};
exports.ReportJobsModule = ReportJobsModule;
exports.ReportJobsModule = ReportJobsModule = __decorate([
    (0, common_1.Module)({
        controllers: [report_jobs_controller_1.ReportJobsController],
        providers: [report_jobs_service_1.ReportJobsService],
        exports: [report_jobs_service_1.ReportJobsService],
    })
], ReportJobsModule);
//# sourceMappingURL=report-jobs.module.js.map