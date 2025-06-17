"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectType = exports.StorageType = void 0;
const typeorm_1 = require("typeorm");
const base_project_entity_1 = require("./base-project.entity");
var StorageType;
(function (StorageType) {
    StorageType["MONTHLY"] = "monthly";
    StorageType["FOREVER"] = "forever";
})(StorageType = exports.StorageType || (exports.StorageType = {}));
var ProjectType;
(function (ProjectType) {
    ProjectType["Wedding"] = "Wedding";
    ProjectType["Engagement"] = "Engagement";
    ProjectType["Portrait"] = "Portrait";
    ProjectType["Family"] = "Family";
    ProjectType["Maternity"] = "Maternity";
    ProjectType["Newborn"] = "Newborn";
    ProjectType["Graduation"] = "Graduation";
    ProjectType["Birthday"] = "Birthday";
    ProjectType["Corporate"] = "Corporate";
    ProjectType["Event"] = "Event";
    ProjectType["Product"] = "Product";
    ProjectType["Fashion"] = "Fashion";
    ProjectType["Travel"] = "Travel";
    ProjectType["Sports"] = "Sports";
    ProjectType["Architecture"] = "Architecture";
    ProjectType["FineArt"] = "Fine Art";
    ProjectType["Personal"] = "Personal";
    ProjectType["Other"] = "Other";
})(ProjectType = exports.ProjectType || (exports.ProjectType = {}));
let Project = class Project extends base_project_entity_1.BaseProject {
};
Project = __decorate([
    (0, typeorm_1.Entity)()
], Project);
exports.Project = Project;
//# sourceMappingURL=project.entity.js.map