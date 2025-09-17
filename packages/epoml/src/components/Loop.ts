import { Component } from '../types';
import { evaluateArrayExpression, createLoopContext, parseLoopExpression } from '../utils/conditionalUtils';
import { processTemplateVars } from '../utils';
import { Fragment } from '../core/Fragment';
import { createElement } from '../core/createElement';

export interface LoopProps {
  for: string;
  children?: (Component | string)[];
  context?: Record<string, any>;
}

/**
 * Loop component that handles iteration over arrays with proper context management
 * Usage: <Loop for="item in items">{{item}}</Loop>
 */
export function Loop(props: LoopProps): Component {
  const { for: loopExpression, children = [], context = {} } = props;
  
  // Parse the loop expression (e.g., "item in items")
  const loopParts = parseLoopExpression(loopExpression);
  if (!loopParts) {
    console.warn('Invalid loop expression:', loopExpression);
    return Fragment({ children: [] }) as unknown as Component;
  }
  
  const array = evaluateArrayExpression(loopParts.arrayExpression, context);
  
  // Create loop children with proper context
  const loopChildren: (Component | string)[] = [];
  
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    // Create a new context with loop variables
    const loopContext = createLoopContext(context, loopParts.itemName, item, i, array.length);
    
    // Process each child with the loop context
    children.forEach(child => {
      if (typeof child === 'string') {
        // Process template variables in string children
        const processedContent = processTemplateVars(child, loopContext);
        loopChildren.push(processedContent);
      } else {
        // For component children, we need to pass the context down
        // Create a new component with the loop context
        loopChildren.push({
          ...child,
          props: {
            ...child.props,
            context: loopContext
          }
        });
      }
    });
  }
  
  // Return a Fragment with all the loop children
  return Fragment({ children: loopChildren }) as unknown as Component;
}