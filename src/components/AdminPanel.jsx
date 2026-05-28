import React, { useState, useEffect, useRef } from "react";
import { adminAlienService, adminTransformationService } from "../services/adminService";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit, Upload, X, Image as ImageIcon, Sparkles, RefreshCw, LayoutDashboard, Watch, Activity, Users, Shield, Power } from "lucide-react";
import { toast } from "react-hot-toast";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aliens, setAliens] = useState([]);
  const [transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Forms visibility & state
  const [isAdding, setIsAdding] = useState(false);
  const [editingAlien, setEditingAlien] = useState(null);
  const [editingTransformation, setEditingTransformation] = useState(null);

  // File uploads
  const [alienImageFile, setAlienImageFile] = useState(null);
  const [transImageFile, setTransImageFile] = useState(null);
  const [alienPreviewUrl, setAlienPreviewUrl] = useState("");
  const [transPreviewUrl, setTransPreviewUrl] = useState("");

  // Gallery and Ultimate Form state
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [newGalleryPreviewUrls, setNewGalleryPreviewUrls] = useState([]);
  const [ultimateFile, setUltimateFile] = useState(null);
  const [ultimatePreviewUrl, setUltimatePreviewUrl] = useState("");

  const alienFileInputRef = useRef(null);
  const transFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);
  const ultimateFileInputRef = useRef(null);

  // New templates
  const initialAlienState = {
    name: "",
    description: "",
    power: "",
    type: "Classic",
    watch_type: "omnitrix",
    order_index: 0,
    species: "",
    planet: "",
    image_url: "",
    ultimate_image_url: "",
    gallery: [],
    is_active: true
  };

  const initialTransState = {
    name: "",
    description: "",
    alien_id: "",
    image_url: ""
  };

  const [newAlien, setNewAlien] = useState({ ...initialAlienState });
  const [newTransformation, setNewTransformation] = useState({ ...initialTransState });

  // Load data from service
  const loadData = async () => {
    setLoading(true);
    try {
      const allAliens = await adminAlienService.list();
      setAliens(allAliens || []);
      const allTrans = await adminTransformationService.list();
      setTransformations(allTrans || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load data. Supabase is initializing...");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset inputs on tab change
    setIsAdding(false);
    setEditingAlien(null);
    setEditingTransformation(null);
    setAlienImageFile(null);
    setTransImageFile(null);
    setAlienPreviewUrl("");
    setTransPreviewUrl("");
    setGalleryFiles([]);
    setNewGalleryPreviewUrls([]);
    setUltimateFile(null);
    setUltimatePreviewUrl("");
  }, [activeTab]);

  // File picker handlers
  const handleAlienFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlienImageFile(file);
      setAlienPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleTransFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTransImageFile(file);
      setTransPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setNewGalleryPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const handleUltimateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUltimateFile(file);
      setUltimatePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDeleteGalleryImage = (urlToDelete) => {
    if (!editingAlien) return;
    const updatedGallery = (editingAlien.gallery || []).filter((u) => u !== urlToDelete);
    setEditingAlien({
      ...editingAlien,
      gallery: updatedGallery
    });
  };

  const handleDeleteNewGalleryFile = (index) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Add Alien
  const handleAddAlien = async (e) => {
    e.preventDefault();
    if (!newAlien.name) {
      toast.error("Alien name is required.");
      return;
    }
    setLoading(true);
    try {
      const created = await adminAlienService.create(newAlien, alienImageFile, galleryFiles, ultimateFile);
      setAliens((prev) => [...prev, created]);
      setNewAlien({ ...initialAlienState });
      setAlienImageFile(null);
      setAlienPreviewUrl("");
      setGalleryFiles([]);
      setNewGalleryPreviewUrls([]);
      setUltimateFile(null);
      setUltimatePreviewUrl("");
      setIsAdding(false);
      toast.success(`${created.name} added successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to create alien.");
    } finally {
      setLoading(false);
    }
  };

  // Edit Alien
  const handleEditAlien = async (e) => {
    e.preventDefault();
    if (!editingAlien.name) {
      toast.error("Alien name is required.");
      return;
    }
    setLoading(true);
    try {
      const updated = await adminAlienService.update(editingAlien.id, editingAlien, alienImageFile, galleryFiles, ultimateFile);
      setAliens((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditingAlien(null);
      setAlienImageFile(null);
      setAlienPreviewUrl("");
      setGalleryFiles([]);
      setNewGalleryPreviewUrls([]);
      setUltimateFile(null);
      setUltimatePreviewUrl("");
      toast.success(`${updated.name} updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update alien.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Alien
  const handleDeleteAlien = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    setLoading(true);
    try {
      await adminAlienService.delete(id);
      setAliens((prev) => prev.filter((a) => a.id !== id));
      toast.success(`${name} deleted successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete alien.");
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle Active Alien (Local State)
  const toggleAlienActive = (alien) => {
    setAliens((prev) => prev.map(a => {
      if(a.id === alien.id) {
        toast.success(`${alien.name} ${!a.is_active ? 'enabled' : 'disabled'}.`);
        return { ...a, is_active: !a.is_active };
      }
      return a;
    }));
  };

  // Add Transformation
  const handleAddTransformation = async (e) => {
    e.preventDefault();
    if (!newTransformation.alien_id) {
      toast.error("Please select an alien.");
      return;
    }
    setLoading(true);
    try {
      const parentAlien = aliens.find((a) => a.id === newTransformation.alien_id);
      const name = newTransformation.name || `${parentAlien ? parentAlien.name : "Alien"} Form`;
      
      const created = await adminTransformationService.create({ ...newTransformation, name }, transImageFile);
      setTransformations((prev) => [created, ...prev]);
      setNewTransformation({ ...initialTransState });
      setTransImageFile(null);
      setTransPreviewUrl("");
      setIsAdding(false);
      toast.success("Transformation image added successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add transformation.");
    } finally {
      setLoading(false);
    }
  };

  // Edit Transformation
  const handleEditTransformation = async (e) => {
    e.preventDefault();
    if (!editingTransformation.alien_id) {
      toast.error("Please select an alien.");
      return;
    }
    setLoading(true);
    try {
      const updated = await adminTransformationService.update(editingTransformation.id, editingTransformation, transImageFile);
      setTransformations((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTransformation(null);
      setTransImageFile(null);
      setTransPreviewUrl("");
      toast.success("Transformation updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update transformation.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Transformation
  const handleDeleteTransformation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transformation image?")) return;
    setLoading(true);
    try {
      await adminTransformationService.delete(id);
      setTransformations((prev) => prev.filter((t) => t.id !== id));
      toast.success("Transformation image deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete transformation.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate Dashboard Stats
  const omnitrixAliens = aliens.filter(a => a.watch_type === 'omnitrix' || a.watch_type === 'both');
  const ultimatrixAliens = aliens.filter(a => a.watch_type === 'ultimatrix' || a.watch_type === 'both');
  
  // Render function for cards
  const renderAlienCard = (alien) => (
    <motion.div 
      key={alien.id} 
      className={`alien-admin-card ${alien.is_active === false ? 'disabled' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
    >
      <div className="card-image">
        {alien.image_url ? (
          <img src={alien.image_url} alt={alien.name} />
        ) : (
          <div className="no-image"><ImageIcon size={32} /></div>
        )}
        <span className="type-badge">{alien.type || "Classic"}</span>
      </div>
      
      <div className="card-info">
        <h3>{alien.name}</h3>
        <p className="card-meta">
          {alien.watch_type && <span><Watch size={10} style={{display:'inline'}}/> {alien.watch_type.toUpperCase()}</span>}
        </p>
        <p className="card-description">{alien.description || "No description set."}</p>
        
        <div className="card-powers">
          {alien.power ? (
            alien.power.split(',').map((p, idx) => (
              <span key={idx} className="power-pill">{p.trim()}</span>
            ))
          ) : (
            <span className="power-pill muted">No powers defined</span>
          )}
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn toggle" onClick={() => toggleAlienActive(alien)} title="Enable/Disable">
          <Power size={14} className={alien.is_active !== false ? 'active-icon' : 'inactive-icon'} />
        </button>
        <button className="action-btn edit" onClick={() => { setEditingAlien({ ...alien, gallery: alien.gallery || [], ultimate_image_url: alien.ultimate_image_url || "" }); setIsAdding(false); }}>
          <Edit size={14} />
          <span>Edit</span>
        </button>
        <button className="action-btn delete" onClick={() => handleDeleteAlien(alien.id, alien.name)}>
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-container">
        
        {/* Header */}
        <div className="admin-header">
          <div className="title-area">
            <h1 className="admin-title">
              <Shield className="sparkle-icon" size={32} />
              Plumber Headquarters
            </h1>
            <p className="admin-subtitle">Classified Alien & Transformation Control Interface</p>
          </div>
          <button className="refresh-btn" onClick={loadData} title="Refresh Database Data">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Sync DB</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="admin-tabs">
          <button className={activeTab === "dashboard" ? "tab active" : "tab"} onClick={() => setActiveTab("dashboard")}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={activeTab === "omnitrix" ? "tab active" : "tab"} onClick={() => setActiveTab("omnitrix")}>
            <Watch size={18} /> Omnitrix
          </button>
          <button className={activeTab === "ultimatrix" ? "tab active" : "tab"} onClick={() => setActiveTab("ultimatrix")}>
            <Watch size={18} /> Ultimatrix
          </button>
          <button className={activeTab === "transformations" ? "tab active" : "tab"} onClick={() => setActiveTab("transformations")}>
            <Activity size={18} /> Transformations
          </button>
        </nav>

        {/* Loading overlay */}
        {loading && aliens.length === 0 && transformations.length === 0 && (
          <div className="admin-loader">
            <div className="omnitrix-spinner"></div>
            <span>Accessing Codon Stream...</span>
          </div>
        )}

        <div className="admin-layout">
          
          {/* Main Area */}
          <main className="admin-main">
            
            {activeTab === "dashboard" && (
              <div className="dashboard-view">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon"><Users size={24} /></div>
                    <div className="stat-content">
                      <h3>Total Aliens</h3>
                      <p className="stat-value">{aliens.length}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon omnitrix-color"><Watch size={24} /></div>
                    <div className="stat-content">
                      <h3>Omnitrix Samples</h3>
                      <p className="stat-value">{omnitrixAliens.length}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon ultimatrix-color"><Watch size={24} /></div>
                    <div className="stat-content">
                      <h3>Ultimatrix Samples</h3>
                      <p className="stat-value">{ultimatrixAliens.length}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon trans-color"><Activity size={24} /></div>
                    <div className="stat-content">
                      <h3>Transformations</h3>
                      <p className="stat-value">{transformations.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {transformations.slice(0, 5).map(tr => {
                      const alien = aliens.find(a => a.id === tr.alien_id);
                      return (
                        <div key={tr.id} className="activity-item">
                          <Activity size={16} className="activity-icon" />
                          <div className="activity-text">
                            <strong>New Transformation Added:</strong> {tr.name} for {alien?.name || "Unknown Alien"}
                          </div>
                        </div>
                      )
                    })}
                    {aliens.slice(aliens.length > 5 ? aliens.length - 5 : 0).reverse().map(al => (
                      <div key={al.id} className="activity-item">
                        <Users size={16} className="activity-icon" />
                        <div className="activity-text">
                          <strong>New Alien Cataloged:</strong> {al.name} ({al.watch_type})
                        </div>
                      </div>
                    ))}
                    {transformations.length === 0 && aliens.length === 0 && (
                      <p className="text-muted">No recent activity found in the Codon Stream.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "omnitrix" || activeTab === "ultimatrix") && (
              <>
                <div className="section-header-row">
                  <h2 className="section-title">
                    {activeTab.toUpperCase()} DATABASE
                    <span className="badge">{activeTab === "omnitrix" ? omnitrixAliens.length : ultimatrixAliens.length}</span>
                  </h2>
                  
                  {!isAdding && !editingAlien && !editingTransformation && (
                    <button className="add-btn" onClick={() => {
                      setNewAlien({ ...initialAlienState, watch_type: activeTab });
                      setIsAdding(true);
                    }}>
                      <Plus size={16} />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                <div className="alien-grid">
                  <AnimatePresence>
                    {(activeTab === "omnitrix" ? omnitrixAliens : ultimatrixAliens).map(renderAlienCard)}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* Transformations Grid */}
            {activeTab === "transformations" && (
              <>
                <div className="section-header-row">
                  <h2 className="section-title">
                    TRANSFORMATIONS
                    <span className="badge">{transformations.length}</span>
                  </h2>
                  
                  {!isAdding && !editingAlien && !editingTransformation && (
                    <button className="add-btn" onClick={() => setIsAdding(true)}>
                      <Plus size={16} />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                <div className="trans-admin-grid">
                  <AnimatePresence>
                    {transformations.map((tr) => {
                      const parentAlien = aliens.find((a) => a.id === tr.alien_id);
                      return (
                        <motion.div 
                          key={tr.id} 
                          className="trans-admin-card"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <div className="trans-image">
                            {tr.image_url ? (
                              <img src={tr.image_url} alt={tr.description} />
                            ) : (
                              <div className="no-image"><ImageIcon size={32} /></div>
                            )}
                          </div>
                          <div className="trans-info">
                            <h3>{tr.name || "Transformation Form"}</h3>
                            <div className="parent-tag">
                              <strong>Alien:</strong> {parentAlien ? parentAlien.name : "Deleted Alien"}
                            </div>
                            <p>{tr.description || "No description provided."}</p>
                          </div>
                          <div className="trans-actions">
                            <button className="action-btn edit" onClick={() => { setEditingTransformation(tr); setIsAdding(false); }}>
                              <Edit size={14} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleDeleteTransformation(tr.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </>
            )}
          </main>

          {/* Form Panel (Right Sidebar) */}
          {activeTab !== "dashboard" && (
            <aside className={`admin-sidebar ${isAdding || editingAlien || editingTransformation ? 'active' : ''}`}>
              <AnimatePresence mode="wait">
                
                {/* Form Title & Close */}
                {(isAdding || editingAlien || editingTransformation) ? (
                  <motion.div 
                    key="form-container"
                    className="form-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="form-header">
                      <h3>
                        {isAdding && `Add New ${activeTab === "transformations" ? "Transformation" : "Alien"}`}
                        {editingAlien && `Edit ${editingAlien.name}`}
                        {editingTransformation && `Edit Transformation`}
                      </h3>
                      <button className="close-form-btn" onClick={() => {
                        setIsAdding(false);
                        setEditingAlien(null);
                        setEditingTransformation(null);
                        setAlienImageFile(null);
                        setTransImageFile(null);
                        setAlienPreviewUrl("");
                        setTransPreviewUrl("");
                        setGalleryFiles([]);
                        setNewGalleryPreviewUrls([]);
                        setUltimateFile(null);
                        setUltimatePreviewUrl("");
                      }}>
                        <X size={18} />
                      </button>
                    </div>

                    {/* ALIEN ADD FORM */}
                    {isAdding && activeTab !== "transformations" && (
                      <form onSubmit={handleAddAlien} className="admin-form">
                        <div className="form-group">
                          <label>Alien Name *</label>
                          <input type="text" value={newAlien.name} onChange={(e) => setNewAlien({ ...newAlien, name: e.target.value })} required placeholder="e.g. Swampfire" />
                        </div>
                        <div className="form-group">
                          <label>Alien Type</label>
                          <input type="text" value={newAlien.type} onChange={(e) => setNewAlien({ ...newAlien, type: e.target.value })} placeholder="e.g. Classic, Ultimate" />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Species</label>
                            <input type="text" value={newAlien.species} onChange={(e) => setNewAlien({ ...newAlien, species: e.target.value })} placeholder="e.g. Methanosian" />
                          </div>
                          <div className="form-group">
                            <label>Planet</label>
                            <input type="text" value={newAlien.planet} onChange={(e) => setNewAlien({ ...newAlien, planet: e.target.value })} placeholder="e.g. Methanos" />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Abilities / Powers (comma separated)</label>
                          <input type="text" value={newAlien.power} onChange={(e) => setNewAlien({ ...newAlien, power: e.target.value })} placeholder="e.g. Pyrokinesis, Chlorokinesis" />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Order Index</label>
                            <input type="number" value={newAlien.order_index} onChange={(e) => setNewAlien({ ...newAlien, order_index: e.target.value })} min="0" />
                          </div>
                          <div className="form-group">
                            <label>Watch Category</label>
                            <select value={newAlien.watch_type} onChange={(e) => setNewAlien({ ...newAlien, watch_type: e.target.value })}>
                              <option value="omnitrix">Omnitrix</option>
                              <option value="ultimatrix">Ultimatrix</option>
                              <option value="both">Both Watches</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea value={newAlien.description} onChange={(e) => setNewAlien({ ...newAlien, description: e.target.value })} rows="3" placeholder="Detail the lore/biography of the alien..."></textarea>
                        </div>
                        
                        {/* Image Upload/Url Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Image Upload</label>
                            <div className="file-uploader" onClick={() => alienFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{alienImageFile ? alienImageFile.name : "Select Image File"}</span>
                              <input type="file" ref={alienFileInputRef} onChange={handleAlienFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Paste Image URL</label>
                            <input type="url" value={newAlien.image_url} onChange={(e) => setNewAlien({ ...newAlien, image_url: e.target.value })} placeholder="https://example.com/image.png" disabled={!!alienImageFile} />
                          </div>
                        </div>

                        {alienPreviewUrl && (
                          <div className="image-preview">
                            <img src={alienPreviewUrl} alt="Preview" />
                          </div>
                        )}

                        {/* Ultimate Form Image Upload Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Ultimate Form Image</label>
                            <div className="file-uploader" onClick={() => ultimateFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{ultimateFile ? ultimateFile.name : "Select Ultimate Image"}</span>
                              <input type="file" ref={ultimateFileInputRef} onChange={handleUltimateFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Paste Ultimate Form Image URL</label>
                            <input type="url" value={newAlien.ultimate_image_url || ""} onChange={(e) => setNewAlien({ ...newAlien, ultimate_image_url: e.target.value })} placeholder="https://example.com/ultimate.png" disabled={!!ultimateFile} />
                          </div>
                        </div>

                        {(ultimatePreviewUrl || newAlien.ultimate_image_url) && (
                          <div className="image-preview">
                            <img src={ultimatePreviewUrl || newAlien.ultimate_image_url} alt="Ultimate Preview" />
                          </div>
                        )}

                        {/* Gallery Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Upload Gallery Images</label>
                            <div className="file-uploader" onClick={() => galleryFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>Select files ({galleryFiles.length} selected)</span>
                              <input type="file" ref={galleryFileInputRef} onChange={handleGalleryFilesChange} accept="image/*" style={{ display: 'none' }} multiple />
                            </div>
                          </div>
                        </div>

                        {newGalleryPreviewUrls.length > 0 && (
                          <div className="gallery-previews-container">
                            <label style={{ fontSize: '11px', color: '#aaa' }}>Newly selected images:</label>
                            <div className="previews-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                              {newGalleryPreviewUrls.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                  <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0, 255, 0, 0.3)' }} />
                                  <button type="button" onClick={() => handleDeleteNewGalleryFile(idx)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '9px' }}>
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? "Adding DNA..." : "Assemble DNA"}
                        </button>
                      </form>
                    )}

                    {/* ALIEN EDIT FORM */}
                    {editingAlien && (
                      <form onSubmit={handleEditAlien} className="admin-form">
                        <div className="form-group">
                          <label>Alien Name *</label>
                          <input type="text" value={editingAlien.name} onChange={(e) => setEditingAlien({ ...editingAlien, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Alien Type</label>
                          <input type="text" value={editingAlien.type} onChange={(e) => setEditingAlien({ ...editingAlien, type: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Species</label>
                            <input type="text" value={editingAlien.species || ""} onChange={(e) => setEditingAlien({ ...editingAlien, species: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label>Planet</label>
                            <input type="text" value={editingAlien.planet || ""} onChange={(e) => setEditingAlien({ ...editingAlien, planet: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Abilities / Powers (comma separated)</label>
                          <input type="text" value={editingAlien.power || ""} onChange={(e) => setEditingAlien({ ...editingAlien, power: e.target.value })} />
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Order Index</label>
                            <input type="number" value={editingAlien.order_index || 0} onChange={(e) => setEditingAlien({ ...editingAlien, order_index: e.target.value })} min="0" />
                          </div>
                          <div className="form-group">
                            <label>Watch Category</label>
                            <select value={editingAlien.watch_type || "omnitrix"} onChange={(e) => setEditingAlien({ ...editingAlien, watch_type: e.target.value })}>
                              <option value="omnitrix">Omnitrix</option>
                              <option value="ultimatrix">Ultimatrix</option>
                              <option value="both">Both Watches</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <textarea value={editingAlien.description || ""} onChange={(e) => setEditingAlien({ ...editingAlien, description: e.target.value })} rows="3"></textarea>
                        </div>

                        {/* Image Upload/Url Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Change Image</label>
                            <div className="file-uploader" onClick={() => alienFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{alienImageFile ? alienImageFile.name : "Upload New File"}</span>
                              <input type="file" ref={alienFileInputRef} onChange={handleAlienFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Edit Image URL</label>
                            <input type="url" value={editingAlien.image_url || ""} onChange={(e) => setEditingAlien({ ...editingAlien, image_url: e.target.value })} placeholder="https://example.com/image.png" disabled={!!alienImageFile} />
                          </div>
                        </div>

                        {(alienPreviewUrl || editingAlien.image_url) && (
                          <div className="image-preview">
                            <img src={alienPreviewUrl || editingAlien.image_url} alt="Preview" />
                          </div>
                        )}

                        {/* Ultimate Form Image Upload Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Ultimate Form Image</label>
                            <div className="file-uploader" onClick={() => ultimateFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{ultimateFile ? ultimateFile.name : "Select Ultimate Image"}</span>
                              <input type="file" ref={ultimateFileInputRef} onChange={handleUltimateFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Edit Ultimate Form Image URL</label>
                            <input type="url" value={editingAlien.ultimate_image_url || ""} onChange={(e) => setEditingAlien({ ...editingAlien, ultimate_image_url: e.target.value })} placeholder="https://example.com/ultimate.png" disabled={!!ultimateFile} />
                          </div>
                        </div>

                        {(ultimatePreviewUrl || editingAlien.ultimate_image_url) && (
                          <div className="image-preview">
                            <img src={ultimatePreviewUrl || editingAlien.ultimate_image_url} alt="Ultimate Preview" />
                          </div>
                        )}

                        {/* Gallery Section */}
                        <div className="image-field-section">
                          {/* List existing gallery images */}
                          {editingAlien.gallery && editingAlien.gallery.length > 0 && (
                            <div className="gallery-previews-container">
                              <label style={{ fontSize: '11px', color: '#aaa' }}>Current gallery images:</label>
                              <div className="previews-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px', marginBottom: '12px' }}>
                                {editingAlien.gallery.map((url) => (
                                  <div key={url} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                    <img src={url} alt="Gallery image" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                    <button type="button" onClick={() => handleDeleteGalleryImage(url)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '9px' }}>
                                      <X size={10} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="form-group">
                            <label>Upload Gallery Images (Appends to existing)</label>
                            <div className="file-uploader" onClick={() => galleryFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>Select files ({galleryFiles.length} selected)</span>
                              <input type="file" ref={galleryFileInputRef} onChange={handleGalleryFilesChange} accept="image/*" style={{ display: 'none' }} multiple />
                            </div>
                          </div>
                        </div>

                        {newGalleryPreviewUrls.length > 0 && (
                          <div className="gallery-previews-container">
                            <label style={{ fontSize: '11px', color: '#aaa' }}>Newly selected images:</label>
                            <div className="previews-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                              {newGalleryPreviewUrls.map((url, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                  <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid rgba(0, 255, 0, 0.3)' }} />
                                  <button type="button" onClick={() => handleDeleteNewGalleryFile(idx)} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '9px' }}>
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? "Re-sequencing DNA..." : "Modify DNA"}
                        </button>
                      </form>
                    )}

                    {/* TRANSFORMATION ADD FORM */}
                    {isAdding && activeTab === "transformations" && (
                      <form onSubmit={handleAddTransformation} className="admin-form">
                        <div className="form-group">
                          <label>Alien Character *</label>
                          <select value={newTransformation.alien_id} onChange={(e) => setNewTransformation({ ...newTransformation, alien_id: e.target.value })} required>
                            <option value="">-- Choose Alien --</option>
                            {aliens.map((a) => (
                              <option key={a.id} value={a.id}>{a.name} ({a.watch_type})</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Form Title / Name</label>
                          <input type="text" value={newTransformation.name} onChange={(e) => setNewTransformation({ ...newTransformation, name: e.target.value })} placeholder="e.g. Mid-transformation, Ultimate Form" />
                        </div>
                        <div className="form-group">
                          <label>Form Description</label>
                          <textarea value={newTransformation.description} onChange={(e) => setNewTransformation({ ...newTransformation, description: e.target.value })} rows="3" placeholder="Description of this form..."></textarea>
                        </div>

                        {/* Image Upload/Url Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Image File *</label>
                            <div className="file-uploader" onClick={() => transFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{transImageFile ? transImageFile.name : "Select Image File"}</span>
                              <input type="file" ref={transFileInputRef} onChange={handleTransFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Paste Image URL</label>
                            <input type="url" value={newTransformation.image_url} onChange={(e) => setNewTransformation({ ...newTransformation, image_url: e.target.value })} placeholder="https://example.com/image.png" disabled={!!transImageFile} />
                          </div>
                        </div>

                        {transPreviewUrl && (
                          <div className="image-preview">
                            <img src={transPreviewUrl} alt="Preview" />
                          </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? "Adding Form..." : "Inject DNA Form"}
                        </button>
                      </form>
                    )}

                    {/* TRANSFORMATION EDIT FORM */}
                    {editingTransformation && (
                      <form onSubmit={handleEditTransformation} className="admin-form">
                        <div className="form-group">
                          <label>Alien Character *</label>
                          <select value={editingTransformation.alien_id} onChange={(e) => setEditingTransformation({ ...editingTransformation, alien_id: e.target.value })} required>
                            {aliens.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Form Title / Name</label>
                          <input type="text" value={editingTransformation.name || ""} onChange={(e) => setEditingTransformation({ ...editingTransformation, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label>Form Description</label>
                          <textarea value={editingTransformation.description || ""} onChange={(e) => setEditingTransformation({ ...editingTransformation, description: e.target.value })} rows="3"></textarea>
                        </div>

                        {/* Image Upload/Url Section */}
                        <div className="image-field-section">
                          <div className="form-group">
                            <label>Change Image</label>
                            <div className="file-uploader" onClick={() => transFileInputRef.current.click()}>
                              <Upload size={18} />
                              <span>{transImageFile ? transImageFile.name : "Upload New File"}</span>
                              <input type="file" ref={transFileInputRef} onChange={handleTransFileChange} accept="image/*" style={{ display: 'none' }} />
                            </div>
                          </div>
                          <div className="form-divider">OR</div>
                          <div className="form-group">
                            <label>Edit Image URL</label>
                            <input type="url" value={editingTransformation.image_url || ""} onChange={(e) => setEditingTransformation({ ...editingTransformation, image_url: e.target.value })} placeholder="https://example.com/image.png" disabled={!!transImageFile} />
                          </div>
                        </div>

                        {(transPreviewUrl || editingTransformation.image_url) && (
                          <div className="image-preview">
                            <img src={transPreviewUrl || editingTransformation.image_url} alt="Preview" />
                          </div>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                          {loading ? "Updating Form..." : "Apply DNA Modifications"}
                        </button>
                      </form>
                    )}

                  </motion.div>
                ) : (
                  <motion.div 
                    key="form-empty"
                    className="sidebar-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="empty-panel-glow" />
                    <Sparkles size={40} className="glow-icon" />
                    <h4>DNA Control Center</h4>
                    <p>Select any card from the grid to modify its DNA parameters, or assemble a brand new alien form.</p>
                    <button className="sidebar-add-btn" onClick={() => setIsAdding(true)}>
                      <Plus size={16} />
                      <span>Create New Entry</span>
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </aside>
          )}

        </div>

      </div>
    </div>
  );
}
