import { Component } from '../types';

/**
 * Fragment component for grouping elements without a wrapper
 * @param props Properties containing children
 * @returns Array of child components
 */
export function Fragment(props: { children: (Component | string)[] }): (Component | string)[] {
  return props.children;
}