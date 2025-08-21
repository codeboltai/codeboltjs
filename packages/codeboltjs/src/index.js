"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codebolt = void 0;
const Codebolt_1 = __importDefault(require("./core/Codebolt"));
exports.Codebolt = Codebolt_1.default;
// ================================
// Main Library Instance
// ================================
const codebolt = new Codebolt_1.default();
// ================================
// Export the Main Instance and Class
// ================================
// For ES6 modules (import)
exports.default = codebolt;
// For CommonJS compatibility (require)
module.exports = codebolt;
module.exports.default = codebolt;
module.exports.Codebolt = Codebolt_1.default;
