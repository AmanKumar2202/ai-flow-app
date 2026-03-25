import React from 'react';
import { Handle, Position } from 'reactflow';


export function InputNode({ data }) {
  const { value, pairId, onChange, onRun, onSave } = data;

  return (
    <div className="flow-node input-node">

      
      <div className="node-label">
        <span className="node-icon">✦</span>
        PROMPT — Node {pairId}
      </div>

      <textarea
        className="node-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask anything..."
        rows={4}
      />

      <div className="node-actions">
        <button className="node-btn node-btn-save" onClick={onSave}>
          ⬡ Save
        </button>
        <button className="node-btn node-btn-run" onClick={onRun}>
          ▶ Run
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}


export function ResultNode({ data }) {
  const { value, loading } = data;

  return (
    <div className={`flow-node result-node ${loading ? 'loading' : ''}`}>

      
      <Handle type="target" position={Position.Left} className="flow-handle" />

      <div className="node-label">
        <span className="node-icon">◈</span>
        RESPONSE
      </div>

      <div className="node-result">
        {loading ? (
          // Bouncing dots while the AI is thinking
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        ) : value ? (
          // Show the AI's answer once it arrives
          <p>{value}</p>
        ) : (
          // Default empty state before the user runs anything
          <p className="placeholder-text">Response will appear here...</p>
        )}
      </div>

    </div>
  );
}