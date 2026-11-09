import { useState, useRef } from 'react';
import styles from './index.module.css';
import type { VariantImage } from '../../../../domain/entities/VariantImage';

export interface PendingImage {
  id:      string;
  preview: string;
  file:    File;
  isUrl:   boolean;
}

interface Props {
  existingImages: VariantImage[];
  pendingImages:  PendingImage[];
  onDelete:       (imageId: string) => Promise<void>;
  onPendingChange:(images: PendingImage[]) => void;
  isSubmitting:   boolean;
}

export const VariantImageUploader = ({
  existingImages, pendingImages, onDelete, onPendingChange, isSubmitting,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newImages: PendingImage[] = files.map((file) => ({
      id:      `local-${Date.now()}-${Math.random()}`,
      preview: URL.createObjectURL(file),
      file,
      isUrl:   false,
    }));

    onPendingChange([...pendingImages, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePending = (id: string) => {
    onPendingChange(pendingImages.filter((img) => img.id !== id));
  };

  const totalCount = existingImages.length + pendingImages.length;

  return (
    <div className={styles.uploader}>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>
          <i className="fa-solid fa-images" style={{ color: '#6C35DE' }} />
          Variant Images
        </span>
        <span className={styles.count}>
          {totalCount} image{totalCount !== 1 ? 's' : ''}
          {pendingImages.length > 0 && (
            <span className={styles.pendingCount}> · {pendingImages.length} pending</span>
          )}
        </span>
      </div>

      {/* Image grid */}
      {totalCount > 0 && (
        <div className={styles.grid}>
          {/* Existing saved images */}
          {existingImages.map((img, i) => (
            <div
              key={img.image_id}
              className={`${styles.thumb} ${img.is_primary ? styles.thumbPrimary : ''}`}
            >
              <img
                src={img.image_url}
                alt={`Variant ${i + 1}`}
                className={styles.thumbImg}
              />
              {img.is_primary && (
                <span className={styles.primaryBadge}>Primary</span>
              )}
              <button
                type="button"
                onClick={() => onDelete(img.image_id)}
                disabled={isSubmitting}
                className={styles.thumbRemove}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ))}

          {/* Pending local images */}
          {pendingImages.map((img, i) => (
            <div key={img.id} className={`${styles.thumb} ${styles.thumbPending}`}>
              <img
                src={img.preview}
                alt={`New ${i + 1}`}
                className={styles.thumbImg}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className={styles.pendingBadge}>New</span>
              <button
                type="button"
                onClick={() => removePending(img.id)}
                className={styles.thumbRemove}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      <div
        className={styles.uploadZone}
        onClick={() => fileInputRef.current?.click()}
      >
        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 18, color: '#9CA3AF' }} />
        <div className={styles.uploadTextGroup}>
          <p className={styles.uploadText}>Click to select images</p>
          <p className={styles.uploadSub}>PNG, JPG, WebP — multiple files, max 5MB each</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};