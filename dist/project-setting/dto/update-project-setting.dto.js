"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProjectSettingDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_project_setting_dto_1 = require("./create-project-setting.dto");
class UpdateProjectSettingDto extends (0, mapped_types_1.PartialType)(create_project_setting_dto_1.CreateProjectSettingDto) {
}
exports.UpdateProjectSettingDto = UpdateProjectSettingDto;
//# sourceMappingURL=update-project-setting.dto.js.map