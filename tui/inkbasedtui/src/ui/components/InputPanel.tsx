/**
 * Input panel component for interactive commands
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { WebSocketClient } from '../../services/WebSocketClient.js';

interface InputPanelProps {
  wsClient: WebSocketClient;
  active: boolean;
  onLog: (message: string) => void;
}

export function InputPanel({ wsClient, active, onLog }: InputPanelProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (value: string) => {
    if (!value.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setInput('');

    try {
      const trimmedValue = value.trim();
      
      // Parse command
      const [command, ...args] = trimmedValue.split(' ');
      
      switch (command.toLowerCase()) {
        case 'read':
        case 'r':
          if (args.length === 0) {
            onLog('Usage: read <filepath>');
            break;
          }
          const filepath = args.join(' ');
          onLog(`Reading file: ${filepath}`);
          try {
            const content = await wsClient.readFile(filepath);
            onLog(`File content (${content.length} chars): ${content.slice(0, 100)}${content.length > 100 ? '...' : ''}`);
          } catch (error) {
            onLog(`Error reading file: ${error}`);
          }
          break;

        case 'write':
        case 'w':
          if (args.length < 2) {
            onLog('Usage: write <filepath> <content>');
            break;
          }
          const [writeFilepath, ...contentParts] = args;
          const content = contentParts.join(' ');
          onLog(`Writing to file: ${writeFilepath}`);
          try {
            await wsClient.writeFile(writeFilepath, content);
            onLog(`File written successfully`);
          } catch (error) {
            onLog(`Error writing file: ${error}`);
          }
          break;

        case 'ask':
        case 'ai':
          if (args.length === 0) {
            onLog('Usage: ask <prompt>');
            break;
          }
          const prompt = args.join(' ');
          onLog(`Asking AI: ${prompt}`);
          try {
            const response = await wsClient.askAI(prompt);
            onLog(`AI response: ${response}`);
          } catch (error) {
            onLog(`Error asking AI: ${error}`);
          }
          break;

        case 'test':
          onLog('Sending test message to server');
          try {
            wsClient.send({
              type: 'test',
              message: 'Hello from CLI!',
              timestamp: Date.now(),
            });
            onLog('Test message sent');
          } catch (error) {
            onLog(`Error sending test message: ${error}`);
          }
          break;

        case 'help':
        case 'h':
          onLog('Available commands:');
          onLog('  read|r <filepath>     - Read a file');
          onLog('  write|w <filepath> <content> - Write to a file');
          onLog('  ask|ai <prompt>       - Ask AI a question');
          onLog('  test                  - Send test message');
          onLog('  help|h                - Show this help');
          onLog('  clear                 - Clear input');
          break;

        case 'clear':
          // This is handled in the TextInput onChange
          break;

        default:
          onLog(`Unknown command: ${command}. Type 'help' for available commands.`);
          break;
      }
    } catch (error) {
      onLog(`Command error: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom input handling for the input panel
  useInput((inputChar, key) => {
    if (!active) return;
    
    if (key.return && !isSubmitting) {
      handleSubmit(input);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header with clear status */}
      <Box marginBottom={1}>
        <Text color={active ? "blue" : "cyan"} bold>
          💬 Command Input {active ? "(✅ ACTIVE - Type your command)" : "(Press Tab to activate)"}
        </Text>
      </Box>
      
      {/* Large, prominent input area - Dynamic height based on content */}
      <Box 
        borderStyle="single" 
        borderColor={active ? "cyan" : "gray"} 
        padding={1}
        marginBottom={1}
        minHeight={4}  // Minimum height, but can expand
      >
        <Box flexDirection="column" width="100%">
          <Box>
            <Text color="cyan" bold>$ </Text>
            <TextInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              placeholder={isSubmitting ? 'Processing command...' : 'Type your command here (e.g., help, read package.json, ask "What is Node.js?")'}
              showCursor={!isSubmitting}
              focus={true}  // Always focus to ensure visibility
            />
          </Box>
          
          {/* Show current input value for enhanced visibility */}
          {input && (
            <Box marginTop={1}>
              <Text color="yellow">📝 Typing: </Text>
              <Text color="black" backgroundColor="yellow" bold> {input} </Text>
              <Text color="gray"> ({input.length} chars)</Text>
            </Box>
          )}
          
          {/* Show helpful hints when no input */}
          {!input && !isSubmitting && (
            <Box marginTop={1}>
              <Text color="gray">💡 Try: help | read package.json | ask "What is TypeScript?"</Text>
            </Box>
          )}
          
          {/* Status indicator */}
          {isSubmitting ? (
            <Box marginTop={1}>
              <Text color="yellow">⏳ Processing command...</Text>
            </Box>
          ) : (
            <Box marginTop={1}>
              <Text color="green">✓ Ready - Press Enter to execute</Text>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Help text */}
      <Text color="gray" italic>
        💡 Available commands: read, write, ask, test, help | Press Enter to execute
      </Text>
    </Box>
  );
}
