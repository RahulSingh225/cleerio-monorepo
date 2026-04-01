"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRulesModule = void 0;
const common_1 = require("@nestjs/common");
const workflow_rules_controller_1 = require("./workflow-rules.controller");
const workflow_rules_service_1 = require("./workflow-rules.service");
const eligibility_service_1 = require("./eligibility.service");
const communication_service_1 = require("./communication.service");
let WorkflowRulesModule = class WorkflowRulesModule {
};
exports.WorkflowRulesModule = WorkflowRulesModule;
exports.WorkflowRulesModule = WorkflowRulesModule = __decorate([
    (0, common_1.Module)({
        controllers: [workflow_rules_controller_1.WorkflowRulesController],
        providers: [
            workflow_rules_service_1.WorkflowRulesService,
            eligibility_service_1.EligibilityService,
            communication_service_1.CommunicationService,
        ],
        exports: [
            workflow_rules_service_1.WorkflowRulesService,
            eligibility_service_1.EligibilityService,
            communication_service_1.CommunicationService,
        ],
    })
], WorkflowRulesModule);
//# sourceMappingURL=workflow-rules.module.js.map