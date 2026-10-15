import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getStats,
  getHostApplications,
  updateHostApplicationStatus,
  getBookings,
  getLocations,
  createLocation,
  updateLocation,
  updateLocationStatus,
  deleteLocation,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadPhoto,
} from '../lib/api';

export default function AdminPortalPage() {
  const { user, isAdmin, showToast, refreshKey, triggerRefresh } = useAuth();

  // Tab State: 'locations' (default) | 'categories' | 'applications' | 'bookings' | 'stats'
  const [activeTab, setActiveTab] = useState('locations');
  const [loading, setLoading] = useState(false);

  // Data Stores
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState(null);

  // Locations Filter
  const [locStatusFilter, setLocStatusFilter] = useState('all');
  const [locSearch, setLocSearch] = useState('');

  // Location Form Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [locFormData, setLocFormData] = useState({
    name: '',
    slug: '',
    district: 'Kullu',
    valley: 'Tirthan Valley',
    village: '',
    category: 'viewpoints',
    description: '',
    latitude: '',
    longitude: '',
    cover_image: '',
    gallery: [],
    best_time: '',
    difficulty: '',
    safety_notes: '',
    tags: '',
    status: 'draft',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // New Image Input inside Location Modal
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageCredit, setNewImageCredit] = useState('');
  const fileInputRef = useRef(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [catFormData, setCatFormData] = useState({
    id: '',
    name: '',
    icon: '🏔️',
    description: '',
    is_active: true,
  });
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Application Processing State
  const [processingAppId, setProcessingAppId] = useState(null);

  // Fetch all admin data
  const loadAdminData = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([
      getLocations({ status: 'all', with_drafts: true }).catch(() => []),
      getCategories({ all: true }).catch(() => []),
      getHostApplications().catch(() => []),
      getBookings().catch(() => []),
      getStats().catch(() => null),
    ])
      .then(([locs, cats, apps, bks, st]) => {
        setLocations(Array.isArray(locs) ? locs : []);
        setCategories(Array.isArray(cats) ? cats : []);
        setApplications(Array.isArray(apps) ? apps : []);
        setAllBookings(Array.isArray(bks) ? bks : []);
        setStats(st);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData, refreshKey]);

  // Handle Slug generation helper
  const handleNameChange = (val) => {
    const cleanName = val;
    setLocFormData((prev) => {
      const autoSlug = !editingLocationId
        ? cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        : prev.slug;
      return { ...prev, name: cleanName, slug: autoSlug };
    });
  };

  // Open Location Modal for Create or Edit
  const handleOpenCreateLocation = () => {
    setEditingLocationId(null);
    setLocFormData({
      name: '',
      slug: '',
      district: 'Kullu',
      valley: 'Tirthan Valley',
      village: '',
      category: categories[0]?.id || 'viewpoints',
      description: '',
      latitude: '',
      longitude: '',
      cover_image: '',
      gallery: [],
      best_time: 'March to November',
      difficulty: 'Easy',
      safety_notes: '',
      tags: '',
      status: 'draft',
    });
    setFormErrors({});
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc) => {
    setEditingLocationId(loc.id);
    setLocFormData({
      name: loc.name || '',
      slug: loc.slug || '',
      district: loc.district || 'Kullu',
      valley: loc.valley || '',
      village: loc.village || '',
      category: loc.category || categories[0]?.id || 'viewpoints',
      description: loc.description || '',
      latitude: loc.latitude != null ? String(loc.latitude) : '',
      longitude: loc.longitude != null ? String(loc.longitude) : '',
      cover_image: loc.cover_image || '',
      gallery: Array.isArray(loc.gallery) ? [...loc.gallery] : [],
      best_time: loc.best_time || '',
      difficulty: loc.difficulty || '',
      safety_notes: loc.safety_notes || '',
      tags: Array.isArray(loc.tags) ? loc.tags.join(', ') : '',
      status: loc.status || 'draft',
    });
    setFormErrors({});
    setIsLocationModalOpen(true);
  };

  // Gallery Management Helpers
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) {
      showToast('Please enter an image URL', 'error');
      return;
    }
    const newImg = {
      id: `img-${Date.now()}`,
      url: newImageUrl.trim(),
      caption: newImageCaption.trim() || undefined,
      credit: newImageCredit.trim() || undefined,
    };
    setLocFormData((prev) => {
      const nextGallery = [...prev.gallery, newImg];
      const nextCover = prev.cover_image || newImg.url;
      return { ...prev, gallery: nextGallery, cover_image: nextCover };
    });
    setNewImageUrl('');
    setNewImageCaption('');
    setNewImageCredit('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB limit', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const res = await uploadPhoto({
            data: base64Data,
            filename: file.name,
          });
          const uploadedUrl = res.url;
          const newImg = {
            id: `img-${Date.now()}`,
            url: uploadedUrl,
            caption: file.name.replace(/\.[^/.]+$/, ''),
            credit: 'Pahadíly Verified Asset',
          };
          setLocFormData((prev) => {
            const nextGallery = [...prev.gallery, newImg];
            const nextCover = prev.cover_image || uploadedUrl;
            return { ...prev, gallery: nextGallery, cover_image: nextCover };
          });
          showToast('Image uploaded and saved persistently!');
        } catch (err) {
          showToast(err.message || 'Upload failed', 'error');
        } finally {
          setIsUploadingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploadingPhoto(false);
      showToast('Could not process image file', 'error');
    }
  };

  const handleSetCoverImage = (url) => {
    setLocFormData((prev) => ({ ...prev, cover_image: url }));
  };

  const handleRemoveGalleryImage = (imgId) => {
    setLocFormData((prev) => {
      const nextGallery = prev.gallery.filter((g) => g.id !== imgId);
      let nextCover = prev.cover_image;
      if (prev.cover_image && !nextGallery.some((g) => g.url === prev.cover_image)) {
        nextCover = nextGallery[0]?.url || '';
      }
      return { ...prev, gallery: nextGallery, cover_image: nextCover };
    });
  };

  const handleMoveImage = (index, direction) => {
    setLocFormData((prev) => {
      const list = [...prev.gallery];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return { ...prev, gallery: list };
    });
  };

  // Location Form Submission & Validation
  const validateLocationForm = () => {
    const errors = {};
    if (!locFormData.name.trim()) errors.name = 'Location name is required.';
    if (!locFormData.slug.trim()) errors.slug = 'Valid slug identifier is required.';
    if (!locFormData.district.trim()) errors.district = 'District is required.';
    if (!locFormData.valley.trim()) errors.valley = 'Valley or region is required.';

    if (locFormData.latitude !== '') {
      const lat = Number(locFormData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be a number between -90 and 90.';
      }
    }
    if (locFormData.longitude !== '') {
      const lon = Number(locFormData.longitude);
      if (isNaN(lon) || lon < -180 || lon > 180) {
        errors.longitude = 'Longitude must be a number between -180 and 180.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLocation = async (publishStatusOverride) => {
    if (!validateLocationForm()) {
      showToast('Please fix the form errors before saving.', 'error');
      return;
    }

    setIsSavingLocation(true);
    const finalStatus = publishStatusOverride || locFormData.status || 'draft';

    const payload = {
      name: locFormData.name.trim(),
      slug: locFormData.slug.trim(),
      district: locFormData.district.trim(),
      valley: locFormData.valley.trim(),
      village: locFormData.village.trim() || undefined,
      category: locFormData.category,
      description: locFormData.description.trim(),
      latitude: locFormData.latitude !== '' ? Number(locFormData.latitude) : null,
      longitude: locFormData.longitude !== '' ? Number(locFormData.longitude) : null,
      cover_image: locFormData.cover_image.trim(),
      gallery: locFormData.gallery,
      best_time: locFormData.best_time.trim() || undefined,
      difficulty: locFormData.difficulty.trim() || undefined,
      safety_notes: locFormData.safety_notes.trim() || undefined,
      tags: locFormData.tags
        ? locFormData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      status: finalStatus,
    };

    try {
      if (editingLocationId) {
        await updateLocation(editingLocationId, payload);
        showToast(`Location "${payload.name}" updated successfully!`);
      } else {
        await createLocation(payload);
        showToast(`Location "${payload.name}" created (${finalStatus})!`);
      }
      setIsLocationModalOpen(false);
      loadAdminData();
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save location', 'error');
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleQuickStatusChange = async (locId, newStatus) => {
    try {
      await updateLocationStatus(locId, newStatus);
      showToast(`Location status changed to "${newStatus}"`);
      setLocations((prev) =>
        prev.map((l) => (l.id === locId ? { ...l, status: newStatus } : l))
      );
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleDeleteLocation = async (locId, locName) => {
    if (!window.confirm(`Are you sure you want to delete "${locName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteLocation(locId);
      showToast(`Location "${locName}" deleted.`);
      setLocations((prev) => prev.filter((l) => l.id !== locId));
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete location', 'error');
    }
  };

  // Category Modal Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategoryId(null);
    setCatFormData({
      id: '',
      name: '',
      icon: '🏔️',
      description: '',
      is_active: true,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCatFormData({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '🏔️',
      description: cat.description || '',
      is_active: cat.is_active,
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catFormData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }
    setIsSavingCategory(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, {
          name: catFormData.name.trim(),
          icon: catFormData.icon.trim(),
          description: catFormData.description.trim(),
          is_active: catFormData.is_active,
        });
        showToast('Category updated!');
      } else {
        await createCategory({
          name: catFormData.name.trim(),
          icon: catFormData.icon.trim(),
          description: catFormData.description.trim(),
        });
        showToast('Category created!');
      }
      setIsCategoryModalOpen(false);
      loadAdminData();
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm(`Delete or deactivate category "${catId}"?`)) return;
    try {
      const res = await deleteCategory(catId);
      showToast(res.message || 'Category deleted');
      loadAdminData();
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  // Host Application Approval / Rejection
  const handleApproveApp = async (appId) => {
    setProcessingAppId(appId);
    try {
      await updateHostApplicationStatus(appId, {
        status_val: 'approved',
        admin_notes: 'Verified local credentials. Approved and published to marketplace.',
      });
      showToast('Host application approved!');
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'approved' } : a))
      );
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to approve application', 'error');
    } finally {
      setProcessingAppId(null);
    }
  };

  const handleRejectApp = async (appId) => {
    const reason = window.prompt('Enter reason for declining application:');
    if (reason === null) return;
    setProcessingAppId(appId);
    try {
      await updateHostApplicationStatus(appId, {
        status_val: 'rejected',
        admin_notes: reason || 'Application did not meet local verification criteria.',
      });
      showToast('Application declined.', 'info');
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: 'rejected' } : a))
      );
      triggerRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setProcessingAppId(null);
    }
  };

  // Filtered Locations List
  const filteredLocations = locations.filter((loc) => {
    if (locStatusFilter !== 'all' && loc.status !== locStatusFilter) return false;
    if (locSearch.trim()) {
      const q = locSearch.toLowerCase().trim();
      const match =
        loc.name.toLowerCase().includes(q) ||
        loc.district.toLowerCase().includes(q) ||
        loc.valley.toLowerCase().includes(q) ||
        (loc.village && loc.village.toLowerCase().includes(q)) ||
        loc.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  if (!user || !isAdmin) {
    return (
      <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', padding: '60px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '36px', textAlign: 'center', border: '1px solid rgba(16, 37, 29, 0.1)', boxShadow: '0 8px 30px rgba(16, 37, 29, 0.06)' }}>
          <div style={{ fontSize: '42px', marginBottom: '14px' }}>🏔️</div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', marginBottom: '10px' }}>
            Administrator Access Required
          </h2>
          <p style={{ fontSize: '14.5px', color: '#536B5E', lineHeight: 1.55, marginBottom: '24px' }}>
            The Pahadíly Operations Console is restricted to authorized platform administrators. Please sign in with an administrator account.
          </p>
          <a href="/" style={{ padding: '10px 22px', borderRadius: '9999px', backgroundColor: '#174D39', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}>
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F7F5EE', minHeight: 'calc(100vh - 76px)', paddingBottom: '80px' }}>
      {/* Header Banner */}
      <section style={{ backgroundColor: '#10251D', color: '#F7F5EE', padding: '48px 0 32px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#8EE49A', fontWeight: 700 }}>
                Governance & Directory Management
              </span>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '32px', color: '#FFFFFF', margin: '4px 0 8px 0' }}>
                Pahadíly Operations Console
              </h1>
              <p style={{ fontSize: '14.5px', color: 'rgba(247, 245, 238, 0.8)', margin: 0 }}>
                Source of Truth: Manage verified locations, genuine photograph galleries, categories, and provider vetting.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleOpenCreateLocation}
                style={{
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#8EE49A',
                  color: '#10251D',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>➕ Add Location</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', padding: '12px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {[
            { id: 'locations', label: `Locations Directory (${locations.length})` },
            { id: 'categories', label: `Categories (${categories.length})` },
            { id: 'applications', label: `Host Review (${applications.filter((a) => a.status === 'pending').length} Pending)` },
            { id: 'bookings', label: `Bookings (${allBookings.length})` },
            { id: 'stats', label: 'Platform Stats' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? '#174D39' : 'transparent',
                  color: active ? '#FFFFFF' : '#10251D',
                  border: active ? '1px solid #174D39' : '1px solid rgba(16, 37, 29, 0.12)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Tab Content */}
      <div style={{ maxWidth: '1280px', margin: '32px auto 0 auto', padding: '0 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#536B5E' }}>
            Loading platform records...
          </div>
        )}

        {/* 1. LOCATIONS DIRECTORY TAB */}
        {!loading && activeTab === 'locations' && (
          <div>
            {/* Header + Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', margin: '0 0 4px 0' }}>
                  Admin-Controlled Locations Directory
                </h3>
                <p style={{ fontSize: '13.5px', color: '#536B5E', margin: 0 }}>
                  Published locations appear on the public Homepage, Explore Directory, and Slideshows.
                </p>
              </div>

              {/* Status and Search Controls */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Filter locations..."
                  value={locSearch}
                  onChange={(e) => setLocSearch(e.target.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(16, 37, 29, 0.15)',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                />
                <select
                  value={locStatusFilter}
                  onChange={(e) => setLocStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(16, 37, 29, 0.15)',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Locations List / Table */}
            {filteredLocations.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏔️</div>
                <h4 style={{ fontSize: '18px', color: '#10251D', marginBottom: '6px' }}>No locations found</h4>
                <p style={{ fontSize: '13.5px', color: '#536B5E', marginBottom: '16px' }}>
                  Click "Add Location" to create the first genuine verified place with photographs and coordinates.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateLocation}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add Location
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {filteredLocations.map((loc) => {
                  const coverImg = loc.cover_image || loc.gallery?.[0]?.url || '';
                  return (
                    <div
                      key={loc.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1px solid rgba(16, 37, 29, 0.08)',
                        boxShadow: '0 2px 8px rgba(16, 37, 29, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ position: 'relative', height: '170px', backgroundColor: '#EBE7DE' }}>
                        {coverImg ? (
                          <img src={coverImg} alt={loc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#88988E', fontSize: '13px' }}>
                            📷 No Cover Image
                          </div>
                        )}
                        <span
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            textTransform: 'uppercase',
                            backgroundColor:
                              loc.status === 'published'
                                ? 'rgba(32, 85, 64, 0.9)'
                                : loc.status === 'draft'
                                ? 'rgba(180, 83, 9, 0.9)'
                                : 'rgba(107, 114, 128, 0.9)',
                            color: '#FFFFFF',
                          }}
                        >
                          {loc.status}
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          🖼️ {(loc.gallery?.length || 0) + (loc.cover_image ? 1 : 0)} photos
                        </span>
                      </div>

                      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11.5px', textTransform: 'uppercase', color: '#174D39', fontWeight: 700 }}>
                            {loc.district} • {loc.valley}
                          </span>
                          <span style={{ fontSize: '11px', color: '#688575', textTransform: 'capitalize' }}>
                            {loc.category?.replace(/-/g, ' ')}
                          </span>
                        </div>

                        <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '19px', color: '#10251D', margin: '0 0 6px 0' }}>
                          {loc.name}
                        </h4>

                        <div style={{ fontSize: '12px', color: '#536B5E', marginBottom: '12px' }}>
                          Slug: <code>{loc.slug}</code> {loc.village ? `• Village: ${loc.village}` : ''}
                        </div>

                        {loc.latitude != null && loc.longitude != null && (
                          <div style={{ fontSize: '11.5px', color: '#2b3f35', backgroundColor: '#FAF8F2', padding: '6px 10px', borderRadius: '6px', marginBottom: '14px' }}>
                            📍 Lat: {loc.latitude.toFixed(4)}, Lon: {loc.longitude.toFixed(4)}
                          </div>
                        )}

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(16, 37, 29, 0.08)' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLocation(loc)}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(16, 37, 29, 0.2)',
                              backgroundColor: '#FAF8F2',
                              fontSize: '12.5px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            ✏️ Edit
                          </button>

                          {loc.status !== 'published' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(loc.id, 'published')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#174D39',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(loc.id, 'draft')}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #fde68a',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Unpublish
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteLocation(loc.id, loc.name)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: '1px solid rgba(220, 38, 38, 0.2)',
                              backgroundColor: '#fff1f2',
                              color: '#be123c',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                            title="Delete location"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. CATEGORIES MANAGEMENT TAB */}
        {!loading && activeTab === 'categories' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', margin: '0 0 4px 0' }}>
                  Admin-Controlled Categories
                </h3>
                <p style={{ fontSize: '13.5px', color: '#536B5E', margin: 0 }}>
                  Create, rename, or deactivate categories assigned to genuine locations.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateCategory}
                style={{
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  backgroundColor: '#174D39',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ➕ Add Category
              </button>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', color: '#536B5E' }}>
                    <th style={{ padding: '12px 18px' }}>Icon</th>
                    <th style={{ padding: '12px 18px' }}>Name</th>
                    <th style={{ padding: '12px 18px' }}>Identifier / Slug</th>
                    <th style={{ padding: '12px 18px' }}>Description</th>
                    <th style={{ padding: '12px 18px' }}>Status</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid rgba(16, 37, 29, 0.05)' }}>
                      <td style={{ padding: '12px 18px', fontSize: '20px' }}>{cat.icon || '🏔️'}</td>
                      <td style={{ padding: '12px 18px', fontWeight: 600, color: '#10251D' }}>{cat.name}</td>
                      <td style={{ padding: '12px 18px', color: '#536B5E' }}><code>{cat.id}</code></td>
                      <td style={{ padding: '12px 18px', color: '#536B5E', maxWidth: '320px' }}>{cat.description || '—'}</td>
                      <td style={{ padding: '12px 18px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: cat.is_active ? '#ecfdf5' : '#f3f4f6',
                            color: cat.is_active ? '#065f46' : '#6b7280',
                          }}
                        >
                          {cat.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(16, 37, 29, 0.2)',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginRight: '6px',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            backgroundColor: '#fff1f2',
                            color: '#be123c',
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. HOST APPLICATIONS TAB */}
        {!loading && activeTab === 'applications' && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', marginBottom: '20px' }}>
              Host & Companion Review Queue
            </h3>
            {applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#536B5E' }}>
                No host applications on file.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
                {applications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '24px',
                      border: '1px solid rgba(16, 37, 29, 0.08)',
                      boxShadow: '0 2px 8px rgba(16, 37, 29, 0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#536B5E', fontWeight: 600 }}>
                        App #{app.id} • {app.region?.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor:
                            app.status === 'approved'
                              ? 'rgba(32, 85, 64, 0.15)'
                              : app.status === 'rejected'
                              ? 'rgba(200, 109, 81, 0.15)'
                              : 'rgba(240, 160, 80, 0.15)',
                          color:
                            app.status === 'approved'
                              ? '#174D39'
                              : app.status === 'rejected'
                              ? '#be123c'
                              : '#b45309',
                        }}
                      >
                        {app.status?.toUpperCase()}
                      </span>
                    </div>

                    <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#10251D', margin: '0 0 4px 0' }}>
                      {app.name}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#174D39', fontWeight: 600, marginBottom: '8px' }}>
                      {app.skill} • {app.property_name || 'Individual Guide'}
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#536B5E', lineHeight: 1.4, marginBottom: '14px' }}>
                      {app.bio || app.description || 'No extended bio provided.'}
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#688575', marginBottom: '16px' }}>
                      Contact: {app.phone || '—'} | {app.email || '—'}
                    </div>

                    {app.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleApproveApp(app.id)}
                          disabled={processingAppId === app.id}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '9999px',
                            backgroundColor: '#174D39',
                            color: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Approve & Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectApp(app.id)}
                          disabled={processingAppId === app.id}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '9999px',
                            backgroundColor: '#fff1f2',
                            color: '#be123c',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. BOOKINGS TAB */}
        {!loading && activeTab === 'bookings' && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px', color: '#10251D', marginBottom: '20px' }}>
              Real Platform Reservations ({allBookings.length})
            </h3>
            {allBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '16px', color: '#536B5E' }}>
                No active bookings recorded.
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAF8F2', borderBottom: '1px solid rgba(16, 37, 29, 0.08)', color: '#536B5E' }}>
                      <th style={{ padding: '12px 16px' }}>ID</th>
                      <th style={{ padding: '12px 16px' }}>Traveler</th>
                      <th style={{ padding: '12px 16px' }}>Destination / Item</th>
                      <th style={{ padding: '12px 16px' }}>Travel Date</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allBookings.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(16, 37, 29, 0.05)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{b.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <strong>{b.traveler_name}</strong>
                          <div style={{ fontSize: '11px', color: '#688575' }}>{b.traveler_email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>{b.item_title}</td>
                        <td style={{ padding: '12px 16px' }}>{b.travel_date} ({b.time_slot || 'full_day'})</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: b.status === 'confirmed' ? '#ecfdf5' : '#fffbeb',
                              color: b.status === 'confirmed' ? '#065f46' : '#92400e',
                            }}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.total_price || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. STATS TAB */}
        {!loading && activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Locations (Source of Truth)</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#174D39', marginTop: '6px' }}>{locations.length}</div>
              <div style={{ fontSize: '12px', color: '#688575', marginTop: '4px' }}>
                {locations.filter((l) => l.status === 'published').length} published
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Admin Categories</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#174D39', marginTop: '6px' }}>{categories.length}</div>
              <div style={{ fontSize: '12px', color: '#688575', marginTop: '4px' }}>
                {categories.filter((c) => c.is_active).length} active
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Host Applications</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#174D39', marginTop: '6px' }}>{applications.length}</div>
              <div style={{ fontSize: '12px', color: '#688575', marginTop: '4px' }}>
                {applications.filter((a) => a.status === 'pending').length} pending review
              </div>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
              <div style={{ fontSize: '12px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Real Bookings</div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#174D39', marginTop: '6px' }}>{allBookings.length}</div>
              <div style={{ fontSize: '12px', color: '#688575', marginTop: '4px' }}>Total verified user requests</div>
            </div>
            {stats && (
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid rgba(16, 37, 29, 0.08)' }}>
                <div style={{ fontSize: '12px', color: '#536B5E', textTransform: 'uppercase', fontWeight: 700 }}>Storage Mode</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#174D39', marginTop: '6px' }}>{stats.active_storage || 'local_json'}</div>
                <div style={{ fontSize: '12px', color: '#688575', marginTop: '4px' }}>Dual-mode engine online</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- LOCATION ADD / EDIT MODAL --- */}
      {isLocationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(10, 37, 27, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#10251D', margin: 0 }}>
                {editingLocationId ? 'Edit Location' : 'Add New Location (Source of Truth)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#536B5E' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveLocation();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
            >
              {/* Row 1: Name and Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={locFormData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Great Himalayan National Park Gate"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: formErrors.name ? '1px solid #dc2626' : '1px solid rgba(16, 37, 29, 0.2)',
                      fontSize: '13.5px',
                    }}
                  />
                  {formErrors.name && <span style={{ fontSize: '11px', color: '#dc2626' }}>{formErrors.name}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Slug / Unique ID *
                  </label>
                  <input
                    type="text"
                    value={locFormData.slug}
                    onChange={(e) => setLocFormData({ ...locFormData, slug: e.target.value })}
                    placeholder="e.g. ghnp-gate"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: formErrors.slug ? '1px solid #dc2626' : '1px solid rgba(16, 37, 29, 0.2)',
                      fontSize: '13.5px',
                    }}
                  />
                  {formErrors.slug && <span style={{ fontSize: '11px', color: '#dc2626' }}>{formErrors.slug}</span>}
                </div>
              </div>

              {/* Row 2: District, Valley, Village */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    value={locFormData.district}
                    onChange={(e) => setLocFormData({ ...locFormData, district: e.target.value })}
                    placeholder="e.g. Kullu"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Valley or Region *
                  </label>
                  <input
                    type="text"
                    value={locFormData.valley}
                    onChange={(e) => setLocFormData({ ...locFormData, valley: e.target.value })}
                    placeholder="e.g. Tirthan Valley"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Village / Settlement
                  </label>
                  <input
                    type="text"
                    value={locFormData.village}
                    onChange={(e) => setLocFormData({ ...locFormData, village: e.target.value })}
                    placeholder="e.g. Gushaini"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              {/* Row 3: Category and Publication Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Admin Category *
                  </label>
                  <select
                    value={locFormData.category}
                    onChange={(e) => setLocFormData({ ...locFormData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px', backgroundColor: '#FFFFFF' }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon || '🏔️'} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Publication Status
                  </label>
                  <select
                    value={locFormData.status}
                    onChange={(e) => setLocFormData({ ...locFormData, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="draft">Draft (Private to Admin)</option>
                    <option value="published">Published (Live on Website & Map)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Geographic Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Latitude (-90 to 90)
                  </label>
                  <input
                    type="text"
                    value={locFormData.latitude}
                    onChange={(e) => setLocFormData({ ...locFormData, latitude: e.target.value })}
                    placeholder="e.g. 31.6390"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: formErrors.latitude ? '1px solid #dc2626' : '1px solid rgba(16, 37, 29, 0.2)',
                      fontSize: '13.5px',
                    }}
                  />
                  {formErrors.latitude && <span style={{ fontSize: '11px', color: '#dc2626' }}>{formErrors.latitude}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Longitude (-180 to 180)
                  </label>
                  <input
                    type="text"
                    value={locFormData.longitude}
                    onChange={(e) => setLocFormData({ ...locFormData, longitude: e.target.value })}
                    placeholder="e.g. 77.3845"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: formErrors.longitude ? '1px solid #dc2626' : '1px solid rgba(16, 37, 29, 0.2)',
                      fontSize: '13.5px',
                    }}
                  />
                  {formErrors.longitude && <span style={{ fontSize: '11px', color: '#dc2626' }}>{formErrors.longitude}</span>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Factual Description & Field Notes
                </label>
                <textarea
                  rows={3}
                  value={locFormData.description}
                  onChange={(e) => setLocFormData({ ...locFormData, description: e.target.value })}
                  placeholder="Factual, genuine travel overview. Document the cultural or ecological context without exaggeration."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px', resize: 'vertical' }}
                />
              </div>

              {/* Travel Info: Best Time, Difficulty, Safety Advisory */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={locFormData.best_time}
                    onChange={(e) => setLocFormData({ ...locFormData, best_time: e.target.value })}
                    placeholder="e.g. April to November"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                    Difficulty Level (if applicable)
                  </label>
                  <input
                    type="text"
                    value={locFormData.difficulty}
                    onChange={(e) => setLocFormData({ ...locFormData, difficulty: e.target.value })}
                    placeholder="e.g. Easy / Moderate / Alpine"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Safety & Access Advisory (Verified warnings or winter pass closures)
                </label>
                <input
                  type="text"
                  value={locFormData.safety_notes}
                  onChange={(e) => setLocFormData({ ...locFormData, safety_notes: e.target.value })}
                  placeholder="e.g. Jalori pass closes during heavy snowfall; carry warm layers."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={locFormData.tags}
                  onChange={(e) => setLocFormData({ ...locFormData, tags: e.target.value })}
                  placeholder="e.g. Trout Streams, UNESCO GHNP, Cedar Forests"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                />
              </div>

              {/* IMAGE GALLERY & COVER IMAGE MANAGER */}
              <div style={{ borderTop: '1px solid rgba(16, 37, 29, 0.1)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#10251D' }}>
                    Genuine Image Gallery & Cover Image
                  </label>
                  <span style={{ fontSize: '12px', color: '#536B5E' }}>
                    {locFormData.gallery.length} images added
                  </span>
                </div>

                {/* File Upload & URL Inputs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="admin-photo-file-upload"
                  />
                  <label
                    htmlFor="admin-photo-file-upload"
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#FAF8F2',
                      border: '1px solid rgba(16, 37, 29, 0.2)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>📁 Upload Image File</span>
                    {isUploadingPhoto && <span style={{ fontSize: '11px', color: '#b45309' }}>Uploading...</span>}
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="Or enter direct Image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '12.5px' }}
                  />
                  <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '12.5px' }}
                  />
                  <input
                    type="text"
                    placeholder="Credit / License (optional)"
                    value={newImageCredit}
                    onChange={(e) => setNewImageCredit(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '12.5px' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#174D39',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Add
                  </button>
                </div>

                {/* Gallery List with Reordering & Set Cover */}
                {locFormData.gallery.length === 0 ? (
                  <div style={{ padding: '16px', backgroundColor: '#FAF8F2', borderRadius: '8px', fontSize: '12.5px', color: '#536B5E', textAlign: 'center' }}>
                    No photos added yet. Upload genuine photographs or paste valid image links.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {locFormData.gallery.map((img, idx) => {
                      const isCover = locFormData.cover_image === img.url;
                      return (
                        <div
                          key={img.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '8px 12px',
                            backgroundColor: '#FAF8F2',
                            borderRadius: '8px',
                            border: isCover ? '2px solid #174D39' : '1px solid rgba(16, 37, 29, 0.08)',
                          }}
                        >
                          <img src={img.url} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ flex: 1, minWidth: 0, fontSize: '12px' }}>
                            <div style={{ fontWeight: 600, color: '#10251D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {img.caption || img.url}
                            </div>
                            {img.credit && <div style={{ color: '#536B5E' }}>Credit: {img.credit}</div>}
                          </div>

                          {/* Reorder Buttons */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, -1)}
                              disabled={idx === 0}
                              style={{ padding: '2px 6px', fontSize: '11px', cursor: idx === 0 ? 'default' : 'pointer' }}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 1)}
                              disabled={idx === locFormData.gallery.length - 1}
                              style={{ padding: '2px 6px', fontSize: '11px', cursor: idx === locFormData.gallery.length - 1 ? 'default' : 'pointer' }}
                            >
                              ↓
                            </button>
                          </div>

                          {/* Cover Image Selector */}
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(img.url)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: isCover ? '#174D39' : '#FFFFFF',
                              color: isCover ? '#FFFFFF' : '#174D39',
                              border: '1px solid #174D39',
                              cursor: 'pointer',
                            }}
                          >
                            {isCover ? '✓ Cover' : 'Set Cover'}
                          </button>

                          {/* Remove Image */}
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(img.id)}
                            style={{ background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontSize: '14px' }}
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(16, 37, 29, 0.1)' }}>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF8F2',
                    border: '1px solid rgba(16, 37, 29, 0.2)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingLocation}
                  onClick={() => handleSaveLocation('draft')}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: '1px solid #fde68a',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSavingLocation ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  disabled={isSavingLocation}
                  onClick={() => handleSaveLocation('published')}
                  style={{
                    padding: '9px 22px',
                    borderRadius: '8px',
                    backgroundColor: '#174D39',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isSavingLocation ? 'Saving...' : 'Publish Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CATEGORY ADD / EDIT MODAL --- */}
      {isCategoryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            backgroundColor: 'rgba(10, 37, 27, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#10251D', margin: 0 }}>
                {editingCategoryId ? 'Edit Category' : 'Create Admin Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#536B5E' }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCategory();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={catFormData.name}
                  onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                  placeholder="e.g. Waterfalls, Meadows, Temples"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Icon Emoji
                </label>
                <input
                  type="text"
                  value={catFormData.icon}
                  onChange={(e) => setCatFormData({ ...catFormData, icon: e.target.value })}
                  placeholder="🏔️, 🌊, 🥾, 🌿, ⛩️"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#10251D', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={catFormData.description}
                  onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                  placeholder="Brief factual explanation of places falling into this category."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13.5px' }}
                />
              </div>

              {editingCategoryId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="cat-active-checkbox"
                    checked={catFormData.is_active}
                    onChange={(e) => setCatFormData({ ...catFormData, is_active: e.target.checked })}
                  />
                  <label htmlFor="cat-active-checkbox" style={{ fontSize: '13px', fontWeight: 600, color: '#10251D' }}>
                    Active (visible in public category filter)
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#FAF8F2', border: '1px solid rgba(16, 37, 29, 0.2)', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: '#174D39', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700 }}
                >
                  {isSavingCategory ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
