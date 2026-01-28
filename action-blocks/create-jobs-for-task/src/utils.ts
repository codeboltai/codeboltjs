import { GeneratedJobDetails, JobPriority } from './types';

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Converts task priority string to job priority number
 */
export function mapPriority(priority?: string): JobPriority {
    switch (priority?.toLowerCase()) {
        case 'high': return 4;
        case 'medium': return 3;
        case 'low': return 2;
        default: return 3;
    }
}

/**
 * Parses JSON from LLM response, handling markdown code blocks
 */
export function parseJsonResponse(content: string): GeneratedJobDetails | null {
    try {
        let jsonStr = content;

        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace('```json', '').replace('```', '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```/g, '');
        }

        return JSON.parse(jsonStr.trim()) as GeneratedJobDetails;
    } catch (e) {
        return null;
    }
}
