"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("../core/websocket"));
const enum_1 = require("@codebolt/types/enum");
/**
 * A module for interacting with project settings and paths.
 */
const cbproject = {
    /**
     * Retrieves the project settings from the server.
     * @returns {Promise<GetProjectSettingsResponse>} A promise that resolves with the project settings response.
     */
    getProjectSettings: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.PROJECT_EVENT,
            "action": enum_1.ProjectAction.GET_PROJECT_SETTINGS
        }, enum_1.ProjectResponseType.GET_PROJECT_SETTINGS_RESPONSE);
    },
    /**
     * Retrieves the path of the current project.
     * @returns {Promise<GetProjectPathResponse>} A promise that resolves with the project path response.
     */
    getProjectPath: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.PROJECT_EVENT,
            "action": enum_1.ProjectAction.GET_PROJECT_PATH
        }, enum_1.ProjectResponseType.GET_PROJECT_PATH_RESPONSE);
    },
    getRepoMap: (message) => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.PROJECT_EVENT,
            "action": enum_1.ProjectAction.GET_REPO_MAP,
            message
        }, enum_1.ProjectResponseType.GET_REPO_MAP_RESPONSE);
    },
    runProject: () => {
        websocket_1.default.messageManager.send({
            "type": enum_1.EventType.PROJECT_EVENT,
            "action": enum_1.ProjectAction.RUN_PROJECT
        });
    },
    getEditorFileStatus: () => {
        return websocket_1.default.messageManager.sendAndWaitForResponse({
            "type": enum_1.EventType.PROJECT_EVENT,
            "action": enum_1.ProjectAction.GET_EDITOR_FILE_STATUS,
        }, enum_1.ProjectResponseType.GET_EDITOR_FILE_STATUS_RESPONSE);
    }
};
exports.default = cbproject;
