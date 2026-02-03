'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContextBlock as ContextBlockType, LLMToolCall } from '@/lib/context-types';
import ContextBlock from './ContextBlock';

interface SortableBlockProps {
  block: ContextBlockType;
  onToggle: () => void;
  onRemove: () => void;
  onEdit: (content: string | object) => void;
  onExecute?: () => void;
  onSimulate?: () => void;
}

const SortableBlock: React.FC<SortableBlockProps> = ({
  block,
  onToggle,
  onRemove,
  onEdit,
  onExecute,
  onSimulate,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ContextBlock
        block={block}
        onToggle={onToggle}
        onRemove={onRemove}
        onEdit={onEdit}
        onExecute={onExecute}
        onSimulate={onSimulate}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
};

interface ContextBlockListProps {
  blocks: ContextBlockType[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, content: string | object) => void;
  onExecuteToolCall?: (block: ContextBlockType) => void;
  onSimulateToolCall?: (block: ContextBlockType) => void;
}

const ContextBlockList: React.FC<ContextBlockListProps> = ({
  blocks,
  onReorder,
  onToggle,
  onRemove,
  onEdit,
  onExecuteToolCall,
  onSimulateToolCall,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div
          className="w-16 h-16 mb-4 border-2 border-dashed rounded-lg flex items-center justify-center"
          style={{ borderColor: '#484f58' }}
        >
          <span className="text-2xl">📝</span>
        </div>
        <p className="text-sm font-mono" style={{ color: '#8b949e' }}>
          No context blocks yet
        </p>
        <p className="text-xs font-mono mt-1" style={{ color: '#484f58' }}>
          Execute tools and add results to context, or add messages manually
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {blocks.map(block => {
            const isToolCall = block.role === 'tool_call';
            const toolContent = isToolCall && typeof block.content === 'object'
              ? block.content as LLMToolCall
              : null;
            const isUnexecuted = toolContent && !toolContent.executed;

            return (
              <SortableBlock
                key={block.id}
                block={block}
                onToggle={() => onToggle(block.id)}
                onRemove={() => onRemove(block.id)}
                onEdit={(content) => onEdit(block.id, content)}
                onExecute={isUnexecuted ? () => onExecuteToolCall?.(block) : undefined}
                onSimulate={isUnexecuted ? () => onSimulateToolCall?.(block) : undefined}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default ContextBlockList;
