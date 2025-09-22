import { Component } from '../types';
import { Fragment } from './Fragment';
import { evaluateCondition } from '../utils/conditionalUtils';
import { processTemplateVars } from '../utils';
import { getComponent } from './componentRegistry';
import { Example } from '../components/Example';
import { Loop } from '../components/Loop';

// Evaluation context for conditional rendering and loops
let evaluationContext: Record<string, any> = {};

/**
 * Set the evaluation context for conditional rendering and loops
 * @param context The context to set
 */
export function setEvaluationContext(context: Record<string, any>): void {
  evaluationContext = context;
}

/**
 * Get the current evaluation context
 * @returns The current evaluation context
 */
export function getEvaluationContext(): Record<string, any> {
  return evaluationContext;
}

/**
 * Render a component tree to a string
 * @param component The component to render
 * @returns Promise resolving to the rendered string
 */
export async function render(component: Component | string): Promise<string> {
  if (typeof component === 'string') {
    // Process template variables in string content
    return processTemplateVars(component, evaluationContext);
  }

  if (Array.isArray(component)) {
    return (await Promise.all(component.map(render))).join('');
  }

  // Use the context from the component if it exists, otherwise use the global evaluation context
  const renderContext = component.props?.context || evaluationContext;

  // Handle conditional rendering with 'if' attribute
  if (component.props?.if !== undefined) {
    // If the if attribute is a boolean, use it directly
    if (typeof component.props.if === 'boolean') {
      if (!component.props.if) {
        return ''; // Don't render if condition is false
      }
    } else if (typeof component.props.if === 'string') {
      // If the if attribute is a string, evaluate it as an expression
      if (!evaluateCondition(component.props.if, renderContext)) {
        return ''; // Don't render if condition is false
      }
    }
  }

  // Handle loop rendering with 'for' attribute
  if (component.props?.for !== undefined) {
    // Process the for attribute with template variables
    const processedFor = typeof component.props.for === 'string' 
      ? processTemplateVars(component.props.for, renderContext)
      : component.props.for;
    
    // Create a Loop component and render it
    const loopResult = await Loop({
      for: processedFor,
      context: renderContext,
      children: component.children
    });
    return render(loopResult);
  }

  // Handle function components directly
  if (typeof component.type === 'function') {
    // Special handling for built-in components
    if (component.type === Example) {
      // Process component props with the current context
      const processedExampleProps: Record<string, any> = {};
      for (const [key, value] of Object.entries(component.props || {})) {
        if (typeof value === 'string') {
          // Process string props with template variables
          processedExampleProps[key] = processTemplateVars(value, renderContext);
        } else {
          processedExampleProps[key] = value;
        }
      }
      
      // Render using the Example component function
      const exampleResult = await Example({ ...processedExampleProps, children: component.children });
      return render(exampleResult);
    }
    
    if (component.type === Loop) {
      // Process component props with the current context
      const processedLoopProps: Record<string, any> = {};
      for (const [key, value] of Object.entries(component.props || {})) {
        if (typeof value === 'string') {
          // Process string props with template variables
          processedLoopProps[key] = processTemplateVars(value, renderContext);
        } else {
          processedLoopProps[key] = value;
        }
      }
      
      // Pass the current evaluation context to the Loop component
      processedLoopProps.context = renderContext;
      
      // Ensure the 'for' property is provided
      if (!processedLoopProps.for) {
        // Use console directly and suppress TypeScript error
        console.warn('Loop component missing required "for" property');
        return '';
      }
      
      // Render using the Loop component function
      const loopResult = await Loop({ 
        for: processedLoopProps.for,
        context: processedLoopProps.context,
        children: component.children 
      });
      return render(loopResult);
    }
    
    const result = await component.type({ ...component.props, children: component.children });
    if (typeof result === 'string') {
      return result;
    }
    return render(result);
  }

  // Handle built-in components
  switch (component.type) {
    // Text formatting components
    case 'italic':
    case 'i':
      return `*${(await Promise.all(component.children.map(render))).join('')}*`;
    
    case 'strikethrough':
    case 'strike':
    case 's':
      return `~~${(await Promise.all(component.children.map(render))).join('')}~~`;
    
    case 'underline':
    case 'u':
      return `<u>${(await Promise.all(component.children.map(render))).join('')}</u>`;
    
    case 'text':
      return (await Promise.all(component.children.map(render))).join('');
    
    // Structure components
    case 'paragraph':
    case 'p':
      return `${(await Promise.all(component.children.map(render))).join('')}\n`;
    
    case 'newline':
    case 'br':
      return '\n';
    
    case 'listitem':
    case 'item':
    case 'li':
      return `- ${(await Promise.all(component.children.map(render))).join('')}\n`;
    
    case 'subcontent':
    case 'section':
      const sectionContent = (await Promise.all(component.children.map(render))).join('');
      return `${sectionContent}\n`;
    
    case 'folder':
      const folderTitle = component.props?.name || component.props?.title || 'Folder';
      const folderContent = (await Promise.all(component.children.map(render))).join('');
      return `📁 ${folderTitle}\n${folderContent}`;
    
    // Conversation components
    case 'aimessage':
    case 'ai-msg':
      return `**AI**: ${(await Promise.all(component.children.map(render))).join('')}\n`;
    
    case 'humanmessage':
    case 'human-msg':
      return `**Human**: ${(await Promise.all(component.children.map(render))).join('')}\n`;
    
    case 'systemmessage':
    case 'system-msg':
      return `**System**: ${(await Promise.all(component.children.map(render))).join('')}\n`;
    
    case 'conversation':
      const conversationContent = (await Promise.all(component.children.map(render))).join('');
      return `--- Conversation ---\n${conversationContent}--- End Conversation ---\n`;
    
    case 'messagecontext':
    case 'msg-context':
      return `[Context: ${(await Promise.all(component.children.map(render))).join('')}]\n`;
    
    // Utility components
    case 'toolrequest':
    case 'tool-request':
      const toolRequestName = component.props?.tool || 'Unknown Tool';
      const requestContent = (await Promise.all(component.children.map(render))).join('');
      return `🔧 Tool Request (${toolRequestName}): ${requestContent}\n`;
    
    case 'toolresponse':
    case 'tool-response':
      const toolResponseName = component.props?.tool || 'Unknown Tool';
      const responseContent = (await Promise.all(component.children.map(render))).join('');
      return `✅ Tool Response (${toolResponseName}): ${responseContent}\n`;
    
    case 'webpage':
      const url = component.props?.url || '';
      const title = component.props?.title || url;
      const webContent = (await Promise.all(component.children.map(render))).join('');
      if (webContent) {
        return `🌐 [${title}](${url})\n${webContent}\n`;
      } else {
        return `🌐 [${title}](${url})\n`;
      }
    
    case 'image':
    case 'img':
      const imgSrc = component.props?.src || component.props?.url || '';
      const imgAlt = component.props?.alt || 'Image';
      const imgCaption = component.props?.caption;
      let imgResult = `![${imgAlt}](${imgSrc})`;
      if (imgCaption) {
        imgResult += `\n*${imgCaption}*`;
      }
      return `${imgResult}\n`;
    
    case 'audio':
      const audioSrc = component.props?.src || '';
      const audioControls = component.props?.controls ? ' controls' : '';
      const audioStyle = component.props?.style ? ` style="${component.props.style}"` : '';
      return `<audio src="${audioSrc}"${audioControls}${audioStyle}></audio>`;
    
    // Custom components
    case 'example':
      // For custom components, we need to import and call the component function
      // with the processed props
      const { Example } = await import('../components/Example');
      // Process component props with the current context
      const processedExampleProps: Record<string, any> = {};
      for (const [key, value] of Object.entries(component.props || {})) {
        if (typeof value === 'string') {
          // Process string props with template variables
          processedExampleProps[key] = processTemplateVars(value, renderContext);
        } else {
          processedExampleProps[key] = value;
        }
      }
      
      // Render using the Example component function
      const exampleResult = await Example({ ...processedExampleProps, children: component.children });
      return render(exampleResult);
    
    default:
      // Check if it's a registered custom component
      const customComponent = getComponent(component.type as string);
      if (customComponent) {
        // Process component props with the current context
        const processedProps: Record<string, any> = {};
        for (const [key, value] of Object.entries(component.props || {})) {
          if (typeof value === 'string') {
            // Process string props with template variables
            processedProps[key] = processTemplateVars(value, renderContext);
          } else {
            processedProps[key] = value;
          }
        }
        
        // Render using the custom component function
        const customResult = await customComponent({ ...processedProps, children: component.children });
        return render(customResult);
      }
      
      if (component.children) {
        return `${(await Promise.all(component.children.map(render))).join('')}`;
      }
      return '';
  }
}