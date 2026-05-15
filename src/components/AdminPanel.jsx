import React, { useState, useRef } from 'react';
import '../styles/AdminPanel.css';
import { 
  LayoutDashboard, 
  Database, 
  Users, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Search, 
  Terminal,
  Activity,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';

function AdminPanel({ aliens, onAddAlien, onDeleteAlien, onUpdateAlien, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlien, setEditingAlien] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Classic',
    description: '',
    power: '',
    image_url: '',
    gallery: []
  });

  const fileInputRef = useRef(null);

  const stats = [
    { label: 'DNA SAMPLES', value: aliens.length, icon: <Database size={20} />, color: 'var(--primary)' },
    { label: 'SYSTEM UPTIME', value: '99.9%', icon: <Activity size={20} />, color: 'var(--info)' },
    { label: 'SECURITY LEVEL', value: '10', icon: <Shield size={20} />, color: 'var(--success)' },
    { label: 'ACTIVE ALERTS', value: '0', icon: <Zap size={20} />, color: 'var(--warning)' }
  ];

  const filteredAliens = aliens.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.type && a.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (alien = null) => {
    if (alien) {
      setEditingAlien(alien);
      setFormData({
        name: alien.name,
        type: alien.type || 'Classic',
        description: alien.description || alien.desc || '',
        power: alien.power || '',
        image_url: alien.image_url || alien.img || '',
        gallery: alien.gallery || []
      });
    } else {
      setEditingAlien(null);
      setFormData({
        name: '',
        type: 'Classic',
        description: '',
        power: '',
        image_url: '',
        gallery: []
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await storageService.uploadImage(file, 'aliens');
      setFormData({ ...formData, image_url: url });
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAlien) {
        await onUpdateAlien(editingAlien.id, formData);
      } else {
        await onAddAlien(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await onDeleteAlien(id);
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar-v2">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Shield size={24} color="var(--primary)" />
          </div>
          <div className="brand-text">
            <h3>PLUMBER HQ</h3>
            <span>Level 10 Command</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
            {activeTab === 'dashboard' && <motion.div layoutId="nav-pill" className="active-pill" />}
          </button>
          <button 
            className={activeTab === 'aliens' ? 'active' : ''} 
            onClick={() => setActiveTab('aliens')}
          >
            <Database size={20} />
            <span>DNA Archive</span>
            {activeTab === 'aliens' && <motion.div layoutId="nav-pill" className="active-pill" />}
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            <span>Agent Roster</span>
            {activeTab === 'users' && <motion.div layoutId="nav-pill" className="active-pill" />}
          </button>
          <button 
            className={activeTab === 'terminal' ? 'active' : ''} 
            onClick={() => setActiveTab('terminal')}
          >
            <Terminal size={20} />
            <span>Terminal</span>
            {activeTab === 'terminal' && <motion.div layoutId="nav-pill" className="active-pill" />}
          </button>
        </nav>

        <div className="sidebar-footer-v2">
          <button className="logout-action" onClick={onLogout}>
            <LogOut size={18} />
            <span>Secure Exit</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-v2">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h2 className="page-title">
              {activeTab === 'dashboard' && 'Operations Hub'}
              {activeTab === 'aliens' && 'DNA Archive Management'}
              {activeTab === 'users' && 'Authorized Personnel'}
              {activeTab === 'terminal' && 'System Console'}
            </h2>
          </div>
          <div className="topbar-right">
            <div className="system-status">
              <span className="pulse"></span>
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        <div className="content-scroll">
          {activeTab === 'dashboard' && (
            <div className="dashboard-v2">
              <div className="stats-grid-v2">
                {stats.map((stat, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="stat-card-v2"
                  >
                    <div className="stat-icon-v2" style={{ color: stat.color, background: `${stat.color}15` }}>
                      {stat.icon}
                    </div>
                    <div className="stat-info-v2">
                      <span className="stat-label-v2">{stat.label}</span>
                      <span className="stat-value-v2">{stat.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="dashboard-grid">
                <div className="activity-card">
                  <h3>Recent System Activity</h3>
                  <div className="activity-timeline">
                    <div className="timeline-item success">
                      <CheckCircle2 size={16} />
                      <div className="timeline-text">
                        <p>DNA Sequence <strong>Big Chill</strong> verified</p>
                        <span>2 mins ago</span>
                      </div>
                    </div>
                    <div className="timeline-item info">
                      <Activity size={16} />
                      <div className="timeline-text">
                        <p>Database synchronization complete</p>
                        <span>15 mins ago</span>
                      </div>
                    </div>
                    <div className="timeline-item warning">
                      <AlertTriangle size={16} />
                      <div className="timeline-text">
                        <p>Unauthorized access attempt blocked</p>
                        <span>1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="quick-actions-card">
                  <h3>Quick Protocol</h3>
                  <div className="action-buttons">
                    <button onClick={() => handleOpenModal()}>
                      <Plus size={18} />
                      Add New DNA Sample
                    </button>
                    <button className="secondary">
                      <Search size={18} />
                      Scan for Anomalies
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aliens' && (
            <div className="aliens-v2">
              <div className="table-header-v2">
                <div className="search-box-v2">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search DNA archive..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="add-btn-v2" onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  <span>NEW SAMPLE</span>
                </button>
              </div>

              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>Sample</th>
                      <th>Species Name</th>
                      <th>Classification</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAliens.map((alien, idx) => (
                      <motion.tr 
                        key={alien.id || alien.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <td>
                          <div className="sample-preview">
                            <img src={alien.image_url || alien.img} alt={alien.name} />
                          </div>
                        </td>
                        <td>
                          <div className="species-info">
                            <span className="species-name">{alien.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="classification-tag">{alien.type || 'Classic'}</span>
                        </td>
                        <td>
                          <span className="status-badge stable">Stable</span>
                        </td>
                        <td>
                          <div className="action-group">
                            <button className="icon-btn edit" onClick={() => handleOpenModal(alien)}>
                              <Edit3 size={16} />
                            </button>
                            <button className="icon-btn delete" onClick={() => handleDelete(alien.id, alien.name)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="terminal-v2">
              <div className="terminal-body">
                <div className="terminal-line"><span>[SYS]</span> Booting Plumber Command Interface...</div>
                <div className="terminal-line"><span>[SYS]</span> DNA Database: ONLINE</div>
                <div className="terminal-line"><span>[SYS]</span> Storage Bucket: alien-assets/ CONNECTED</div>
                <div className="terminal-line"><span>[USER]</span> Admin access granted.</div>
                <div className="terminal-line prompt">_</div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-placeholder-v2">
              <Shield size={48} color="var(--primary)" />
              <h3>Personnel Database restricted.</h3>
              <p>Only Level 10 Agents can access the full agent roster.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay-v2">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-v2"
            >
              <div className="modal-header-v2">
                <h3>{editingAlien ? 'Modify DNA Sample' : 'Archive New DNA'}</h3>
                <button className="close-btn-v2" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form-v2">
                <div className="form-split">
                  <div className="form-left">
                    <div className="image-upload-zone" onClick={() => fileInputRef.current.click()}>
                      {uploading ? (
                        <div className="upload-loader">
                          <Activity className="spin" size={32} />
                          <span>Uploading...</span>
                        </div>
                      ) : formData.image_url ? (
                        <img src={formData.image_url} alt="Preview" />
                      ) : (
                        <div className="upload-placeholder">
                          <Upload size={32} />
                          <span>Upload Sample Image</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        hidden 
                        ref={fileInputRef} 
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div className="form-right">
                    <div className="form-group-v2">
                      <label>Species Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Swampfire" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="form-group-v2">
                      <label>Classification</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="Classic">Classic</option>
                        <option value="Ultimate">Ultimate</option>
                        <option value="Fusion">Fusion</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Genetic Description</label>
                  <textarea 
                    placeholder="Describe the alien's abilities and origin..." 
                    rows="4"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-group-v2">
                  <label>Primary Power Signature</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pyrokinesis, Chlorokinesis" 
                    value={formData.power}
                    onChange={(e) => setFormData({...formData, power: e.target.value})}
                  />
                </div>

                <div className="modal-footer-v2">
                  <button type="button" className="cancel-btn-v2" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="submit-btn-v2" disabled={uploading}>
                    {editingAlien ? 'Sync Updates' : 'Initialize DNA'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPanel;
