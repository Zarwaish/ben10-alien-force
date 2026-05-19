import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  Image as ImageIcon,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { storageService } from '../services/storageService';
import { toast } from 'react-hot-toast';

function AdminPanel({ aliens, schemaStatus, onAddAlien, onDeleteAlien, onUpdateAlien, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlien, setEditingAlien] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        if (!error && data) {
          setRegisteredUsers(data);
        } else {
          console.warn('Could not fetch profiles from Supabase:', error);
          setRegisteredUsers([]);
        }
      } catch (err) {
        console.warn('Error fetching profiles:', err);
        setRegisteredUsers([]);
      }
    };

    fetchUsers();

    // Subscribe to real-time updates on public.profiles table
    let channel;
    try {
      if (supabase && typeof supabase.channel === 'function') {
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'profiles'
            },
            (payload) => {
              fetchUsers();
            }
          )
          .subscribe();
      }
    } catch (err) {
      console.warn('Failed to subscribe to real-time user updates:', err);
    }

    return () => {
      try {
        if (channel && supabase && typeof supabase.removeChannel === 'function') {
          supabase.removeChannel(channel);
        }
      } catch (err) {
        console.warn('Failed to unsubscribe from real-time channel:', err);
      }
    };
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Classic',
    description: '',
    power: '',
    image_url: '',
    gallery: [],
    watch_type: 'omnitrix',
    order_index: 1
  });

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const stats = [
    { label: 'DNA SAMPLES', value: (aliens || []).length, icon: <Database size={20} />, color: 'var(--primary)' },
    { label: 'SYSTEM UPTIME', value: '99.9%', icon: <Activity size={20} />, color: 'var(--info)' },
    { label: 'SECURITY LEVEL', value: '10', icon: <Shield size={20} />, color: 'var(--success)' },
    { label: 'ACTIVE ALERTS', value: '0', icon: <Zap size={20} />, color: 'var(--warning)' }
  ];

  const handleOpenModal = (alien = null, defaultWatch = 'omnitrix') => {
    if (alien) {
      setEditingAlien(alien);
      setFormData({
        name: alien.name || '',
        type: alien.type || 'Classic',
        description: alien.description || '',
        power: alien.power || '',
        image_url: alien.image_url || '',
        gallery: alien.gallery || [],
        watch_type: alien.watch_type || 'homepage',
        order_index: alien.order_index !== undefined && alien.order_index !== null ? Number(alien.order_index) : 1
      });
    } else {
      setEditingAlien(null);
      // Auto-increment order_index for the watch
      const existingOfWatch = (aliens || []).filter(a => a && (a.watch_type === defaultWatch || a.watch_type === 'both' || (defaultWatch === 'homepage' && !a.watch_type)));
      const maxIdx = existingOfWatch.reduce((max, a) => Math.max(max, Number(a.order_index) || 0), 0);
      setFormData({
        name: '',
        type: 'Classic',
        description: '',
        power: '',
        image_url: '',
        gallery: [],
        watch_type: defaultWatch,
        order_index: maxIdx + 1
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
      toast.success('Main image uploaded');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = files.map(file => storageService.uploadImage(file, 'gallery'));
      const urls = await Promise.all(uploadPromises);
      setFormData({ ...formData, gallery: [...formData.gallery, ...urls] });
      toast.success(`${urls.length} images added to gallery`);
    } catch (err) {
      console.error(err);
      toast.error('Gallery upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image_url) return toast.error('Please upload a main image');
    
    try {
      setUploading(true);
      if (editingAlien) {
        await onUpdateAlien(editingAlien.id, formData);
      } else {
        await onAddAlien(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('[AdminPanel.handleSubmit]', err);
      // Show the real error — not a generic one
      toast.error(err?.message || 'Database sync failed', { duration: 8000 });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} from archive?`)) {
      try {
        await onDeleteAlien(id);
      } catch (err) {
        toast.error('Deletion failed');
      }
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? Their access will be revoked instantly.')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        toast.success('User deleted successfully.');
        // Realtime subscription will fetchUsers() and update the list instantly
      } catch (err) {
        toast.error('Failed to delete user.');
        console.error(err);
      }
    }
  };

  const renderAlienVaultTable = (watchType) => {
    const isUlt = watchType === 'ultimatrix';
    const isOmni = watchType === 'omnitrix';
    const isHome = watchType === 'homepage';

    const filtered = (aliens || []).filter(a => {
      if (!a) return false;
      const w = a.watch_type;
      
      let matchesWatch = false;
      if (isHome) {
        matchesWatch = w === 'homepage' || w === 'both' || !w;
      } else if (isOmni) {
        matchesWatch = w === 'omnitrix' || w === 'both';
      } else if (isUlt) {
        matchesWatch = w === 'ultimatrix' || w === 'both';
      }
      
      const term = searchTerm.toLowerCase();
      const matchesSearch = (a.name || '').toLowerCase().includes(term) ||
                            (a.type && a.type.toLowerCase().includes(term));
      return matchesWatch && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const idxA = a.order_index !== undefined && a.order_index !== null ? Number(a.order_index) : 999;
      const idxB = b.order_index !== undefined && b.order_index !== null ? Number(b.order_index) : 999;
      return idxA - idxB;
    });

    const titlePrefix = watchType === 'homepage' ? 'Homepage' : watchType === 'omnitrix' ? 'Omnitrix' : 'Ultimatrix';

    return (
      <div className="aliens-v2">
        <div className="table-header-v2">
          <div className="search-box-v2">
            <Search size={18} />
            <input type="text" placeholder={`Search ${titlePrefix} Vault...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="add-btn-v2" onClick={() => handleOpenModal(null, watchType)}>
            <Plus size={18} />
            <span>ADD SAMPLE</span>
          </button>
        </div>

        <div className="table-container-v2">
          <table className="admin-table-v2">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Slot</th>
                <th>Preview</th>
                <th>Species</th>
                <th>Classification</th>
                <th>Power Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No DNA samples recorded in this chamber. Click ADD SAMPLE to calibrate.
                  </td>
                </tr>
              ) : (
                sorted.map((alien) => (
                  <tr key={alien.id}>
                    <td>
                      <input 
                        type="number" 
                        min="1"
                        value={alien.order_index !== undefined && alien.order_index !== null ? alien.order_index : ''} 
                        onChange={async (e) => {
                          const val = parseInt(e.target.value) || 1;
                          try {
                            await onUpdateAlien(alien.id, { ...alien, order_index: val });
                          } catch (err) {
                            toast.error('Reordering failed');
                          }
                        }}
                        style={{
                          width: '65px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--glass-border)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '6px',
                          textAlign: 'center',
                          fontFamily: 'monospace'
                        }}
                      />
                    </td>
                    <td><img src={alien.image_url} alt="" className="table-img" /></td>
                    <td className="font-bold">{alien.name}</td>
                    <td><span className="tag">{alien.type}</span></td>
                    <td><span className="tag info">{alien.power || 'Unknown'}</span></td>
                    <td>
                      <div className="action-group">
                        <button className="icon-btn edit" onClick={() => handleOpenModal(alien, watchType)}><Edit3 size={16} /></button>
                        <button className="icon-btn delete" onClick={() => handleDelete(alien.id, alien.name)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Operations Hub</span>
          </button>
          <button className={activeTab === 'homepage' ? 'active' : ''} onClick={() => setActiveTab('homepage')}>
            <Database size={20} color="#00bfff" />
            <span>Homepage Vault</span>
          </button>
          <button className={activeTab === 'omnitrix' ? 'active' : ''} onClick={() => setActiveTab('omnitrix')}>
            <Database size={20} color="#00ff00" />
            <span>Omnitrix Vault</span>
          </button>
          <button className={activeTab === 'ultimatrix' ? 'active' : ''} onClick={() => setActiveTab('ultimatrix')}>
            <Database size={20} color="#ff3300" />
            <span>Ultimatrix Vault</span>
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={20} />
            <span>Registered Agents</span>
          </button>
          <button className={activeTab === 'terminal' ? 'active' : ''} onClick={() => setActiveTab('terminal')}>
            <Terminal size={20} />
            <span>System Log</span>
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
          <h2 className="page-title">
            {activeTab === 'dashboard' && 'Operations Hub'}
            {activeTab === 'homepage' && 'Homepage DNA Vault'}
            {activeTab === 'omnitrix' && 'Omnitrix DNA Vault'}
            {activeTab === 'ultimatrix' && 'Ultimatrix DNA Vault'}
            {activeTab === 'users' && 'Registered Agents Directory'}
            {activeTab === 'terminal' && 'System Console'}
          </h2>
          <div className="system-status">
            <span className="pulse"></span>
            CONNECTED
          </div>
        </header>

        <div className="content-scroll">
          {(!schemaStatus?.hasWatchColumns || !schemaStatus?.hasGalleryColumn) && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgb(239, 68, 68)',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              <AlertTriangle size={24} style={{ flexShrink: 0 }} />
              <div>
                <strong>Supabase Schema Missing Columns!</strong> The database table <code>aliens</code> is missing the <code>watch_type</code>, <code>order_index</code>, or <code>gallery</code> columns. 
                Please copy the queries in <code>supabase_updates.sql</code> and execute them in your Supabase SQL Editor to resolve filtering and layout anomalies.
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="dashboard-v2">
              <div className="stats-grid-v2">
                {stats.map((stat, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card-v2">
                    <div className="stat-icon-v2" style={{ color: stat.color, background: `${stat.color}15` }}>{stat.icon}</div>
                    <div className="stat-info-v2">
                      <span className="stat-label-v2">{stat.label}</span>
                      <span className="stat-value-v2">{stat.value}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="activity-card">
                <h3>System Integrity Logs</h3>
                <div className="activity-timeline">
                  <div className="timeline-item success">
                    <CheckCircle2 size={16} />
                    <div className="timeline-text"><p>Database synchronization active</p><span>Just now</span></div>
                  </div>
                  <div className="timeline-item info">
                    <Activity size={16} />
                    <div className="timeline-text"><p>{(aliens || []).length} alien samples verified</p><span>5 mins ago</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'homepage' && renderAlienVaultTable('homepage')}
          {activeTab === 'omnitrix' && renderAlienVaultTable('omnitrix')}
          {activeTab === 'ultimatrix' && renderAlienVaultTable('ultimatrix')}

          {activeTab === 'terminal' && (
            <div className="terminal-v2">
              <div className="terminal-body">
                <p><span>[SYS]</span> Storage Bucket: alien-assets/ CONNECTED</p>
                <p><span>[SYS]</span> DNA Database: ONLINE</p>
                <p><span>[USER]</span> Admin access verified.</p>
                <p className="prompt">_</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="aliens-v2">
              <div className="table-header-v2">
                <h3>Plumber Academy Enrolled Agents</h3>
              </div>

              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Email Identification</th>
                      <th>Role Command</th>
                      <th>Database ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsers.map((user) => (
                      <tr key={user.id || Math.random().toString()}>
                        <td className="font-bold">{user.username || (user.email || '').split('@')[0] || 'Unknown'}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>
                          <span className={`tag ${user.role === 'admin' ? 'danger' : 'success'}`}>
                            {user.role ? user.role.toUpperCase() : 'USER'}
                          </span>
                        </td>
                        <td style={{fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)'}}>{user.id || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="action-btn delete" 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.role === 'admin'}
                              title={user.role === 'admin' ? 'Cannot delete admin' : 'Delete User'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay-v2">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-v2">
              <div className="modal-header-v2">
                <h3>{editingAlien ? 'Update Genetic Archive' : 'Initialize New DNA Sample'}</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form-v2">
                <div className="form-grid">
                  <div className="upload-section">
                    <div className="main-upload" onClick={() => fileInputRef.current.click()}>
                      {formData.image_url ? <img src={formData.image_url} alt="Main" /> : <div className="upload-placeholder"><Upload size={32} /><p>Upload DNA Image</p></div>}
                      <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                    </div>
                  </div>

                  <div className="inputs-section">
                    <div className="form-group-v2">
                      <label>Species Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="form-group-v2">
                      <label>Classification</label>
                      <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="Classic">Classic</option>
                        <option value="Ultimate">Ultimate</option>
                        <option value="Fusion">Fusion</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group-v2">
                  <label>Genetic Description</label>
                  <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
                </div>

                <div className="form-group-v2">
                  <label>Power Signatures</label>
                  <input type="text" value={formData.power} onChange={(e) => setFormData({...formData, power: e.target.value})} placeholder="e.g. Pyrokinesis, Flight" />
                </div>

                <div className="form-row-two-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group-v2" style={{ marginBottom: 0 }}>
                    <label>Watch Assignment</label>
                    <select value={formData.watch_type} onChange={(e) => setFormData({...formData, watch_type: e.target.value})}>
                      <option value="homepage">Homepage Only</option>
                      <option value="omnitrix">Omnitrix Only</option>
                      <option value="ultimatrix">Ultimatrix Only</option>
                      <option value="both">Both Watches</option>
                    </select>
                  </div>
                  <div className="form-group-v2" style={{ marginBottom: 0 }}>
                    <label>Slot Position (Order Index)</label>
                    <input type="number" min="1" value={formData.order_index} onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 1})} required />
                  </div>
                </div>

                <div className="gallery-section">
                  <label>Sample Gallery</label>
                  <div className="gallery-grid">
                    {formData.gallery.map((url, i) => (
                      <div key={i} className="gallery-item">
                        <img src={url} alt="" />
                        <button type="button" onClick={() => removeGalleryImage(i)}><X size={12} /></button>
                      </div>
                    ))}
                    <button type="button" className="gallery-add" onClick={() => galleryInputRef.current.click()}>
                      <Plus size={20} />
                    </button>
                    <input type="file" hidden multiple ref={galleryInputRef} onChange={handleGalleryUpload} accept="image/*" />
                  </div>
                </div>

                <div className="modal-footer-v2">
                  <button type="button" className="cancel-btn-v2" onClick={() => setIsModalOpen(false)}>Abort</button>
                  <button type="submit" className="submit-btn-v2" disabled={uploading}>
                    {uploading ? <Loader2 className="spin" size={20} /> : (editingAlien ? 'Update Archive' : 'Confirm DNA')}
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

