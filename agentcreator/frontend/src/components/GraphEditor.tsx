// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { LGraph, LGraphCanvas, LiteGraph } from '@codebolt/litegraph';
import { registerNodes } from '../nodes';
import { ConstNode, SumNode } from '../nodes/registerNodes';
import '../../node_modules/@codebolt/litegraph/dist/css/litegraph.css';
import '../index.css';
// NodeCard component for the palette
const NodeCard = ({ nodeType, title, description, icon, color, onClick }) => (
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
// Properties Panel component
const PropertiesPanel = ({ selectedNode }) => {
  if (!selectedNode) {
    return (
      <div style={{
        width: '250px',
        backgroundColor: '#2a2a2a',
        borderLeft: '1px solid #444',
        padding: '15px',
        overflow: 'auto',
        position: 'absolute',
        right: '0',
        top: '0',
        height: '100%',
        zIndex: 1000,
        boxShadow: '-2px 0 10px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{
          color: '#fff',
          margin: '0 0 15px 0',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          Properties
        </h3>
        <div style={{ color: '#888', fontSize: '12px' }}>
          Select a node to view its properties
        </div>
      </div>
    );
  }
  const handlePropertyChange = (propertyName, value) => {
    if (selectedNode.setProperty) {
      selectedNode.setProperty(propertyName, value);
    } else {
      selectedNode.properties[propertyName] = value;
    }
    // Force canvas redraw
    if (selectedNode.graph && selectedNode.graph.list_of_graphcanvas) {
      selectedNode.graph.list_of_graphcanvas.forEach(canvas => {
        canvas.setDirty(true);
      });
    }
  };
  return (
    <div style={{
      width: '250px',
      backgroundColor: '#2a2a2a',
      borderLeft: '1px solid #444',
      padding: '15px',
      overflow: 'auto',
      position: 'absolute',
      right: '0',
      top: '0',
      height: '100%',
      zIndex: 1000,
      boxShadow: '-2px 0 10px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{
        color: '#fff',
        margin: '0 0 15px 0',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        {selectedNode.title || 'Node Properties'}
      </h3>
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          color: '#aaa',
          fontSize: '11px',
          marginBottom: '5px'
        }}>
          Type: {selectedNode.type}
        </div>
        <div style={{
          color: '#aaa',
          fontSize: '11px',
          marginBottom: '15px'
        }}>
          ID: {selectedNode.id}
        </div>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          color: '#fff',
          margin: '0 0 10px 0',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Properties
        </h4>
        {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 ? (
          Object.entries(selectedNode.properties).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '15px' }}>
              <label style={{
                color: '#aaa',
                fontSize: '11px',
                display: 'block',
                marginBottom: '5px'
              }}>
                {key}
              </label>
              {typeof value === 'boolean' ? (
                <select
                  value={value.toString()}
                  onChange={(e) => handlePropertyChange(key, e.target.value === 'true')}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : typeof value === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handlePropertyChange(key, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: '#333',
                    border: '1px solid #555',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div style={{ color: '#888', fontSize: '12px' }}>
            No properties available
          </div>
        )}
      </div>
      {selectedNode.widgets && selectedNode.widgets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            color: '#fff',
            margin: '0 0 10px 0',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Widgets
          </h4>
          <div style={{ color: '#888', fontSize: '12px' }}>
            {selectedNode.widgets.length} widget(s) available
          </div>
        </div>
      )}
      {/* Inputs */}
      {selectedNode.inputs && selectedNode.inputs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            color: '#fff',
            margin: '0 0 10px 0',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Inputs
          </h4>
          {selectedNode.inputs.map((input, index) => (
            <div key={`input_${index}`} style={{
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              border: '1px solid #444'
            }}>
              <div style={{
                color: '#fff',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                {input.name || `Input ${index}`}
                <span style={{
                  color: '#888',
                  fontSize: '10px',
                  marginLeft: '6px',
                  backgroundColor: '#444',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  {input.type || 'unknown'}
                </span>
              </div>
              {input.extra_info && (
                <div style={{ fontSize: '10px', color: '#aaa', lineHeight: '1.4' }}>
                  {input.extra_info.dataType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Data Type:</strong> {input.extra_info.dataType}
                    </div>
                  )}
                  {input.extra_info.arrayType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Array Type:</strong> {input.extra_info.arrayType}
                    </div>
                  )}
                  {input.extra_info.elementType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Element Type:</strong> {input.extra_info.elementType}
                    </div>
                  )}
                  {input.extra_info.acceptedTypes && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Accepts:</strong> {input.extra_info.acceptedTypes.join(', ')}
                    </div>
                  )}
                  {input.extra_info.description && (
                    <div style={{ marginBottom: '2px', fontStyle: 'italic' }}>
                      {input.extra_info.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Outputs */}
      {selectedNode.outputs && selectedNode.outputs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            color: '#fff',
            margin: '0 0 10px 0',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Outputs
          </h4>
          {selectedNode.outputs.map((output, index) => (
            <div key={`output_${index}`} style={{
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              border: '1px solid #444'
            }}>
              <div style={{
                color: '#fff',
                fontSize: '12px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                {output.name || `Output ${index}`}
                <span style={{
                  color: '#888',
                  fontSize: '10px',
                  marginLeft: '6px',
                  backgroundColor: '#444',
                  padding: '2px 4px',
                  borderRadius: '2px'
                }}>
                  {output.type || 'unknown'}
                </span>
              </div>
              {output.extra_info && (
                <div style={{ fontSize: '10px', color: '#aaa', lineHeight: '1.4' }}>
                  {output.extra_info.dataType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Data Type:</strong> {output.extra_info.dataType}
                    </div>
                  )}
                  {output.extra_info.arrayType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Array Type:</strong> {output.extra_info.arrayType}
                    </div>
                  )}
                  {output.extra_info.elementType && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Element Type:</strong> {output.extra_info.elementType}
                    </div>
                  )}
                  {output.extra_info.acceptedTypes && (
                    <div style={{ marginBottom: '2px' }}>
                      <strong>Accepts:</strong> {output.extra_info.acceptedTypes.join(', ')}
                    </div>
                  )}
                  {output.extra_info.description && (
                    <div style={{ marginBottom: '2px', fontStyle: 'italic' }}>
                      {output.extra_info.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default function GraphEditor() {
  const graphRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [userMessage, setUserMessage] = useState('');
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    let isMounted = true;
    // Initialize nodes and setup graph
    const initializeGraph = async () => {
      try {
        // Register all node types
        await registerNodes();
      } catch (error) {
        console.error('Failed to register nodes:', error);
      }
      // Enable release link on empty space shows menu
      LiteGraph.release_link_on_empty_shows_menu = true;
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      canvasContainerRef.current.appendChild(canvas);
      // Initialize the graph
      const graph = new LGraph();
      // Create the graph canvas
      const graphCanvas = new LGraphCanvas(canvas, graph);
      // Store references
      graphRef.current = graph;
      canvasRef.current = graphCanvas;
      // Configure canvas
      graphCanvas.background_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AkEEjIXHvZq6QAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAJUlEQVQ4y2NgGAWjYBSMglEwCkbBKBgFgwUwQjUfZ4BpBgB7CgUeY1JHKQAAAABJRU5ErkJggg==";
      // Handle node selection
      graphCanvas.onNodeSelected = (node) => {
        setSelectedNode(node);
      };
      graphCanvas.onNodeDeselected = () => {
        setSelectedNode(null);
      };
      // Custom connection validation using extra_info
      graphCanvas.validateConnection = function (input_type, output_type, input_slot, output_slot, input_node, output_node) {
        // Get the extra_info from input and output slots
        const inputInfo = input_node.getInputInfo(input_slot);
        const outputInfo = output_node.getOutputInfo(output_slot);
        // If no extra_info, fall back to default LiteGraph validation
        if (!inputInfo || !inputInfo.extra_info || !outputInfo || !outputInfo.extra_info) {
          // Default validation: check basic type compatibility
          if (input_type === output_type) return true;
          if (input_type === "array" || input_type === "object") return true; // Arrays and objects accept any compatible type
          return false;
        }
        const inputExtraInfo = inputInfo.extra_info;
        const outputExtraInfo = outputInfo.extra_info;
        // Specific type matching
        if (inputExtraInfo.dataType && outputExtraInfo.dataType) {
          // Exact match
          if (inputExtraInfo.dataType === outputExtraInfo.dataType) {
            return true;
          }
          // Special cases: allow generic types for flexible nodes
          if (inputExtraInfo.acceptedTypes && inputExtraInfo.acceptedTypes.includes(outputExtraInfo.dataType)) {
            return true;
          }
          // Array type validation with element type checking
          if (input_type === "array" && output_type === "array") {
            // If input accepts any array
            if (inputExtraInfo.dataType === "array" && !inputExtraInfo.arrayType) {
              return true;
            }
            // If both have specific array types, they must match
            if (inputExtraInfo.arrayType && outputExtraInfo.arrayType) {
              return inputExtraInfo.arrayType === outputExtraInfo.arrayType;
            }
            // If only input specifies array type, output must match
            if (inputExtraInfo.arrayType) {
              return outputExtraInfo.arrayType === inputExtraInfo.arrayType;
            }
          }
          // Object type validation with specific object types
          if (input_type === "object" && output_type === "object") {
            // If input accepts any object
            if (inputExtraInfo.dataType === "object" && !inputExtraInfo.objectType) {
              return true;
            }
            // Specific object type matching
            if (inputExtraInfo.dataType === outputExtraInfo.dataType) {
              return true;
            }
          }
          // String type validation with subtypes
          if (input_type === "string" && output_type === "string") {
            // Generic string accepts any string subtype
            if (inputExtraInfo.dataType === "string" && !inputExtraInfo.stringSubtype) {
              return true;
            }
            // Specific string subtype matching
            if (inputExtraInfo.dataType === outputExtraInfo.dataType) {
              return true;
            }
          }
        }
        // Fallback to basic type compatibility
        return input_type === output_type ||
          (input_type === "array" && output_type === "array") ||
          (input_type === "object" && output_type === "object") ||
          (input_type === "string" && output_type === "string");
      };
      // Override the getCanvasMenuOptions method to add custom context menu items
      const originalGetCanvasMenuOptions = graphCanvas.getCanvasMenuOptions;
      graphCanvas.getCanvasMenuOptions = function () {
        const options = originalGetCanvasMenuOptions ? originalGetCanvasMenuOptions.apply(this) : [];
        // Add our custom menu items
        options.push(
          null, // separator
          {
            content: "Add Constant Node",
            callback: () => {
              const newNode = new ConstNode();
              newNode.pos = [100, 100];
              graph.add(newNode);
            }
          },
          {
            content: "Add Sum Node",
            callback: () => {
              const newNode = new SumNode();
              newNode.pos = [100, 200];
              graph.add(newNode);
            }
          }
        );
        return options;
      };
      const loadSavedGraph = async () => {
        try {
          const response = await fetch('http://localhost:3002/api/graph');
          if (!response.ok) {
            throw new Error('Failed to fetch saved graph');
          }
          const result = await response.json();
          if (result.success && result.graphData) {
            graph.clear();
            graph.configure(result.graphData);
          }
          if (isMounted && result.success) {
            setUserMessage(result.message || '');
          }
        } catch (error) {
          console.error('Error loading saved graph:', error);
        } finally {
          if (isMounted) {
            graph.start();
            // Initial canvas sizing to ensure proper dimensions
            setTimeout(() => {
              if (graphCanvas && canvasContainerRef.current) {
                const container = canvasContainerRef.current;
                const canvas = graphCanvas.canvas;
                const rect = container.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                // Reset zoom to 1.0 and center
                graphCanvas.ds.scale = 1.0;
                graphCanvas.ds.offset = [0, 0];
                graphCanvas.setDirty(true, true);
              }
            }, 100);
          }
        }
      };
      await loadSavedGraph();
    };

    // Call the async initialization function
    initializeGraph();
    // Handle window resize
    const onResize = () => {
      if (canvasRef.current && canvasContainerRef.current) {
        const container = canvasContainerRef.current;
        const canvas = canvasRef.current.canvas;
        // Ensure container has proper dimensions
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Set canvas style dimensions to match
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvasRef.current.setDirty(true, true);
      }
    };
    window.addEventListener('resize', onResize);
    onResize();
    // Store the current container ref in a variable for cleanup
    const container = canvasContainerRef.current;
    // Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener('resize', onResize);
      if (graphRef.current) {
        graphRef.current.stop();
      }
      if (canvasRef.current) {
        canvasRef.current.clear();
      }
      if (container && canvasRef.current?.canvas && container.contains(canvasRef.current.canvas)) {
        container.removeChild(canvasRef.current.canvas);
      }
    };
  }, []);
  const executeGraph = async () => {
    if (!graphRef.current) return;
    try {
      setIsExecuting(true);
      setExecutionResult(null);
      // Serialize the graph
      const graphData = graphRef.current.serialize();
      console.log(graphData); // Send to backend for execution
      const response = await fetch('http://localhost:3002/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ graphData, message: userMessage }),
      });
      const result = await response.json();
      setExecutionResult(result);
      if (result.success) {
        console.log('Graph executed successfully:', result.outputs);
      } else {
        console.error('Error executing graph:', result.error);
      }
    } catch (error) {
      console.error('Error executing graph:', error);
      setExecutionResult({
        success: false,
        error: error.message || 'Failed to execute graph'
      });
    } finally {
      setIsExecuting(false);
    }
  };
  const saveGraph = async () => {
    if (!graphRef.current) return;
    try {
      setIsSaving(true);
      const graphData = graphRef.current.serialize();
      const response = await fetch('http://localhost:3002/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ graphData, message: userMessage }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save graph');
      }
      setExecutionResult(result);
    } catch (error) {
      console.error('Error saving graph:', error);
      setExecutionResult({
        success: false,
        error: error.message || 'Failed to save graph'
      });
    } finally {
      setIsSaving(false);
    }
  };
  const addNodeFromPalette = (nodeType) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const graph = graphRef.current;
    if (!graph) return;
    // Create new node at center of canvas
    const canvasRect = canvas.canvas.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;
    const newNode = LiteGraph.createNode(nodeType);
    if (newNode) {
      newNode.pos = [centerX, centerY];
      graph.add(newNode);
    }
  };
  const refreshCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const canvasElement = canvas.canvas;
    // Force canvas to resize and redraw using container dimensions
    const rect = container.getBoundingClientRect();
    canvasElement.width = rect.width;
    canvasElement.height = rect.height;
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvas.setDirty(true, true);
    // Also trigger a resize on the graph canvas
    setTimeout(() => {
      if (canvas.onResize) {
        canvas.onResize();
      }
    }, 50);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        padding: '10px',
        backgroundColor: '#333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => {
                setIsPaletteVisible(!isPaletteVisible);
                // Refresh canvas after a short delay to allow for layout changes
                setTimeout(refreshCanvas, 100);
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: isPaletteVisible ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title={isPaletteVisible ? 'Cancel adding nodes' : 'Add nodes to graph'}
            >
              {isPaletteVisible ? '✕' : '+'}
              {isPaletteVisible ? 'Cancel' : 'Add'}
            </button>
            <h2 style={{ color: 'white', margin: 0 }}>Graph Editor</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Enter user message for AI agents..."
              style={{
                padding: '6px 12px',
                backgroundColor: '#444',
                border: '1px solid #666',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                width: '300px'
              }}
            />
            <button
              onClick={saveGraph}
              disabled={isSaving || isExecuting}
              style={{
                padding: '8px 16px',
                backgroundColor: isSaving ? '#666' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving || isExecuting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={executeGraph}
              disabled={isExecuting}
              style={{
                padding: '8px 16px',
                backgroundColor: isExecuting ? '#666' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isExecuting ? 'not-allowed' : 'pointer'
              }}
            >
              {isExecuting ? 'Executing...' : 'Execute Graph'}
            </button>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Canvas Container */}
        <div style={{
          flex: 1,
          backgroundColor: '#1a1a1a',
          position: 'relative',
          height: '100%',
          width: '100%',
          minHeight: 0,
          minWidth: 0
        }}>
          <div
            ref={canvasContainerRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              overflow: 'hidden',
              backgroundColor: '#222',
              minHeight: 0,
              minWidth: 0
            }}
          />
        </div>
        {/* Node Palette Overlay */}
        {isPaletteVisible && (
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '250px',
            height: '100%',
            backgroundColor: '#2a2a2a',
            borderRight: '1px solid #444',
            padding: '15px',
            overflow: 'auto',
            zIndex: 1000,
            boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
            transition: 'transform 0.3s ease'
          }}>
            <h3 style={{
              color: '#fff',
              margin: '0 0 15px 0',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Node Palette
            </h3>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Event Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="events/onmessage"
                  title="OnMessage"
                  description="Entry point that waits for incoming messages - toggle between single/split outputs"
                  icon="📨"
                  color="#FF5722"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Codebolt Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="codebolt/chat/sendmessage"
                  title="Send Message"
                  description="Sends a message using codebolt.chat.sendMessage"
                  icon="💬"
                  color="#2196F3"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Basic Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="basic/const"
                  title="Constant Node"
                  description="Outputs a constant value"
                  icon="C"
                  color="#4CAF50"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/sum"
                  title="Sum Node"
                  description="Adds two numbers together"
                  icon="Σ"
                  color="#2196F3"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Base Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="basic/time"
                  title="Time"
                  description="Current time in ms and seconds"
                  icon="⏰"
                  color="#FFC107"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/const_number"
                  title="Const Number"
                  description="Constant number with widget"
                  icon="#"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/const_boolean"
                  title="Const Boolean"
                  description="Constant boolean with toggle"
                  icon="☑"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/const_string"
                  title="Const String"
                  description="Constant string with text input"
                  icon="S"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/const_object"
                  title="Const Object"
                  description="Constant object"
                  icon="{}"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="basic/jsonparse"
                  title="JSON Parse"
                  description="Parse JSON string to object"
                  icon="JSON"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="graph/subgraph"
                  title="Subgraph"
                  description="Graph inside a node"
                  icon="⊡"
                  color="#795548"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="graph/input"
                  title="Graph Input"
                  description="Input of the graph"
                  icon="→"
                  color="#795548"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="graph/output"
                  title="Graph Output"
                  description="Output of the graph"
                  icon="←"
                  color="#795548"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Math Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="math/converter"
                  title="Converter"
                  description="Type A to type B"
                  icon="⇄"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/bypass"
                  title="Bypass"
                  description="Removes the type"
                  icon="→"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/to_number"
                  title="To Number"
                  description="Cast to number"
                  icon="#"
                  color="#607D8B"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/range"
                  title="Range"
                  description="Convert number range"
                  icon="↔"
                  color="#795548"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/rand"
                  title="Random"
                  description="Random number"
                  icon="?"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/clamp"
                  title="Clamp"
                  description="Clamp number between min and max"
                  icon="⬓"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/lerp"
                  title="Lerp"
                  description="Linear interpolation"
                  icon="↔"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/abs"
                  title="Abs"
                  description="Absolute value"
                  icon="|x|"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/floor"
                  title="Floor"
                  description="Floor number"
                  icon="⌊"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/frac"
                  title="Frac"
                  description="Fractional part"
                  icon=".x"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/smoothstep"
                  title="Smoothstep"
                  description="Smooth interpolation"
                  icon="∿"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/scale"
                  title="Scale"
                  description="Multiply by factor"
                  icon="×"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/gate"
                  title="Gate"
                  description="Conditional output"
                  icon="⚿"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="math/operation"
                  title="Operation"
                  description="Math operations"
                  icon="⊕"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Logic Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="logic/selector"
                  title="Selector"
                  description="Selects an output"
                  icon="⊞"
                  color="#00BCD4"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="logic/sequence"
                  title="Sequence"
                  description="Select from sequence"
                  icon="..."
                  color="#CDDC39"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="logic/AND"
                  title="AND"
                  description="Logical AND"
                  icon="∧"
                  color="#FF5722"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="logic/OR"
                  title="OR"
                  description="Logical OR"
                  icon="∨"
                  color="#FF5722"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="logic/NOT"
                  title="NOT"
                  description="Logical NOT"
                  icon="¬"
                  color="#FF5722"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="logic/IF"
                  title="Branch"
                  description="Branch execution on condition"
                  icon="⇄"
                  color="#FF5722"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                String Nodes
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="string/toString"
                  title="to String"
                  description="Convert to string"
                  icon="S"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/compare"
                  title="Compare"
                  description="Compare two strings"
                  icon="=="
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/concatenate"
                  title="Concatenate"
                  description="Join two strings"
                  icon="+"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/contains"
                  title="Contains"
                  description="Check if contains substring"
                  icon="∈"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/toUpperCase"
                  title="to UpperCase"
                  description="Convert to uppercase"
                  icon="↑"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/split"
                  title="Split"
                  description="Split string by separator"
                  icon="⊓"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/toFixed"
                  title="to Fixed"
                  description="Format number with decimals"
                  icon=".0"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="string/toTable"
                  title="to Table"
                  description="Convert string to table"
                  icon="⊞"
                  color="#9E9E9E"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Interface Widgets
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="widget/knob"
                  title="Knob"
                  description="Rotational knob controller"
                  icon="◉"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="widget/hslider"
                  title="H.Slider"
                  description="Linear slider controller"
                  icon="━"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="widget/progress"
                  title="Progress"
                  description="Shows data in linear progress"
                  icon="▓"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="widget/text"
                  title="Text"
                  description="Shows the input value"
                  icon="T"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="widget/panel"
                  title="Panel"
                  description="Non interactive panel"
                  icon="▢"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                AI Agents
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <NodeCard
                  nodeType="agent/user_message"
                  title="User Message"
                  description="Creates a UserMessage object from request message"
                  icon="💬"
                  color="#2196F3"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="agent/system_prompt"
                  title="System Prompt"
                  description="Creates a SystemPrompt from markdown content"
                  icon="📋"
                  color="#4CAF50"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="agent/mcp_tools"
                  title="MCP Tools"
                  description="Fetches available tools from MCP servers"
                  icon="🔧"
                  color="#9C27B0"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="agent/task_instruction"
                  title="Task Instruction"
                  description="Creates a TaskInstruction with tools and user message"
                  icon="📝"
                  color="#FF9800"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="agent/agent"
                  title="Agent"
                  description="Creates an Agent with tools and system prompt"
                  icon="🤖"
                  color="#E91E63"
                  onClick={addNodeFromPalette}
                />
                <NodeCard
                  nodeType="agent/agent_run"
                  title="Agent Run"
                  description="Executes an agent with a task instruction"
                  icon="▶️"
                  color="#4CAF50"
                  onClick={addNodeFromPalette}
                />
              </div>
            </div>
            <div>
              <h4 style={{
                color: '#aaa',
                margin: '0 0 10px 0',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Instructions
              </h4>
              <ul style={{
                color: '#888',
                fontSize: '11px',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: '1.5'
              }}>
                <li>Click on a node to add it to the canvas</li>
                <li>Right-click on canvas for more options</li>
                <li>Drag nodes to reposition them</li>
                <li>Connect nodes by dragging from output to input</li>
                <li>Event Flow: OnMessage → UserMessage → TaskInstruction → Agent → AgentRun</li>
              </ul>
            </div>
          </div>
        )}
        {/* Properties Panel */}
        <PropertiesPanel selectedNode={selectedNode} />
        {executionResult && (
          <div style={{
            padding: '10px',
            backgroundColor: executionResult.success ? '#e8f5e9' : '#ffebee',
            borderTop: '1px solid #ddd',
            maxHeight: '150px',
            overflow: 'auto',
            flexShrink: 0
          }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{executionResult.success ? 'Execution Results' : 'Error'}</h3>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(executionResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
