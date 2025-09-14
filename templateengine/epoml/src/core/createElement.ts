import { Component } from '../types';
import { getComponent } from './componentRegistry';

/**
 * Create a component element
 * @param type The component type (string or function)
 * @param props Properties to pass to the component
 * @param children Child elements
 * @returns A Component object
 */
export function createElement(
  type: string | Function,
  props: { [key: string]: any },
  ...children: (Component | string)[]
): Component {
  // If type is a string, check if there's a custom component registered with that name
  if (typeof type === 'string') {
    const customComponent = getComponent(type);
    if (customComponent) {
      type = customComponent;
    }
  }
  
  const flattenedChildren = children.flat();
  return { type, props, children: flattenedChildren || [] };
}