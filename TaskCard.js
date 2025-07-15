import React, { useState } from 'react';
import { api } from '../utils/api';
import { ws } from '../utils/websocket';

export default function TaskCard({ task, users, onDragStart, fetchTasks, user }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(task);
  const [conflict, setConflict] = useState(null);

  const handleEdit = () => setEditing(true);

  const handleSave = async () => {
    try {
      await api.put('/tasks.php', { ...form, id: task.id, updated_at: task.updated_at });
      ws.send('task-update');
      setEditing(false);
      fetchTasks();
    } catch (err) {
      if (err.response && err.response.data.error === 'Conflict') {
        setConflict(err.response.data.serverTask);
      }
    }
  };

  const handleSmartAssign = async () => {
    await api.post(`/tasks.php?smart_assign=1&id=${task.id}`);
    ws.send('task-update');
    fetchTasks();
  };

  if (conflict) {
    return (
      <div className="task-card conflict">
        <div>Conflict detected! Server version:</div>
        <pre>{JSON.stringify(conflict, null, 2)}</pre>
        <button onClick={() => setEditing(false)}>Cancel</button>
        <button onClick={() => setForm(conflict)}>Use Server Version</button>
        <button onClick={handleSave}>Overwrite with My Version</button>
      </div>
    );
  }

  return (
    <div
      className="task-card"
      draggable
      onDragStart={onDragStart}
      style={{ animation: 'cardFlip 0.4s' }}
    >
      {editing ? (
        <>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })}>
            {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <>
          <div><b>{task.title}</b></div>
          <div>{task.description}</div>
          <div>Assigned: {task.assigned_user}</div>
          <div>Priority: {task.priority}</div>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleSmartAssign}>Smart Assign</button>
        </>
      )}
    </div>
  );
}
