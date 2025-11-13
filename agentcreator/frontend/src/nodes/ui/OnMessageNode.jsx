import React from 'react';
import { BaseOnMessageNode } from '@agent-creator/shared-nodes';

// Frontend OnMessage Node - UI only
export class OnMessageNode extends BaseOnMessageNode {
  constructor() {
    super();

    // Add display widget to show current message
    // this.addWidget("text", "Current Message", this.properties.message, "message");
  }

  // Frontend UI rendering
  onDrawForeground(ctx) {
    // Draw node title and message preview
    // ctx.fillStyle = "#FF5722"; // Orange color for event nodes
    // ctx.font = "12px Arial";
    // ctx.fillText("📨 OnMessage", 10, 15);

    // Draw message preview
    // ctx.fillStyle = "#aaa";
    // ctx.font = "10px Arial";
    // const message = this.properties.message || "Waiting for message...";
    // const preview = message.length > 20 ? message.substring(0, 20) + "..." : message;
    // ctx.fillText(preview, 10, 30);

    // Draw trigger indicator
    // if (this.properties.message) {
    //   ctx.fillStyle = "#4CAF50";
    //   ctx.fillText("● Triggered", 10, 45);
    // } else {
    //   ctx.fillStyle = "#999";
    //   ctx.fillText("○ Waiting", 10, 45);
    // }
  }

  // Frontend should not execute - handled by backend
  onExecute() {
    // Empty - frontend doesn't execute
    // console.log(`OnMessageNode ${this.id} - UI only, execution handled by backend`);
  }

  // Update message when widget value changes
  onPropertyChanged(name, value) {
    super.onPropertyChanged(name, value);
    // if (name === "message") {
    //   this.properties.message = value;
    //   this.trigger("message");
    // }
  }
}

// React component for the OnMessage node palette card
export default function OnMessageNodeComponent({ nodeType, title, description, icon, color, onClick }) {
  return (
    <div
      onClick={() => onClick(nodeType)}
      style={{
        padding: '12px',
        backgroundColor: '#333',
        border: '1px solid #555',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#444';
        e.target.style.borderColor = '#666';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#333';
        e.target.style.borderColor = '#555';
      }}
    >
      <div style={{
        width: '30px',
        height: '30px',
        backgroundColor: color,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
          {title}
        </div>
        <div style={{ color: '#888', fontSize: '11px' }}>
          {description}
        </div>
      </div>
    </div>
  );
}