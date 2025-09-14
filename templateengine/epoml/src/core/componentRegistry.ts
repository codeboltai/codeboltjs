// Component registry to store custom components
const componentRegistry = new Map<string, Function>();

/**
 * Register a custom component
 * @param name The name of the component to register
 * @param component The component function
 */
export function registerComponent(name: string, component: Function): void {
  componentRegistry.set(name, component);
  // Also make it available globally for eval context
  (global as any)[name] = component;
}

/**
 * Unregister a custom component
 * @param name The name of the component to unregister
 */
export function unregisterComponent(name: string): void {
  componentRegistry.delete(name);
  // Also remove it from global context
  delete (global as any)[name];
}

/**
 * Get a registered component by name
 * @param name The name of the component to get
 * @returns The component function or undefined if not found
 */
export function getComponent(name: string): Function | undefined {
  return componentRegistry.get(name);
}

/**
 * Clear all registered components
 */
export function clearComponents(): void {
  // Remove all components from global context
  for (const name of componentRegistry.keys()) {
    delete (global as any)[name];
  }
  componentRegistry.clear();
}