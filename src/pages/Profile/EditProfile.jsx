import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import { validateEmail } from '../../utils/validation';
import { updateUser as dbUpdateUser, getUsers } from '../../services/database';
import Footer from '../../components/layout/Footer';

const EditProfile = ({ navigate }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setName(user.name || '');
    setSurname(user.surname || '');
    setEmail(user.email || '');
    setPhotoPreview(user.photo || null);
  }, [user, navigate]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Please select an image file',
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: 'Image must be less than 5MB',
      }));
      return;
    }

    setPhoto(file);
    setErrors((prev) => ({ ...prev, photo: '' }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setIsSubmitting(true);

    const newErrors = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!surname || surname.trim().length < 2) {
      newErrors.surname = 'Surname must be at least 2 characters';
    }
    if (!email || !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const users = await getUsers();
      if (users.find((u) => u.email === email && u.id !== user.id)) {
        newErrors.email = 'Email is already registered';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      let photoBase64 = photoPreview;
      if (photo) {
        photoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo);
        });
      }

      // Update user using AuthContext method (updates database, state, and localStorage)
      const result = await updateUser({
        name: name.trim(),
        surname: surname.trim(),
        email: email.trim(),
        photo: photoBase64,
      });

      if (result.success) {
        setSuccess(true);
        // No need to reload - user state is already updated
      } else {
        setErrors({ submit: result.error || 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Edit Profile</h1>
        <p style={styles.subtitle}>Update your personal information</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {errors.submit && (
            <div style={styles.errorBox}>{errors.submit}</div>
          )}
          {success && (
            <div style={styles.successBox}>Profile updated successfully!</div>
          )}

          <div style={styles.photoSection}>
            <label style={styles.label}>Profile Photo</label>
            <div style={styles.photoContainer}>
              {photoPreview ? (
                <div style={styles.photoPreview}>
                  <img
                    src={photoPreview}
                    alt="Profile"
                    style={styles.previewImage}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(user?.photo || null);
                      if (fileInputRef.current)
                        fileInputRef.current.value = '';
                    }}
                    style={styles.removePhoto}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  style={styles.photoUpload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Click to upload photo</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
            {errors.photo && (
              <span style={styles.errorText}>{errors.photo}</span>
            )}
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John"
                style={{
                  ...styles.input,
                  borderColor: errors.name ? '#ff4444' : 'rgba(255,255,255,0.2)',
                }}
                required
              />
              {errors.name && (
                <span style={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Surname</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Doe"
                style={{
                  ...styles.input,
                  borderColor: errors.surname ? '#ff4444' : 'rgba(255,255,255,0.2)',
                }}
                required
              />
              {errors.surname && (
                <span style={styles.errorText}>{errors.surname}</span>
              )}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              style={{
                ...styles.input,
                borderColor: errors.email ? '#ff4444' : 'rgba(255,255,255,0.2)',
              }}
              required
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
      <Footer navigate={navigate} />
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#141414',
    color: '#fff',
  },
  content: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '8px',
    letterSpacing: '-0.04em',
  },
  subtitle: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '40px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  photoContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  photoPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  previewImage: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '50%',
  },
  photoUpload: {
    background: 'rgba(44, 44, 44, 1)',
    border: '2px dashed rgba(255,255,255,0.2)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    color: 'rgba(255,255,255,0.6)',
    borderRadius: 0,
  },
  removePhoto: {
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    borderRadius: 0,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
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
    padding: '14px 16px',
    fontSize: '1rem',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: 0,
  },
  errorText: {
    fontSize: '0.85rem',
    color: '#ff4444',
    marginTop: '-4px',
  },
  errorBox: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    padding: '12px 16px',
    color: '#ff4444',
    fontSize: '0.9rem',
  },
  successBox: {
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid #4caf50',
    padding: '12px 16px',
    color: '#4caf50',
    fontSize: '0.9rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '16px',
    marginTop: '8px',
  },
  cancelButton: {
    flex: 1,
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.2s',
  },
  submitButton: {
    flex: 1,
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'opacity 0.2s',
  },
};

export default EditProfile;
