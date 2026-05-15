import React, { useState } from 'react';

function AdminPanel({ registeredUsers, aliens, onAddAlien, onDeleteAlien, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAddingAlien, setIsAddingAlien] = useState(false);
  const [newAlien, setNewAlien] = useState({ name: '', img: '', desc: '' });
  const [logs, setLogs] = useState([
    { id: 1, type: 'info', msg: 'System initialized. DNA Database online.', time: '10:00:01' },
    { id: 2, type: 'warning', msg: 'Anomalous energy signature detected in Sector 7.', time: '10:05:22' },
    { id: 3, type: 'success', msg: 'DNA archive synchronization complete.', time: '10:15:45' },
  ]);

  const stats = [
    { label: 'TOTAL DNA SAMPLES', value: aliens.length, icon: '🧬' },
    { label: 'REGISTERED AGENTS', value: registeredUsers.length, icon: '🛡️' },
    { label: 'SYSTEM UPTIME', value: '99.9%', icon: '⚡' },
    { label: 'ALERTS', value: logs.length, icon: '🚨' }
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAddAlien(newAlien);
    setIsAddingAlien(false);
    setNewAlien({ name: '', img: '', desc: '' });
    setLogs([{ id: Date.now(), type: 'success', msg: `New DNA Sample ${newAlien.name} added.`, time: new Date().toLocaleTimeString() }, ...logs]);
  };

  const confirmDelete = (name) => {
    if (window.confirm(`Permanently remove ${name} from archive?`)) {
      onDeleteAlien(name);
      setLogs([{ id: Date.now(), type: 'warning', msg: `DNA Sample ${name} purged from database.`, time: new Date().toLocaleTimeString() }, ...logs]);
    }
  };

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <img src="/src/assets/images/watch.png" alt="Logo" />
          <span>PLUMBER COMMAND</span>
        </div>
        <div className="sidebar-menu">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>DASHBOARD</button>
          <button className={activeTab === 'aliens' ? 'active' : ''} onClick={() => setActiveTab('aliens')}>DNA ARCHIVE</button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>SYSTEM LOGS</button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>AGENT ROSTER</button>
        </div>
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <p>Admin</p>
              <span>Level 10 Agent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <header className="admin-header">
          <h2>{activeTab.toUpperCase()}</h2>
          <div className="header-actions">
            <div className="status-indicator">SYSTEM ONLINE</div>
            <button className="logout-btn" onClick={onLogout}>SECURE EXIT</button>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <div className="stats-grid">
                {stats.map(s => (
                  <div key={s.label} className="stat-card">
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-details">
                      <span className="stat-label">{s.label}</span>
                      <span className="stat-value">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="dashboard-charts">
                <div className="chart-placeholder">
                  <h3>DNA SCAN ACTIVITY</h3>
                  <div className="bar-container">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="recent-activity">
                  <h3>RECENT ALERTS</h3>
                  <div className="activity-list">
                    {logs.slice(0, 3).map(log => (
                      <div key={log.id} className={`activity-item ${log.type}`}>
                        <span>{log.time}</span>
                        <p>{log.msg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aliens' && (
            <div className="aliens-admin">
              <div className="table-actions">
                <button className="add-btn" onClick={() => setIsAddingAlien(true)}>+ NEW DNA SAMPLE</button>
                <input type="text" placeholder="Filter DNA samples..." className="admin-search" />
              </div>

              {isAddingAlien && (
                <div className="admin-modal">
                  <div className="modal-content">
                    <h3>ADD NEW DNA SAMPLE</h3>
                    <form onSubmit={handleAddSubmit}>
                      <input 
                        type="text" 
                        placeholder="Species Name..." 
                        required 
                        value={newAlien.name}
                        onChange={(e) => setNewAlien({...newAlien, name: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="Image URL (e.g., /src/assets/images/alien.png)..." 
                        required 
                        value={newAlien.img}
                        onChange={(e) => setNewAlien({...newAlien, img: e.target.value})}
                      />
                      <textarea 
                        placeholder="Genetic Description..." 
                        required 
                        value={newAlien.desc}
                        onChange={(e) => setNewAlien({...newAlien, desc: e.target.value})}
                      />
                      <div className="modal-btns">
                        <button type="submit" className="save-btn">UPLOAD DNA</button>
                        <button type="button" className="cancel-btn" onClick={() => setIsAddingAlien(false)}>CANCEL</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>PREVIEW</th>
                    <th>SPECIES</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {aliens.map(alien => (
                    <tr key={alien.name}>
                      <td><img src={alien.img} alt={alien.name} className="table-img" /></td>
                      <td>{alien.name}</td>
                      <td><span className="status-pill active">STABLE</span></td>
                      <td>
                        <button className="edit-btn">EDIT</button>
                        <button className="delete-btn" onClick={() => confirmDelete(alien.name)}>DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="logs-view">
              <div className="terminal-window">
                <div className="terminal-header">PLUMBER_TERMINAL.EXE</div>
                <div className="terminal-content">
                  {logs.map(log => (
                    <div key={log.id} className={`log-entry ${log.type}`}>
                      <span className="log-time">[{log.time}]</span>
                      <span className="log-prefix">{log.type.toUpperCase()}:</span>
                      <span className="log-msg">{log.msg}</span>
                    </div>
                  ))}
                  <div className="terminal-cursor">_</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-view">
              <div className="table-actions">
                <h3 className="section-title-small">REGISTERED AGENTS ({registeredUsers.length})</h3>
              </div>
              <div className="user-grid">
                {registeredUsers.length > 0 ? (
                  registeredUsers.map(u => (
                    <div key={u.email} className="user-card">
                      <div className="user-card-header">
                        <div className="user-card-avatar">{u.username.split(' ').map(n => n[0]).join('')}</div>
                        <div className="user-card-info">
                          <h4>{u.username}</h4>
                          <p>{u.email}</p>
                        </div>
                      </div>
                      <div className="user-card-footer">
                        <span className="status-pill active">LEVEL 1</span>
                        <button className="view-btn">DE-ACTIVATE</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-users-msg">NO AGENTS REGISTERED IN DATABASE.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
