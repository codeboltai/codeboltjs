export enum TemplateEnum {
  USER = "userChat",
  AGENT = "agentChat",
  INFOWITHLINK = "informationWithUILink",
  AIREQUEST = "aiRequest",
  AGENTCHATWITHBUTTON = "agentChatWithButton",
  CONFIRMATIONCHAT = "confirmationChat",
  CENTERINFO = "centerInfo",
  MULTIBUTTONSELECT = "multibuttonselect",
  AGENTINFOCARD = "agentinfocard",
  AGENTSINFOLISTCARD = "agentsinfolistcard",
  CODECONFIRMATION = "codeconfirmation",
  CODEVIEWINEDITOR = "codeviewineditor",
  CONFIRMATIONWITHFEEDBACK = "confirmationwithfeedback",
  MANUALSTOPTEMPLATE = "manualstoptemplate",
  PORTCHECKANDCHANGE = "portcheckandchange",
  COMMANDCONFIRMATION = "commandconfirmation",
  COMMANDCONFIRMATIONHISTORY = "commandconfirmationhistory",
  FILEREAD = "FILEREAD",
  READFILE = "READFILE",
  WRITEFILE = "WRITEFILE",
  FILEWRITE = "FILEWRITE",
  SHADOWGIT = "shadowgit",
  FILEREADHISTORY = "filereadhistory",
  CHILDAGENTSTARTED = "childagentstarted",
  CHILDAGENTFINISHED = "childagentfinished",
  NEWAGENTBOX = "newagentbox",
  FOLDERREAD = 'FOLDERREAD',
  FILESEARCH = 'FILESEARCH',
  CODEDEFINITIONS = 'CODEDEFINITIONS',
  MCP_TOOL = 'MCP_TOOL',
  READMANYFILES = 'READMANYFILES',
  LISTDIRECTORY = 'LISTDIRECTORY',
  CODEBASESEARCH = 'CODEBASESEARCH',
  EDITOR_STATUS = 'EDITOR_STATUS',
  REVIEWMODE = 'REVIEWMODE',
  CREATE_FOLDER = "CREATE_FOLDER",
  LIST_DIRECTORY = "LIST_DIRECTORY",
  AGENT_TASK = "AGENT_TASK",
  WRITE_TODOS = "WRITE_TODOS",
}

export { BaseNotificationService } from "../../main/notificationManager/BaseNotificationService";
export { FileNotificationService } from "./FileNotificationService";
export { SearchNotificationService } from "./SearchNotificationService";
export { AiNotificationService } from "./AiNotificationService";
export { ChatNotificationService } from "./ChatNotificationService";

// Re-export the main NotificationService for backward compatibility
export { NotificationService, type NotificationMessage } from "./NotificationService";
