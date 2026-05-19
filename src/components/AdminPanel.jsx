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

function AdminPanel({ aliens, onAddAlien, onDeleteAlien, onUpdateAlien, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlien, setEditingAlien] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      let dbUsers = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        if (!error && data) {
          dbUsers = data;
        }
      } catch (err) {
        console.warn('Could not fetch profiles from Supabase, using local cache:', err);
      }
      
      const localUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      
      const allUsers = [...dbUsers];
      localUsers.forEach(lu => {
        if (lu && lu.email && !allUsers.some(au => au.email && au.email.toLowerCase() === lu.email.toLowerCase())) {
          allUsers.push(lu);
        }
      });
      
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        try {
          const admin = JSON.parse(adminSession).profile;
          if (admin && admin.email && !allUsers.some(au => au.email && au.email.toLowerCase() === admin.email.toLowerCase())) {
            allUsers.push(admin);
          }
        } catch (e) {}
      }
      
      setRegisteredUsers(allUsers);
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
              console.log('Real-time profile change received:', payload);
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
    gallery: []
  });

  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const stats = [
    { label: 'DNA SAMPLES', value: (aliens || []).length, icon: <Database size={20} />, color: 'var(--primary)' },
    { label: 'SYSTEM UPTIME', value: '99.9%', icon: <Activity size={20} />, color: 'var(--info)' },
    { label: 'SECURITY LEVEL', value: '10', icon: <Shield size={20} />, color: 'var(--success)' },
    { label: 'ACTIVE ALERTS', value: '0', icon: <Zap size={20} />, color: 'var(--warning)' }
  ];

  const filteredAliens = (aliens || []).filter(a => 
    a && (
      (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.type && a.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const handleOpenModal = (alien = null) => {
    if (alien) {
      setEditingAlien(alien);
      setFormData({
        name: alien.name,
        type: alien.type || 'Classic',
        description: alien.description || '',
        power: alien.power || '',
        image_url: alien.image_url || '',
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
      console.error(err);
      toast.error('Database sync failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Permanently remove ${name} from archive?`)) {
      try {
        await onDeleteAlien(id);
      } catch (err) {
        toast.error('Deletetion failed');
      }
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
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Operations Hub</span>
          </button>
          <button className={activeTab === 'aliens' ? 'active' : ''} onClick={() => setActiveTab('aliens')}>
            <Database size={20} />
            <span>DNA Archive</span>
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
            {activeTab === 'aliens' && 'DNA Archive Management'}
            {activeTab === 'users' && 'Registered Agents Directory'}
            {activeTab === 'terminal' && 'System Console'}
          </h2>
          <div className="system-status">
            <span className="pulse"></span>
            CONNECTED
          </div>
        </header>

        <div className="content-scroll">
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

          {activeTab === 'aliens' && (
            <div className="aliens-v2">
              <div className="table-header-v2">
                <div className="search-box-v2">
                  <Search size={18} />
                  <input type="text" placeholder="Search archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <button className="add-btn-v2" onClick={() => handleOpenModal()}>
                  <Plus size={18} />
                  <span>ADD SAMPLE</span>
                </button>
              </div>

              <div className="table-container-v2">
                <table className="admin-table-v2">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Species</th>
                      <th>Classification</th>
                      <th>Power Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAliens.map((alien) => (
                      <tr key={alien.id}>
                        <td><img src={alien.image_url} alt="" className="table-img" /></td>
                        <td className="font-bold">{alien.name}</td>
                        <td><span className="tag">{alien.type}</span></td>
                        <td><div className="power-bar"><div className="bar-fill" style={{width: '80%'}}></div></div></td>
                        <td>
                          <div className="action-group">
                            <button className="icon-btn edit" onClick={() => handleOpenModal(alien)}><Edit3 size={16} /></button>
                            <button className="icon-btn delete" onClick={() => handleDelete(alien.id, alien.name)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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

