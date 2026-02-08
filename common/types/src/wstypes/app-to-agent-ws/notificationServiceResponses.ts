import { z } from 'zod';

// Notification service response schemas
export const NotificationOperationSuccessResponseSchema = z.object({
  type: z.string(),
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional(),
});

export const NotificationOperationErrorResponseSchema = z.object({
  type: z.string(),
  success: z.literal(false),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const NotificationServiceResponseSchema = z.union([
  NotificationOperationSuccessResponseSchema,
  NotificationOperationErrorResponseSchema,
]);

export type NotificationOperationSuccessResponse = z.infer<typeof NotificationOperationSuccessResponseSchema>;
export type NotificationOperationErrorResponse = z.infer<typeof NotificationOperationErrorResponseSchema>;
export type NotificationServiceResponse = z.infer<typeof NotificationServiceResponseSchema>;
