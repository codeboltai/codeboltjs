import { epomlparse } from 'epoml';

/**
 * Helper function to test component rendering with epomlparse
 * @param template - The EPOML template to parse
 * @param variables - Optional variables to pass to the template
 * @returns The parsed output as a string
 */
export async function testComponent(template: string, variables?: Record<string, any>): Promise<string> {
  return await epomlparse(template, variables);
}