import { z } from 'zod';
import { AgentMessageBaseSchema } from './baseSchemas';

/**
 * Job Notification Schemas for Agent-to-App Communication
 * Based on job operations in jobService.cli.ts
 */

// Base job notification schema
export const jobNotificationBaseSchema = AgentMessageBaseSchema.extend({
    toolUseId: z.string(),
    type: z.literal('jobnotify'),
    action: z.string(),
});

// Job Show Request
export const jobShowRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobShowRequest'),
    data: z.object({
        jobId: z.string(),
    }),
});

// Job Show Response
export const jobShowResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobShowResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job List Request
export const jobListRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobListRequest'),
    data: z.object({
        filters: z.any().optional(),
    }).optional(),
});

// Job List Response
export const jobListResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobListResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Create Request
export const jobCreateRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobCreateRequest'),
    data: z.object({
        groupId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.number().optional(),
        labels: z.array(z.string()).optional(),
        dependencies: z.array(z.string()).optional(),
    }),
});

// Job Create Response
export const jobCreateResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobCreateResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Update Request
export const jobUpdateRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobUpdateRequest'),
    data: z.object({
        jobId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.number().optional(),
        labels: z.array(z.string()).optional(),
    }),
});

// Job Update Response
export const jobUpdateResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobUpdateResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Delete Request
export const jobDeleteRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobDeleteRequest'),
    data: z.object({
        jobId: z.string(),
    }),
});

// Job Delete Response
export const jobDeleteResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobDeleteResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Lock Acquire Request
export const jobLockAcquireRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobLockAcquireRequest'),
    data: z.object({
        jobId: z.string(),
        agentId: z.string(),
        agentName: z.string().optional(),
    }),
});

// Job Lock Acquire Response
export const jobLockAcquireResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobLockAcquireResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Lock Release Request
export const jobLockReleaseRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobLockReleaseRequest'),
    data: z.object({
        jobId: z.string(),
        agentId: z.string(),
    }),
});

// Job Lock Release Response
export const jobLockReleaseResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobLockReleaseResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Job Bid Add Request
export const jobBidAddRequestNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobBidAddRequest'),
    data: z.object({
        jobId: z.string(),
        agentId: z.string(),
        agentName: z.string().optional(),
        reason: z.string(),
        priority: z.number(),
    }),
});

// Job Bid Add Response
export const jobBidAddResponseNotificationSchema = jobNotificationBaseSchema.extend({
    action: z.literal('jobBidAddResult'),
    content: z.union([z.string(), z.any()]),
    isError: z.boolean().optional(),
});

// Union of all job notification schemas
export const jobNotificationSchema = z.union([
    jobShowRequestNotificationSchema,
    jobShowResponseNotificationSchema,
    jobListRequestNotificationSchema,
    jobListResponseNotificationSchema,
    jobCreateRequestNotificationSchema,
    jobCreateResponseNotificationSchema,
    jobUpdateRequestNotificationSchema,
    jobUpdateResponseNotificationSchema,
    jobDeleteRequestNotificationSchema,
    jobDeleteResponseNotificationSchema,
    jobLockAcquireRequestNotificationSchema,
    jobLockAcquireResponseNotificationSchema,
    jobLockReleaseRequestNotificationSchema,
    jobLockReleaseResponseNotificationSchema,
    jobBidAddRequestNotificationSchema,
    jobBidAddResponseNotificationSchema,
]);

// Inferred TypeScript types
export type JobNotificationBase = z.infer<typeof jobNotificationBaseSchema>;
export type JobShowRequestNotification = z.infer<typeof jobShowRequestNotificationSchema>;
export type JobShowResponseNotification = z.infer<typeof jobShowResponseNotificationSchema>;
export type JobListRequestNotification = z.infer<typeof jobListRequestNotificationSchema>;
export type JobListResponseNotification = z.infer<typeof jobListResponseNotificationSchema>;
export type JobCreateRequestNotification = z.infer<typeof jobCreateRequestNotificationSchema>;
export type JobCreateResponseNotification = z.infer<typeof jobCreateResponseNotificationSchema>;
export type JobUpdateRequestNotification = z.infer<typeof jobUpdateRequestNotificationSchema>;
export type JobUpdateResponseNotification = z.infer<typeof jobUpdateResponseNotificationSchema>;
export type JobDeleteRequestNotification = z.infer<typeof jobDeleteRequestNotificationSchema>;
export type JobDeleteResponseNotification = z.infer<typeof jobDeleteResponseNotificationSchema>;
export type JobLockAcquireRequestNotification = z.infer<typeof jobLockAcquireRequestNotificationSchema>;
export type JobLockAcquireResponseNotification = z.infer<typeof jobLockAcquireResponseNotificationSchema>;
export type JobLockReleaseRequestNotification = z.infer<typeof jobLockReleaseRequestNotificationSchema>;
export type JobLockReleaseResponseNotification = z.infer<typeof jobLockReleaseResponseNotificationSchema>;
export type JobBidAddRequestNotification = z.infer<typeof jobBidAddRequestNotificationSchema>;
export type JobBidAddResponseNotification = z.infer<typeof jobBidAddResponseNotificationSchema>;

// Union types for convenience
export type JobNotification = z.infer<typeof jobNotificationSchema>;
