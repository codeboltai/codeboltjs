/**
 * Linear webhook signature verification and payload parsing.
 *
 * Linear signs webhooks with HMAC-SHA256 using the webhook secret.
 * The signature is sent in the `linear-signature` header.
 */

import type { AgentSessionWebhookPayload } from '../types.js';

/**
 * Verify the webhook signature from Linear.
 * Returns true if the signature is valid.
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  );

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(signature, expectedSignature);
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Parse and validate an AgentSessionEvent webhook payload.
 */
export function parseAgentSessionEvent(
  body: string
): AgentSessionWebhookPayload | null {
  try {
    const payload = JSON.parse(body);

    // Validate it's an AgentSession event
    if (payload.type !== 'AgentSession') {
      console.log(
        `[Webhook] Ignoring non-AgentSession event: ${payload.type}`
      );
      return null;
    }

    // Validate action
    if (payload.action !== 'created' && payload.action !== 'prompted') {
      console.log(
        `[Webhook] Ignoring unknown action: ${payload.action}`
      );
      return null;
    }

    // Validate agentSession exists
    if (!payload.agentSession?.id) {
      console.error('[Webhook] Missing agentSession.id in payload');
      return null;
    }

    return payload as AgentSessionWebhookPayload;
  } catch (err) {
    console.error('[Webhook] Failed to parse payload:', err);
    return null;
  }
}
