"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const common_1 = require("@nestjs/common");
const roles_guard_1 = require("../../guards/roles.guard");
const roles_decorator_1 = require("./roles.decorator");
const jwt_auth_guard_1 = require("../../user/guards/jwt-auth/jwt-auth.guard");
function Auth(...roles) {
    return (0, common_1.applyDecorators)((0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard), (0, roles_decorator_1.Roles)(...roles));
}
exports.Auth = Auth;
//# sourceMappingURL=auth.decorator.js.map