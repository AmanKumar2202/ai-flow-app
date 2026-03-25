import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { InputNode, ResultNode } from './FlowNodes';

// Tell React Flow which components to use for our custom node types
const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

// How far apart each new pair of nodes appears vertically on the canvas
const VERTICAL_GAP = 280;

function createNodePair(id, position) {
  const inputId = `input-${id}`;
  const resultId = `result-${id}`;

  const inputNode = {
    id: inputId,
    type: 'inputNode',
    position,
    data: {
      value: '',
      onChange: () => {},
      onRun: () => {},
      onSave: () => {},
      pairId: id,
    },
  };

  const resultNode = {
    id: resultId,
    type: 'resultNode',
    position: { x: position.x + 460, y: position.y },
    data: { value: '', loading: false },
  };

  const edge = {
    id: `edge-${inputId}-${resultId}`,
    source: inputId,
    target: resultId,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#c8ff00', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#c8ff00' },
  };

  return { inputNode, resultNode, edge };
}

export default function App() {
  // Tracks how many pairs have been created so we always get a unique ID
  const totalPairs = useRef(1);

  // Controls whether dark or light theme is active (dark by default)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Stores the typed prompt for each pair, keyed by pair ID
  const [prompts, setPrompts] = useState({ 1: '' });

  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Start with one pair already on the canvas
  const { inputNode, resultNode, edge } = createNodePair(1, { x: 60, y: 60 });
  const [nodes, setNodes, onNodesChange] = useNodesState([inputNode, resultNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([edge]);

  // Show a small notification at the bottom of the screen
  const showToast = (message, type = 'success') => {
    setToast({ msg: message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Add a brand new prompt/response pair below the existing ones
  const addNewPair = useCallback(() => {
    totalPairs.current += 1;
    const newId = totalPairs.current;
    const yPosition = (newId - 1) * VERTICAL_GAP;

    const { inputNode, resultNode, edge } = createNodePair(newId, { x: 60, y: yPosition });

    setPrompts(prev => ({ ...prev, [newId]: '' }));
    setNodes(existing => [...existing, inputNode, resultNode]);
    setEdges(existing => [...existing, edge]);
  }, [setNodes, setEdges]);

  // Send the prompt to our backend and show the AI response in the result node
  const runPair = useCallback(async (pairId) => {
    const userPrompt = prompts[pairId] || '';

    if (!userPrompt.trim()) {
      return showToast('Please enter a prompt first!', 'error');
    }

    // Show loading spinner while waiting for the response
    setNodes(all =>
      all.map(node =>
        node.id === `result-${pairId}`
          ? { ...node, data: { value: '', loading: true } }
          : node
      )
    );

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      //AI's answer
      setNodes(all =>
        all.map(node =>
          node.id === `result-${pairId}`
            ? { ...node, data: { value: data.answer, loading: false } }
            : node
        )
      );
    } catch (err) {
      showToast(err.message || 'Something went wrong', 'error');
      setNodes(all =>
        all.map(node =>
          node.id === `result-${pairId}`
            ? { ...node, data: { value: '', loading: false } }
            : node
        )
      );
    }
  }, [prompts, setNodes]);

  // Save a prompt and its response to MongoDB
  const savePair = useCallback(async (pairId) => {
    const userPrompt = prompts[pairId] || '';
    const resultNode = nodes.find(n => n.id === `result-${pairId}`);
    const aiResponse = resultNode?.data?.value || '';

    if (!userPrompt || !aiResponse) {
      return showToast('Run the flow first before saving!', 'error');
    }

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, response: aiResponse }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      showToast('Saved to MongoDB! ✓');
    } catch (err) {
      showToast(err.message || 'Save failed', 'error');
    }
  }, [prompts, nodes]);

  //Load saved flows
  const loadHistory = async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch {
      showToast('Failed to load history', 'error');
    }
  };


  const nodesWithCallbacks = nodes.map(node => {
    const match = node.id.match(/^input-(\d+)$/);
    if (!match) return node; // result nodes don't need callbacks

    const pairId = parseInt(match[1]);

    return {
      ...node,
      data: {
        ...node.data,
        value: prompts[pairId] ?? '',
        onChange: (newValue) => {
          setPrompts(prev => ({ ...prev, [pairId]: newValue }));
          setNodes(all =>
            all.map(n =>
              n.id === `input-${pairId}`
                ? { ...n, data: { ...n.data, value: newValue } }
                : n
            )
          );
        },
        onRun: () => runPair(pairId),
        onSave: () => savePair(pairId),
        pairId,
      },
    };
  });

  return (
    <div className={`app-wrapper ${isDarkMode ? '' : 'light'}`}>

      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">AI<em>FLOW</em></span>
          </div>
          <div className="header-badge">MERN + React Flow</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={loadHistory}>History</button>
          <button className="btn btn-add" onClick={addNewPair}>+ Add Node</button>
          {/*Toggle*/}
          <button
            className="btn btn-theme"
            onClick={() => setIsDarkMode(prev => !prev)}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀' : '☾'}
          </button>
        </div>
      </header>

      <div className="flow-canvas">
        <ReactFlow
          nodes={nodesWithCallbacks}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background
            color={isDarkMode ? '#1a1a2e' : '#c8c8b8'}
            gap={28}
            size={1.5}
            variant="dots"
          />
          <Controls style={{
            background: isDarkMode ? '#0d0d1a' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#2a2a4a' : '#d4d4c4'}`,
            borderRadius: 8
          }} />
        </ReactFlow>
      </div>

      {/*Toast notification*/}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      {showHistory && (
        <div className="history-overlay" onClick={() => setShowHistory(false)}>
          <div className="history-panel" onClick={e => e.stopPropagation()}>
            <div className="history-header">
              <h2>Saved Flows</h2>
              <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
            </div>

            {history.length === 0 ? (
              <p className="empty-history">No saved flows yet.</p>
            ) : (
              <div className="history-list">
                {history.map(item => (
                  <div key={item._id} className="history-item">
                    <div className="history-prompt">Q: {item.prompt}</div>
                    <div className="history-response">
                      A: {item.response.substring(0, 100)}...
                    </div>
                    <div className="history-date">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}