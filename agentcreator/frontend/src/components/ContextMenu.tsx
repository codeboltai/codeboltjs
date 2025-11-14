// @ts-nocheck
import { useEffect, useRef, useState, useLayoutEffect } from 'react';

export default function ContextMenu({ x, y, onClose, items = [] }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Calculate position to ensure it stays within viewport
  useLayoutEffect(() => {
    if (x === null || y === null || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate adjusted position
    let adjustedX = x;
    let adjustedY = y;
    
    // Adjust if menu would go off the right edge
    if (x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 5;
    }
    
    // Adjust if menu would go off the bottom edge
    if (y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 5;
    }
    
    // Ensure we don't go off the left or top
    adjustedX = Math.max(5, adjustedX);
    adjustedY = Math.max(5, adjustedY);
    
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Prevent scrolling when context menu is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    onClose();
  };

  if (x === null || y === null) return null;

  const style = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
    zIndex: 10000, // Ensure it's above other elements
    minWidth: '180px',
    padding: '6px 0',
    color: '#eee',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    pointerEvents: 'auto',
  };

  const itemStyle = {
    padding: '6px 12px',
    cursor: 'pointer',
  };

  const hoverStyle = {
    backgroundColor: '#3d3d3d',
  };

  return (
    <div ref={menuRef} style={style} onClick={(e) => e.stopPropagation()}>
      {items.map((item, index) => (
        <div
          key={index}
          style={{
            ...itemStyle,
            ...(item.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => !item.disabled && handleItemClick(item)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
