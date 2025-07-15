import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ws } from '../utils/websocket';
import TaskCard from './TaskCard';
import ActivityLog from './ActivityLog';

const columns = ['Todo', 'In Progress', 'Done'];

export default function KanbanBoard({ user }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [draggedTask, setDraggedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    ws.onmessage = fetchTasks;
    // eslint-disable-next-line
  }, []);

  const fetchTasks = async () => {
    const res = await api.get('/tasks.php');
    setTasks(res.data);
  };
  const fetchUsers = async () => {
    const res = await api.get('/users.php');
    setUsers(res.data);
  };

  const onDragStart = (task) => setDraggedTask(task);
  const onDrop = async (status) => {
    if (draggedTask) {
      await api.put('/tasks.php', { ...draggedTask, status, id: draggedTask.id });
      ws.send('task-update');
      setDraggedTask(null);
      fetchTasks();
    }
  };

  return (
    <div className="kanban-container">
      <div className="kanban-board">
        {columns.map(col => (
          <div
            key={col}
            className="kanban-column"
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(col)}
          >
            <h3>{col}</h3>
            {tasks.filter(t => t.status === col).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onDragStart={() => onDragStart(task)}
                fetchTasks={fetchTasks}
                user={user}
              />
            ))}
          </div>
        ))}
      </div>
      <ActivityLog />
    </div>
  );
}
