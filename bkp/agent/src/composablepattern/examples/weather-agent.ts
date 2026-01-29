/**
 * @fileoverview Weather Agent Example
 * @description Example showing how to create a weather agent using the composable pattern
 */

import { 
  ComposableAgent, 
  createTool, 
  createCodeBoltDbMemory,
  z 
} from '../index';

// Mock weather function (in real usage, this would call a weather API)
async function getWeather(location: string) {
  // This is a mock implementation
  // In real usage, you would call a weather API like OpenWeatherMap
  return {
    temperature: 22,
    feelsLike: 25,
    humidity: 65,
    windSpeed: 10,
    windGust: 15,
    conditions: 'Partly cloudy',
    location: location
  };
}

// Create weather tool
export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

// Create agent
export const codeboltagent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: `
    You are a helpful weather assistant that provides accurate weather information and can help planning activities based on the weather.

    Your primary function is to help users get weather details for specific locations. When responding:
    - Always ask for a location if none is provided
    - If the location name isn't in English, please translate it
    - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
    - Include relevant details like humidity, wind conditions, and precipitation
    - Keep responses concise but informative
    - If the user asks for activities and provides the weather forecast, suggest activities based on the weather forecast.
    - If the user asks for activities, respond in the format they request.

    Use the weatherTool to fetch current weather data.
  `,
  model: 'gpt-4o-mini', // References configuration in codeboltagents.yaml
  tools: { weatherTool },
  memory: createCodeBoltDbMemory(),
});

// Example usage
export async function runWeatherExample() {
  try {
    console.log('Running weather agent example...');
    
    const result = await codeboltagent.execute('What is the weather like in New York?');
    
    if (result.success) {
      console.log('Agent response:', result.message);
    } else {
      console.error('Agent failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Example failed:', error);
    throw error;
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  runWeatherExample().catch(console.error);
}
