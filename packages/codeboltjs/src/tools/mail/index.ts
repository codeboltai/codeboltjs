/**
 * Mail operation tools
 */

export { MailRegisterAgentTool, type MailRegisterAgentToolParams } from './mail-register-agent';
export { MailListAgentsTool, type MailListAgentsToolParams } from './mail-list-agents';
export { MailGetAgentTool, type MailGetAgentToolParams } from './mail-get-agent';
export { MailCreateThreadTool, type MailCreateThreadToolParams } from './mail-create-thread';
export { MailFindOrCreateThreadTool, type MailFindOrCreateThreadToolParams } from './mail-find-or-create-thread';
export { MailListThreadsTool, type MailListThreadsToolParams } from './mail-list-threads';
export { MailGetThreadTool, type MailGetThreadToolParams } from './mail-get-thread';
export { MailUpdateThreadStatusTool, type MailUpdateThreadStatusToolParams } from './mail-update-thread-status';
export { MailArchiveThreadTool, type MailArchiveThreadToolParams } from './mail-archive-thread';
export { MailFetchInboxTool, type MailFetchInboxToolParams } from './mail-fetch-inbox';
export { MailSendMessageTool, type MailSendMessageToolParams } from './mail-send-message';
export { MailReplyMessageTool, type MailReplyMessageToolParams } from './mail-reply-message';
export { MailGetMessageTool, type MailGetMessageToolParams } from './mail-get-message';
export { MailGetMessagesTool, type MailGetMessagesToolParams } from './mail-get-messages';
export { MailMarkReadTool, type MailMarkReadToolParams } from './mail-mark-read';
export { MailAcknowledgeTool, type MailAcknowledgeToolParams } from './mail-acknowledge';
export { MailSearchTool, type MailSearchToolParams } from './mail-search';
export { MailSummarizeThreadTool, type MailSummarizeThreadToolParams } from './mail-summarize-thread';
export { MailReserveFilesTool, type MailReserveFilesToolParams } from './mail-reserve-files';
export { MailReleaseFilesTool, type MailReleaseFilesToolParams } from './mail-release-files';
export { MailForceReserveFilesTool, type MailForceReserveFilesToolParams } from './mail-force-reserve-files';
export { MailListReservationsTool, type MailListReservationsToolParams } from './mail-list-reservations';
export { MailCheckConflictsTool, type MailCheckConflictsToolParams } from './mail-check-conflicts';

// Create instances for convenience
import { MailRegisterAgentTool } from './mail-register-agent';
import { MailListAgentsTool } from './mail-list-agents';
import { MailGetAgentTool } from './mail-get-agent';
import { MailCreateThreadTool } from './mail-create-thread';
import { MailFindOrCreateThreadTool } from './mail-find-or-create-thread';
import { MailListThreadsTool } from './mail-list-threads';
import { MailGetThreadTool } from './mail-get-thread';
import { MailUpdateThreadStatusTool } from './mail-update-thread-status';
import { MailArchiveThreadTool } from './mail-archive-thread';
import { MailFetchInboxTool } from './mail-fetch-inbox';
import { MailSendMessageTool } from './mail-send-message';
import { MailReplyMessageTool } from './mail-reply-message';
import { MailGetMessageTool } from './mail-get-message';
import { MailGetMessagesTool } from './mail-get-messages';
import { MailMarkReadTool } from './mail-mark-read';
import { MailAcknowledgeTool } from './mail-acknowledge';
import { MailSearchTool } from './mail-search';
import { MailSummarizeThreadTool } from './mail-summarize-thread';
import { MailReserveFilesTool } from './mail-reserve-files';
import { MailReleaseFilesTool } from './mail-release-files';
import { MailForceReserveFilesTool } from './mail-force-reserve-files';
import { MailListReservationsTool } from './mail-list-reservations';
import { MailCheckConflictsTool } from './mail-check-conflicts';

/**
 * All mail operation tools
 */
export const mailTools = [
    new MailRegisterAgentTool(),
    new MailListAgentsTool(),
    new MailGetAgentTool(),
    new MailCreateThreadTool(),
    new MailFindOrCreateThreadTool(),
    new MailListThreadsTool(),
    new MailGetThreadTool(),
    new MailUpdateThreadStatusTool(),
    new MailArchiveThreadTool(),
    new MailFetchInboxTool(),
    new MailSendMessageTool(),
    new MailReplyMessageTool(),
    new MailGetMessageTool(),
    new MailGetMessagesTool(),
    new MailMarkReadTool(),
    new MailAcknowledgeTool(),
    new MailSearchTool(),
    new MailSummarizeThreadTool(),
    new MailReserveFilesTool(),
    new MailReleaseFilesTool(),
    new MailForceReserveFilesTool(),
    new MailListReservationsTool(),
    new MailCheckConflictsTool(),
];
