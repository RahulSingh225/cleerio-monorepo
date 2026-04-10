"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTenantUserDto = exports.CreateTenantUserDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTenantUserDto {
    tenantId;
    email;
    name;
    password;
    role;
    invitedBy;
}
exports.CreateTenantUserDto = CreateTenantUserDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "tenantId", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['tenant_admin', 'analyst', 'ops', 'viewer']),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTenantUserDto.prototype, "invitedBy", void 0);
class UpdateTenantUserDto {
    name;
    role;
    status;
    password;
}
exports.UpdateTenantUserDto = UpdateTenantUserDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['tenant_admin', 'analyst', 'ops', 'viewer']),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'inactive', 'invited']),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTenantUserDto.prototype, "password", void 0);
//# sourceMappingURL=create-tenant-user.dto.js.map