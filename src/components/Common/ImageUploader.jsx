import React, { useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

export default function ImageUploader({
  multiple = false,
  images = [],
  onImagesChange,
  existingImages = [],
  onRemoveExisting
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (multiple) {
      onImagesChange([...images, ...files]);
    } else {
      onImagesChange([files[0]]);
    }
  };

  const handleRemoveNew = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--heading)' }}>
        {multiple ? 'Product / Vehicle Images' : 'Image'}
      </label>

      {/* Upload Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-sidebar)',
          cursor: 'pointer',
          transition: 'var(--transition-fast)',
          marginBottom: '1rem'
        }}
      >
        <UploadCloud size={32} color="var(--primary)" style={{ margin: '0 auto 0.5rem auto' }} />
        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--heading)' }}>
          Click to upload {multiple ? 'images' : 'an image'}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Supports JPG, PNG, WEBP up to 10MB (Stored on Cloudinary)
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Image Previews */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Existing Images from DB */}
        {existingImages.map((img, idx) => {
          const imgUrl = typeof img === 'string' ? img : img.url;
          return (
            <div
              key={`exist-${idx}`}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}
            >
              <img src={imgUrl} alt="Existing Asset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img._id || img.publicId || idx)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  title="Delete from Cloudinary"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        {/* Newly Selected Local Files */}
        {images.map((file, idx) => {
          const previewUrl = URL.createObjectURL(file);
          return (
            <div
              key={`new-${idx}`}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                border: '2px solid var(--primary)'
              }}
            >
              <img src={previewUrl} alt="Upload Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => handleRemoveNew(idx)}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
