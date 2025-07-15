import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { ws } from '../utils/websocket';

export default function ActivityLog() {
  const [actions, setActions] = useState([]);

  const fetchActions = async () => {
    const res = await api.get('/actions.php');
    setActions(res.data);
  };

  useEffect(() => {
    fetchActions();
    ws.onmessage = fetchActions;
    // eslint-disable-next-line
  }, []);

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <ul>
        {actions.map(a => (
          <li key={a.id}>
            [{a.timestamp}] <b>{a.username}</b> {a.action} <i>{a.title}</i>
          </li>
        ))}
      </ul>
    </div>
  );
}
