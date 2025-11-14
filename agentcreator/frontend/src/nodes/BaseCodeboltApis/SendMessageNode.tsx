import { BaseSendMessageNode } from '@agent-creator/shared-nodes';

// Frontend SendMessage Node - UI only
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();

    // // Add input widget for message
    // this.addWidget("text", "Message", this.properties.message, "message", {
    //   multiline: true,
    //   placeholder: "Enter message to send..."
    // });

    // // Add display widget for response
    // this.addWidget("text", "Response", "", "response_display", {
    //   multiline: true,
    //   readonly: true,
    //   placeholder: "Response will appear here..."
    // });
  }

  // Frontend UI rendering
  onDrawForeground(ctx) {
    // Draw node title
    // ctx.fillStyle = "#2196F3"; // Blue color for codebolt nodes
    // ctx.font = "12px Arial";
    // ctx.fillText("💬 Send Message", 10, 15);

    // // Draw status
    // ctx.fillStyle = "#aaa";
    // ctx.font = "10px Arial";
    // const status = this.properties.response ? "✓ Sent" : "○ Ready";
    // ctx.fillText(status, 10, 30);

    // // Draw message preview
    // const message = this.properties.message || "No message";
    // const preview = message.length > 25 ? message.substring(0, 25) + "..." : message;
    // ctx.fillText(preview, 10, 45);
  }

  // Frontend should not execute - handled by backend
  onExecute() {
    // Empty - frontend doesn't execute
    // console.log(`SendMessageNode ${this.id} - UI only, execution handled by backend`);
  }

  // Handle property changes with UI updates
  onPropertyChanged(name, value) {
    super.onPropertyChanged(name, value);

    // if (name === 'message') {
    //   // Update widget if exists
    //   const messageWidget = this.widgets?.find(w => w.name === 'message');
    //   if (messageWidget) {
    //     messageWidget.value = value;
    //   }
    // }

    // if (name === 'response') {
    //   // Update response display widget
    //   const responseWidget = this.widgets?.find(w => w.name === 'response_display');
    //   if (responseWidget) {
    //     responseWidget.value = value || '';
    //   }
    // }
  }
}

// React component for the SendMessage node palette card
export default function SendMessageNodeComponent({ nodeType, title, description, icon, color, onClick }) {
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