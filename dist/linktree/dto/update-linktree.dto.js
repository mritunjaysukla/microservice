"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLinktreeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_linktree_dto_1 = require("./create-linktree.dto");
class UpdateLinktreeDto extends (0, mapped_types_1.PartialType)(create_linktree_dto_1.CreateLinktreeDto) {
}
exports.UpdateLinktreeDto = UpdateLinktreeDto;
//# sourceMappingURL=update-linktree.dto.js.map