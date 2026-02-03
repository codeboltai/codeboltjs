'use client';

import React from 'react';
import CyberButton from '../ui/CyberButton';
import { ROLE_COLORS } from '@/lib/context-types';
import { Settings, User, Bot, Plus } from 'lucide-react';

interface ContextToolbarProps {
  onAddSystemMessage: () => void;
  onAddUserMessage: () => void;
  onAddAssistantMessage: () => void;
}

const ContextToolbar: React.FC<ContextToolbarProps> = ({
  onAddSystemMessage,
  onAddUserMessage,
  onAddAssistantMessage,
}) => {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 border-t bg-cyber-bg-tertiary/20"
      style={{ borderColor: '#30363d' }}
    >
      <span className="text-xs font-mono" style={{ color: '#8b949e' }}>
        Add:
      </span>

      <button
        onClick={onAddSystemMessage}
        className="flex items-center gap-1.5 px-2 py-1 border text-xs font-mono transition-colors hover:opacity-80"
        style={{
          borderColor: `${ROLE_COLORS.system}40`,
          color: ROLE_COLORS.system,
          backgroundColor: `${ROLE_COLORS.system}10`,
        }}
      >
        <Settings className="w-3 h-3" />
        System
      </button>

      <button
        onClick={onAddUserMessage}
        className="flex items-center gap-1.5 px-2 py-1 border text-xs font-mono transition-colors hover:opacity-80"
        style={{
          borderColor: `${ROLE_COLORS.user}40`,
          color: ROLE_COLORS.user,
          backgroundColor: `${ROLE_COLORS.user}10`,
        }}
      >
        <User className="w-3 h-3" />
        User
      </button>

      <button
        onClick={onAddAssistantMessage}
        className="flex items-center gap-1.5 px-2 py-1 border text-xs font-mono transition-colors hover:opacity-80"
        style={{
          borderColor: `${ROLE_COLORS.assistant}40`,
          color: ROLE_COLORS.assistant,
          backgroundColor: `${ROLE_COLORS.assistant}10`,
        }}
      >
        <Bot className="w-3 h-3" />
        Assistant
      </button>
    </div>
  );
};

export default ContextToolbar;
