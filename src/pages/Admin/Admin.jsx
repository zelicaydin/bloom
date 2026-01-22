import { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useProducts } from '../../store/ProductsContext';
import { addCoupon, getUserCoupons } from '../../services/database';

const Admin = ({ navigate }) => {
  const { user } = useAuth();
  const { products: productsList, addProduct, updateProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'products'
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // Local state for editing
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    brand: '',
    type: '',
    description: '',
    image: '',
    markers: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  // Coupon state
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  const [couponDiscountType, setCouponDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [couponExpiresAt, setCouponExpiresAt] = useState('');
  const [userCoupons, setUserCoupons] = useState([]);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  // Load user coupons when selected user changes
  useEffect(() => {
    if (selectedUser && !selectedUser.isAdmin) {
      const loadCoupons = async () => {
        try {
          const coupons = await getUserCoupons(selectedUser.id);
          setUserCoupons(coupons);
        } catch (e) {
          console.error('Error loading coupons:', e);
          setUserCoupons([]);
        }
      };
      loadCoupons();
    } else {
      setUserCoupons([]);
    }
  }, [selectedUser]);

  // Refresh selected product popularity when products list changes
  useEffect(() => {
    if (selectedProduct) {
      const updated = productsList.find((p) => p.id === selectedProduct.id);
      if (updated) {
        setSelectedProduct(updated);
      }
    }
  }, [productsList]);

  // Listen for popularity updates and refresh selected product and products list
  useEffect(() => {
    const handlePopularityUpdate = () => {
      // Wait a bit for ProductsContext to update first
      setTimeout(() => {
        // Refresh selected product if one is selected
        if (selectedProduct) {
          // Get fresh popularity from localStorage
          const popularityKey = 'bloom_product_popularity';
          const storedPopularity = localStorage.getItem(popularityKey);
          if (storedPopularity) {
            try {
              const popularityData = JSON.parse(storedPopularity);
              const newPopularity = popularityData[selectedProduct.id] || 0;
              // Update selected product with new popularity
              setSelectedProduct((prev) => ({
                ...prev,
                popularity: newPopularity,
              }));
            } catch (e) {
              console.error('Error parsing popularity data:', e);
            }
          }
        }
        
        // Also refresh from productsList to ensure we have the latest data
        if (selectedProduct) {
          const updated = productsList.find((p) => p.id === selectedProduct.id);
          if (updated && updated.popularity !== selectedProduct.popularity) {
            setSelectedProduct(updated);
          }
        }
      }, 100);
    };

    window.addEventListener('popularityUpdated', handlePopularityUpdate);
    return () => {
      window.removeEventListener('popularityUpdated', handlePopularityUpdate);
    };
  }, [selectedProduct, productsList]);

  const loadUsers = async () => {
    const { getUsers } = await import('../../services/database');
    try {
      const parsed = await getUsers();
      // Don't show password in the list
      const usersWithoutPasswords = parsed.map((u) => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
      setUsers(usersWithoutPasswords);
    } catch (e) {
      console.error('Error loading users:', e);
    }
  };

  const deleteUser = async (userId) => {
    const { deleteUser: dbDeleteUser } = await import('../../services/database');
    try {
      await dbDeleteUser(userId);
      await loadUsers();
      setSelectedUser(null);
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error('Error deleting user:', e);
    }
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
    setSelectedProduct(null);
    setShowDeleteConfirm(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      setNewProduct({ ...newProduct, image: base64String });
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMarkerToggle = (markerId) => {
    const currentMarkers = editingProduct ? editingProduct.markers || [] : newProduct.markers || [];
    const newMarkers = currentMarkers.includes(markerId)
      ? currentMarkers.filter((m) => m !== markerId)
      : [...currentMarkers, markerId];
    
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, markers: newMarkers });
    } else {
      setNewProduct({ ...newProduct, markers: newMarkers });
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.brand && newProduct.type) {
      const productToAdd = {
        ...newProduct,
        image: imagePreview || newProduct.image || 'https://via.placeholder.com/600x800',
      };
      const product = await addProduct(productToAdd);
      setSelectedProduct(product);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        price: 0,
        brand: '',
        type: '',
        description: '',
        image: '',
        markers: [],
      });
      setImagePreview(null);
      setImageFile(null);
      setShowAddProductForm(false); // Hide form after adding
    }
  };

  const handleStartEdit = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = () => {
    if (editingProduct) {
      const { popularity, ...updates } = editingProduct;
      updateProduct(editingProduct.id, updates);
      // Refresh selected product from products list after a short delay to allow state update
      setTimeout(() => {
        const updated = productsList.find((p) => p.id === editingProduct.id);
        if (updated) {
          setSelectedProduct(updated);
        }
      }, 100);
      setEditingProduct(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    // Reset to original product
    if (selectedProduct) {
      const original = productsList.find((p) => p.id === selectedProduct.id);
      if (original) {
        setSelectedProduct(original);
      }
    }
  };

  const handleEditFieldChange = (field, value) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  const generateCouponCode = () => {
    return `BLOOM${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleCreateCoupon = async () => {
    if (!selectedUser || selectedUser.isAdmin) return;
    
    if (!couponCode.trim()) {
      alert('Please enter a coupon code');
      return;
    }
    
    const discount = parseFloat(couponDiscount);
    if (isNaN(discount) || discount <= 0) {
      alert('Please enter a valid discount amount');
      return;
    }
    
    if (couponDiscountType === 'percentage' && discount > 100) {
      alert('Percentage discount cannot exceed 100%');
      return;
    }

    const coupon = {
      id: `COUPON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: couponCode.trim().toUpperCase(),
      discount: discount,
      discountType: couponDiscountType,
      userId: selectedUser.id,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt: couponExpiresAt || null,
    };

    try {
      await addCoupon(coupon);
      // Reload coupons
      const coupons = await getUserCoupons(selectedUser.id);
      setUserCoupons(coupons);
      
      // Reset form
      setCouponCode('');
      setCouponDiscount('');
      setCouponDiscountType('percentage');
      setCouponExpiresAt('');
      setShowCouponForm(false);
    } catch (e) {
      console.error('Error creating coupon:', e);
      alert('Failed to create coupon');
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <h2>Access Denied</h2>
          <p>You must be an administrator to access this page.</p>
          <button onClick={() => navigate('/')} style={styles.button}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Panel</h1>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tab,
            ...(activeTab === 'users' ? styles.activeTab : {}),
          }}
        >
          Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            ...styles.tab,
            ...(activeTab === 'products' ? styles.activeTab : {}),
          }}
        >
          Products ({productsList.length})
        </button>
      </div>

      {/* Content */}
      <div style={styles.productsContent}>
        {activeTab === 'users' ? (
          <>
            <div style={styles.gridSection}>
              {/* Admins Section */}
              <div style={styles.userCategorySection}>
                <h2 style={styles.sectionTitle}>
                  Administrators ({users.filter((u) => u.isAdmin).length})
                </h2>
                <div style={styles.grid}>
                  {users
                    .filter((u) => u.isAdmin)
                    .map((u) => (
                      <div
                        key={u.id}
                        style={{
                          ...styles.gridItem,
                          ...(selectedUser?.id === u.id ? styles.selectedGridItem : {}),
                        }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <img
                          src={u.photo}
                          alt={u.email}
                          style={styles.gridItemPhoto}
                        />
                        <div style={styles.gridItemInfo}>
                          <p style={styles.gridItemName}>{u.email}</p>
                          <p style={styles.gridItemMeta}>Admin</p>
                        </div>
                        <span style={styles.adminBadge}>Admin</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Regular Users Section */}
              <div style={styles.userCategorySection}>
                <h2 style={styles.sectionTitle}>
                  Users ({users.filter((u) => !u.isAdmin).length})
                </h2>
                <div style={styles.grid}>
                  {users
                    .filter((u) => !u.isAdmin)
                    .map((u) => (
                      <div
                        key={u.id}
                        style={{
                          ...styles.gridItem,
                          ...(selectedUser?.id === u.id ? styles.selectedGridItem : {}),
                        }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <img
                          src={u.photo}
                          alt={u.email}
                          style={styles.gridItemPhoto}
                        />
                        <div style={styles.gridItemInfo}>
                          <p style={styles.gridItemName}>{u.email}</p>
                          <p style={styles.gridItemMeta}>User</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {selectedUser && (
              <div style={styles.modalOverlay} onClick={() => {
                setSelectedUser(null);
                setShowDeleteConfirm(null);
              }}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                    <h2 style={styles.detailsTitle}>User Details</h2>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setShowDeleteConfirm(null);
                      }}
                      style={styles.closeButton}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div style={styles.detailsGrid}>
                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <div>
                      <p style={styles.detailLabel}>Email</p>
                      <p style={styles.detailValue}>{selectedUser.email}</p>
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <p style={styles.detailLabel}>User ID</p>
                      <p style={styles.detailValue}>{selectedUser.id}</p>
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <p style={styles.detailLabel}>Role</p>
                      <p style={styles.detailValue}>
                        {selectedUser.isAdmin ? 'Administrator' : 'User'}
                      </p>
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p style={styles.detailLabel}>Joined</p>
                      <p style={styles.detailValue}>
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {selectedUser.cardInfo && (
                    <div style={styles.detailCard}>
                      <div style={styles.detailIcon}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <p style={styles.detailLabel}>Payment Card</p>
                        <p style={styles.detailValue}>
                          **** **** **** {selectedUser.cardInfo.cardNumber?.slice(-4) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Coupons Section */}
                {!selectedUser.isAdmin && (
                  <div style={styles.couponsSection}>
                    <div style={styles.couponsHeader}>
                      <h3 style={styles.couponsTitle}>Coupons</h3>
                      <button
                        onClick={() => {
                          setShowCouponForm(!showCouponForm);
                          if (!showCouponForm) {
                            setCouponCode(generateCouponCode());
                          }
                        }}
                        style={styles.giveCouponButton}
                      >
                        {showCouponForm ? 'Cancel' : 'Give Coupon'}
                      </button>
                    </div>
                    
                    {showCouponForm && (
                      <div style={styles.couponForm}>
                        <div style={styles.formRow}>
                          <label style={styles.formLabel}>Coupon Code</label>
                          <div style={styles.inputWithButton}>
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="BLOOM123"
                              style={{ ...styles.formInput, flex: 1 }}
                            />
                            <button
                              type="button"
                              onClick={() => setCouponCode(generateCouponCode())}
                              style={styles.generateButton}
                            >
                              Generate
                            </button>
                          </div>
                        </div>
                        
                        <div style={styles.formRow}>
                          <label style={styles.formLabel}>Discount Type</label>
                          <select
                            value={couponDiscountType}
                            onChange={(e) => setCouponDiscountType(e.target.value)}
                            style={styles.formSelect}
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                          </select>
                        </div>
                        
                        <div style={styles.formRow}>
                          <label style={styles.formLabel}>
                            Discount {couponDiscountType === 'percentage' ? '(%)' : '($)'}
                          </label>
                          <input
                            type="number"
                            value={couponDiscount}
                            onChange={(e) => setCouponDiscount(e.target.value)}
                            placeholder={couponDiscountType === 'percentage' ? '10' : '5.00'}
                            min="0"
                            max={couponDiscountType === 'percentage' ? '100' : undefined}
                            step={couponDiscountType === 'percentage' ? '1' : '0.01'}
                            style={styles.formInput}
                          />
                        </div>
                        
                        <div style={styles.formRow}>
                          <label style={styles.formLabel}>Expiry Date (Optional)</label>
                          <input
                            type="date"
                            value={couponExpiresAt}
                            onChange={(e) => setCouponExpiresAt(e.target.value)}
                            style={styles.formInput}
                          />
                        </div>
                        
                        <button
                          onClick={handleCreateCoupon}
                          style={styles.createCouponButton}
                        >
                          Create Coupon
                        </button>
                      </div>
                    )}
                    
                    {userCoupons.length > 0 ? (
                      <div style={styles.couponsList}>
                        {userCoupons.map((coupon) => (
                          <div key={coupon.id} style={styles.couponCard}>
                            <div style={styles.couponCardInfo}>
                              <p style={styles.couponCardCode}>{coupon.code}</p>
                              <p style={styles.couponCardDiscount}>
                                {coupon.discountType === 'percentage'
                                  ? `${coupon.discount}% off`
                                  : `$${coupon.discount} off`}
                              </p>
                            </div>
                            {coupon.expiresAt && (
                              <p style={styles.couponCardExpiry}>
                                Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                              </p>
                            )}
                            <p style={styles.couponCardStatus}>
                              {coupon.used ? 'Used' : 'Active'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.noCoupons}>No coupons for this user</p>
                    )}
                  </div>
                )}

                {!selectedUser.isAdmin && (
                  <div style={styles.actionSection}>
                    {showDeleteConfirm === selectedUser.id ? (
                      <div style={styles.confirmBox}>
                        <p style={styles.confirmText}>Are you sure you want to delete this user?</p>
                        <div style={styles.confirmButtons}>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            style={styles.confirmCancelButton}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => deleteUser(selectedUser.id)}
                            style={styles.confirmDeleteButton}
                          >
                            Delete User
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(selectedUser.id)}
                        style={styles.deleteButton}
                      >
                        Delete User
                      </button>
                    )}
                  </div>
                )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={styles.gridSection}>
              <div style={styles.productsHeader}>
                <h2 style={styles.sectionTitle}>Products ({productsList.length})</h2>
                {!showAddProductForm && (
                  <button
                    onClick={() => setShowAddProductForm(true)}
                    style={styles.addProductToggleButton}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add New Product
                  </button>
                )}
              </div>

              {/* Add Product Form */}
              {showAddProductForm && (
                <div style={styles.addProductForm}>
                  <div style={styles.formHeader}>
                    <h3 style={styles.formTitle}>Add New Product</h3>
                    <button
                      onClick={() => {
                        setShowAddProductForm(false);
                        setNewProduct({
                          name: '',
                          price: 0,
                          brand: '',
                          type: '',
                          description: '',
                          image: '',
                          markers: [],
                        });
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      style={styles.formCloseButton}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        placeholder="Product name"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Price</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Brand</label>
                      <input
                        type="text"
                        value={newProduct.brand}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, brand: e.target.value })
                        }
                        placeholder="Brand name"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Type</label>
                      <input
                        type="text"
                        value={newProduct.type}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, type: e.target.value })
                        }
                        placeholder="Product type"
                        style={styles.input}
                      />
                    </div>
                    <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Description</label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, description: e.target.value })
                        }
                        placeholder="Product description"
                        style={styles.textarea}
                        rows={4}
                      />
                    </div>
                    <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Product Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={styles.fileInput}
                      />
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={styles.imagePreview}
                        />
                      )}
                    </div>
                    <div style={{ ...styles.inputGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Sustainability Markers</label>
                      <div style={styles.markersContainer}>
                        {['sustainablePackaging', 'organicIngredients', 'recyclable', 'crueltyFree'].map((markerId) => (
                          <label key={markerId} style={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={newProduct.markers?.includes(markerId) || false}
                              onChange={() => {
                                const currentMarkers = newProduct.markers || [];
                                const newMarkers = currentMarkers.includes(markerId)
                                  ? currentMarkers.filter((m) => m !== markerId)
                                  : [...currentMarkers, markerId];
                                setNewProduct({ ...newProduct, markers: newMarkers });
                              }}
                              style={styles.checkbox}
                            />
                            <span style={styles.checkboxText}>
                              {markerId === 'sustainablePackaging' && 'Sustainable Packaging'}
                              {markerId === 'organicIngredients' && 'Organic Ingredients'}
                              {markerId === 'recyclable' && 'Recyclable'}
                              {markerId === 'crueltyFree' && 'Cruelty Free'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={styles.formActions}>
                    <button 
                      onClick={() => {
                        setShowAddProductForm(false);
                        setNewProduct({
                          name: '',
                          price: 0,
                          brand: '',
                          type: '',
                          description: '',
                          image: '',
                          markers: [],
                        });
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      style={styles.cancelFormButton}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleAddProduct} 
                      style={{
                        ...styles.submitProductButton,
                        ...((!newProduct.name || !newProduct.brand || !newProduct.type) 
                          ? { opacity: 0.5, cursor: 'not-allowed' } 
                          : {})
                      }}
                      disabled={!newProduct.name || !newProduct.brand || !newProduct.type}
                    >
                      Add Product
                    </button>
                  </div>
                </div>
              )}

              <div style={styles.grid}>
                {productsList.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      ...styles.gridItem,
                      ...(selectedProduct?.id === p.id ? styles.selectedGridItem : {}),
                    }}
                    onClick={() => {
                    setSelectedProduct(p);
                    setEditingProduct(null); // Reset editing when selecting new product
                  }}
                  >
                    <div style={styles.gridItemIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                      </svg>
                    </div>
                    <div style={styles.gridItemInfo}>
                      <p style={styles.gridItemName}>{p.name}</p>
                      <p style={styles.gridItemMeta}>
                        {p.brand} • ${p.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedProduct && (
              <div style={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                    <h2 style={styles.detailsTitle}>Product Details</h2>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setEditingProduct(null);
                        setShowDeleteConfirm(null);
                      }}
                      style={styles.closeButton}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0.7'}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Name</p>
                      {editingProduct ? (
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => handleEditFieldChange('name', e.target.value)}
                          style={styles.detailInput}
                        />
                      ) : (
                        <p style={styles.detailValue}>{selectedProduct.name}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Price</p>
                      {editingProduct ? (
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => handleEditFieldChange('price', parseFloat(e.target.value) || 0)}
                          style={styles.detailInput}
                        />
                      ) : (
                        <p style={styles.detailValue}>${selectedProduct.price}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Brand</p>
                      {editingProduct ? (
                        <input
                          type="text"
                          value={editingProduct.brand}
                          onChange={(e) => handleEditFieldChange('brand', e.target.value)}
                          style={styles.detailInput}
                        />
                      ) : (
                        <p style={styles.detailValue}>{selectedProduct.brand}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Type</p>
                      {editingProduct ? (
                        <input
                          type="text"
                          value={editingProduct.type}
                          onChange={(e) => handleEditFieldChange('type', e.target.value)}
                          style={styles.detailInput}
                        />
                      ) : (
                        <p style={styles.detailValue}>{selectedProduct.type}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Description</p>
                      {editingProduct ? (
                        <textarea
                          value={editingProduct.description || ''}
                          onChange={(e) => handleEditFieldChange('description', e.target.value)}
                          style={styles.detailTextarea}
                          rows={4}
                        />
                      ) : (
                        <p style={styles.detailValue}>
                          {selectedProduct.description || 'No description'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Image</p>
                      {editingProduct ? (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={styles.fileInput}
                          />
                          {editingProduct.image && (
                            <img
                              src={editingProduct.image}
                              alt="Product"
                              style={styles.detailImagePreview}
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          {selectedProduct.image ? (
                            <img
                              src={selectedProduct.image}
                              alt="Product"
                              style={styles.detailImagePreview}
                            />
                          ) : (
                            <p style={styles.detailValue}>No image</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Sustainability Markers</p>
                      {editingProduct ? (
                        <div style={styles.markersContainer}>
                          {['sustainablePackaging', 'organicIngredients', 'recyclable', 'crueltyFree'].map((markerId) => (
                            <label key={markerId} style={styles.checkboxLabel}>
                              <input
                                type="checkbox"
                                checked={editingProduct.markers?.includes(markerId) || false}
                                onChange={() => handleMarkerToggle(markerId)}
                                style={styles.checkbox}
                              />
                              <span style={styles.checkboxText}>
                                {markerId === 'sustainablePackaging' && 'Sustainable Packaging'}
                                {markerId === 'organicIngredients' && 'Organic Ingredients'}
                                {markerId === 'recyclable' && 'Recyclable'}
                                {markerId === 'crueltyFree' && 'Cruelty Free'}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p style={styles.detailValue}>
                          {selectedProduct.markers && selectedProduct.markers.length > 0
                            ? selectedProduct.markers.join(', ')
                            : 'None'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={styles.detailCard}>
                    <div style={styles.detailIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    </div>
                    <div style={styles.detailInputWrapper}>
                      <p style={styles.detailLabel}>Popularity</p>
                      <p style={styles.detailValue}>
                        {selectedProduct.popularity || 0} (based on cart additions)
                      </p>
                    </div>
                  </div>
                </div>

                <div style={styles.actionSection}>
                  {editingProduct ? (
                    <div style={styles.editActions}>
                      <button onClick={handleSaveEdit} style={styles.saveButton}>
                        Save Changes
                      </button>
                      <button onClick={handleCancelEdit} style={styles.cancelButton}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => handleStartEdit(selectedProduct)} style={styles.editButton}>
                      Edit Product
                    </button>
                  )}
                  
                  {showDeleteConfirm === selectedProduct.id ? (
                    <div style={styles.confirmBox}>
                      <p style={styles.confirmText}>Are you sure you want to delete this product?</p>
                      <div style={styles.confirmButtons}>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          style={styles.confirmCancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(selectedProduct.id)}
                          style={styles.confirmDeleteButton}
                        >
                          Delete Product
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(selectedProduct.id)}
                      style={styles.deleteButton}
                    >
                      Delete Product
                    </button>
                  )}
                </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    backgroundColor: '#141414',
    color: '#fff',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '40px',
    letterSpacing: '-0.04em',
  },
  tabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '40px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#fff',
    borderBottomColor: '#fff',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
  },
  productsContent: {
    width: '100%',
  },
  gridSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    width: '100%',
  },
  userCategorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 500,
    margin: 0,
    marginBottom: '24px',
  },
  productsHeader: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addProductToggleButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  },
  addProductForm: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '32px',
    marginBottom: '40px',
    width: '100%',
    boxSizing: 'border-box',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  formTitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: 0,
  },
  formCloseButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent: 'flex-end',
  },
  cancelFormButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  submitProductButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '20px',
  },
  textarea: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 16px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    borderRadius: 0,
  },
  fileInput: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px',
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    width: '100%',
    marginTop: '8px',
    borderRadius: 0,
  },
  imagePreview: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    marginTop: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0,
  },
  markersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    color: 'rgba(255,255,255,0.8)',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxText: {
    fontSize: '0.9rem',
  },
  detailTextarea: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 12px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    width: '100%',
    marginTop: '4px',
    fontFamily: 'inherit',
    resize: 'vertical',
    borderRadius: 0,
  },
  detailImagePreview: {
    width: '100%',
    maxWidth: '200px',
    height: 'auto',
    marginTop: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 0,
  },
  addButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    marginTop: '16px',
    borderRadius: 0,
  },
  editButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    borderRadius: 0,
    marginBottom: '12px',
  },
  saveButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    flex: 1,
  },
  editActions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '24px',
    width: '100%',
  },
  gridItem: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px',
    position: 'relative',
  },
  selectedGridItem: {
    background: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    transform: 'scale(1.02)',
  },
  gridItemPhoto: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
  },
  gridItemIcon: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  gridItemInfo: {
    width: '100%',
  },
  gridItemName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: '#fff',
    marginBottom: '4px',
  },
  gridItemMeta: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  adminBadge: {
    background: '#4caf50',
    color: '#fff',
    padding: '4px 8px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '40px',
    boxSizing: 'border-box',
  },
  modalContent: {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s',
  },
  userDetailsPanel: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '32px',
    position: 'sticky',
    top: '160px',
    width: '100%',
    minWidth: '400px',
    boxSizing: 'border-box',
    overflow: 'visible',
  },
  detailsTitle: {
    fontSize: '1.5rem',
    fontWeight: 500,
    margin: '0 0 32px 0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    marginBottom: '32px',
  },
  detailCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  detailIcon: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.6)',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  detailLabel: {
    margin: 0,
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  detailValue: {
    margin: 0,
    fontSize: '1rem',
    color: '#fff',
    fontWeight: 500,
  },
  detailInputWrapper: {
    flex: 1,
  },
  detailInput: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '8px 12px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    width: '100%',
    marginTop: '4px',
    borderRadius: 0,
  },
  actionSection: {
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  confirmText: {
    margin: '0 0 16px 0',
    color: '#ff4444',
    fontSize: '0.95rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  input: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '12px 16px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    borderRadius: 0,
  },
  confirmBox: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    padding: '16px',
  },
  confirmButtons: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  cancelButton: {
    flex: 1,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  confirmCancelButton: {
    flex: 1,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  confirmDeleteButton: {
    flex: 1,
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  deleteButton: {
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    borderRadius: 0,
  },
  errorBox: {
    textAlign: 'center',
    padding: '80px 40px',
  },
  button: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '24px',
  },
  couponsSection: {
    marginTop: '32px',
    paddingTop: '32px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  couponsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  couponsTitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    margin: 0,
    color: '#fff',
  },
  giveCouponButton: {
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'background 0.2s',
  },
  couponForm: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '20px',
    borderRadius: 0,
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: 500,
  },
  formInput: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 12px',
    borderRadius: 0,
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
  },
  formSelect: {
    background: 'rgba(44, 44, 44, 1)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 12px',
    borderRadius: 0,
    fontSize: '0.9rem',
    color: '#fff',
    outline: 'none',
    cursor: 'pointer',
  },
  inputWithButton: {
    display: 'flex',
    gap: '8px',
    alignItems: 'stretch',
  },
  generateButton: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '10px 16px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    borderRadius: 0,
    whiteSpace: 'nowrap',
  },
  createCouponButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    marginTop: '8px',
  },
  couponsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  couponCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '16px',
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  couponCardInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCardCode: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    letterSpacing: '0.05em',
  },
  couponCardDiscount: {
    fontSize: '0.9rem',
    color: '#4caf50',
    margin: 0,
    fontWeight: 500,
  },
  couponCardExpiry: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  couponCardStatus: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    fontStyle: 'italic',
  },
  noCoupons: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
    fontStyle: 'italic',
  },
};

export default Admin;
