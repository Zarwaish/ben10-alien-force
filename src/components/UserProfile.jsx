import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { storageService } from '../services/storageService';
import { User, Mail, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function UserProfile() {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || '',
  });
  
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await storageService.uploadImage(file, 'avatars');
      await updateProfile({ avatar_url: url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="profile-container"
    >
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-wrapper">
            <div className="avatar-main">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">{profile?.username?.[0]?.toUpperCase()}</div>
              )}
              {uploading && (
                <div className="avatar-overlay">
                  <Loader2 className="spin" size={24} />
                </div>
              )}
            </div>
            <button className="change-avatar-btn" onClick={() => fileInputRef.current.click()} disabled={uploading}>
              <Camera size={16} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              onChange={handleAvatarUpload} 
              accept="image/*" 
            />
          </div>
          <h2>AGENT <span>PROFILE</span></h2>
          <div className="role-badge">
            <Shield size={12} />
            {profile?.role?.toUpperCase()} CLEARANCE
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>CODENAME</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter username..."
              />
            </div>
          </div>

          <div className="form-group">
            <label>IDENTIFICATION (EMAIL)</label>
            <div className="input-wrapper disabled">
              <Mail size={18} className="input-icon" />
              <input type="email" value={profile?.email || ''} disabled />
            </div>
          </div>

          <div className="form-group">
            <label>BIOGRAPHICAL DATA</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              placeholder="Tell us about your mission..."
              rows="4"
            />
          </div>

          <button type="submit" className="omnitrix-btn" disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
            {loading ? 'SAVING...' : 'UPDATE ARCHIVE'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default UserProfile;
