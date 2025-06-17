"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFeedbackDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const createFeedback_dto_1 = require("./createFeedback.dto");
class UpdateFeedbackDto extends (0, mapped_types_1.PartialType)(createFeedback_dto_1.CreateFeedbackDto) {
}
exports.UpdateFeedbackDto = UpdateFeedbackDto;
//# sourceMappingURL=updateFeedback.dto.js.map