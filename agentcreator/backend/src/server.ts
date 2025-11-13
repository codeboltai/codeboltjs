import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import AgentManager from './agent-manager.js';

// Initialize Express app
const app = express();
const PORT = process?.env?.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for graphs (in a real app, use a database)
// This is currently unused but kept for future implementation
const _GRAPHS = new Map();

// Agent manager will be initialized per request

// API endpoint to execute a graph
app.get('/api/graph', async (req, res) => {
  try {
    const agentManager = new AgentManager();
    const savedData = await agentManager.loadGraph();

    res.json({
      success: true,
      graphData: savedData?.graphData ?? null,
      message: savedData?.message ?? ''
    });
  } catch (error) {
    console.error('Error loading graph:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const { graphData, message } = req.body;

    if (!graphData) {
      return res.status(400).json({ error: 'Graph data is required' });
    }

    const agentManager = new AgentManager();
    await agentManager.saveGraph(graphData, message);

    res.json({
      success: true,
      message: 'Graph data saved successfully'
    });
  } catch (error) {
    console.error('Error saving graph:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/execute', async (req, res) => {
  try {
    const { graphData, message } = req.body;

    if (!graphData) {
      return res.status(400).json({ error: 'Graph data is required' });
    }

    console.log('Backend: Starting new agent process for graph execution');

    // Create a new agent manager for this request
    const agentManager = new AgentManager();

    // Delegate execution to the agent process
    const result = await agentManager.executeGraph(graphData, message);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Error executing graph:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to get agent status
app.get('/api/agent/status', async (req, res) => {
  try {
    // Create a temporary agent manager to get status
    const agentManager = new AgentManager();
    const status = await agentManager.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to restart agent
app.post('/api/agent/restart', async (req, res) => {
  try {
    // In on-demand mode, there's no persistent agent to restart
    res.json({
      success: true,
      message: 'Agent runs in on-demand mode - no persistent agent to restart'
    });
  } catch (error) {
    console.error('Error restarting agent:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Agent runs in on-demand mode - starts and shuts down for each request');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down backend server...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down backend server...');
  process.exit(0);
});