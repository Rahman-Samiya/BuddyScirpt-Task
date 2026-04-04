"use client";

import Swal from 'sweetalert2';
import type { Post } from "../../../services/postService";
import { postService } from "../../../services/postService";

interface EditPostModalProps {
  post: Post;
  onPostUpdate: (updatedPost: Post) => void;
}

export const showEditPostModal = async ({ post, onPostUpdate }: EditPostModalProps) => {
  const { value: formValues } = await Swal.fire({
    title: 'Edit Post',
    html: getEditModalHTML(post),
    showCancelButton: true,
    confirmButtonText: 'Update Post',
    cancelButtonText: 'Cancel',
    customClass: {
      container: 'swal-edit-container',
      popup: 'swal-edit-modal',
      confirmButton: 'swal-btn-confirm',
      cancelButton: 'swal-btn-cancel',
      input: 'swal-input',
    } as any,
    didOpen: (modal) => {
      // Add event listeners or custom styles if needed
      const style = document.createElement('style');
      style.innerHTML = getModalStyles();
      modal.appendChild(style);
    },
    preConfirm: () => {
      const content = (document.getElementById('edit-content') as HTMLTextAreaElement)?.value?.trim();
      const visibilityRadio = document.querySelector('input[name="visibility"]:checked') as HTMLInputElement;
      const visibility = visibilityRadio?.value as 'public' | 'private';
      const imageInput = document.getElementById('edit-image') as HTMLInputElement;
      const imageFile = imageInput?.files?.[0];

      if (!content) {
        Swal.showValidationMessage('Please write something');
        return false;
      }

      // Validate image if provided
      if (imageFile) {
        if (!imageFile.type.startsWith('image/')) {
          Swal.showValidationMessage('Please select a valid image file');
          return false;
        }
        if (imageFile.size > 5 * 1024 * 1024) {
          Swal.showValidationMessage('Image size should be less than 5MB');
          return false;
        }
      }

      return { content, visibility, image: imageFile || null };
    }
  });

  if (formValues) {
    try {
      const updateData: any = {
        content: formValues.content,
        visibility: formValues.visibility,
      };

      console.log('Form Values:', updateData);

      if (formValues.image) {
        updateData.image = formValues.image;
      }

      const response = await postService.updatePost(post.id, updateData);
      onPostUpdate?.(response.post);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Post updated successfully!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast'
        }
      });
    } catch (error: any) {
      console.error('Failed to update post:', error);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: error.response?.data?.message || 'Failed to update post',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: 'swal2-toast'
        }
      });
    }
  }
};

const getEditModalHTML = (post: Post) => {
  return `
    <div class="edit-modal-wrapper">
      <div class="edit-form-group">
        <label class="edit-form-label">Content</label>
        <textarea
          id="edit-content"
          class="edit-form-textarea"
          placeholder="Write something..."
        >${post.content}</textarea>
        <p class="edit-form-hint">Share your thoughts...</p>
      </div>

      <div class="edit-form-group">
        <label class="edit-form-label">Visibility</label>
        <div class="edit-visibility-options">
          <label class="visibility-radio">
            <input type="radio" name="visibility" value="public" ${post.visibility === 'public' ? 'checked' : ''} />
            <span class="visibility-icon">🌐</span>
            <span class="visibility-text">Public</span>
            <span class="visibility-desc">Everyone can see this post</span>
          </label>
          <label class="visibility-radio">
            <input type="radio" name="visibility" value="private" ${post.visibility === 'private' ? 'checked' : ''} />
            <span class="visibility-icon">🔒</span>
            <span class="visibility-text">Private</span>
            <span class="visibility-desc">Only you can see this post</span>
          </label>
        </div>
        <select id="edit-visibility" style="display: none;">
          <option value="public" ${post.visibility === 'public' ? 'selected' : ''}>🌐 Public</option>
          <option value="private" ${post.visibility === 'private' ? 'selected' : ''}>🔒 Private</option>
        </select>
      </div>

      <div class="edit-form-group">
        <label class="edit-form-label">Image</label>
        <div class="edit-image-upload">
          <input
            type="file"
            id="edit-image"
            accept="image/*"
            class="edit-image-input"
          />
          <label for="edit-image" class="edit-image-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Click to upload or drag and drop</span>
            <p>PNG, JPG, GIF up to 5MB</p>
          </label>
        </div>
        ${post.image ? '<p class="edit-form-hint">Current image: ' + post.image.split('/').pop() + ' (Leave empty to keep)</p>' : ''}
      </div>
    </div>
  `;
};

const getModalStyles = () => {
  return `
    .swal-edit-modal {
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.16);
      padding: 32px !important;
      max-width: 600px !important;
    }

    .swal-edit-modal .swal2-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 24px;
    }

    .edit-modal-wrapper {
      text-align: left;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .edit-form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .edit-form-label {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .edit-form-textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      resize: vertical;
      transition: all 0.3s ease;
    }

    .edit-form-textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
    }

    .edit-form-hint {
      font-size: 12px;
      color: #999;
      margin: 0;
    }

    .edit-visibility-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .visibility-radio {
      display: flex;
      align-items: center;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .visibility-radio:hover {
      border-color: #007bff;
      background-color: #f8f9ff;
    }

    .visibility-radio input[type="radio"] {
      margin-right: 12px;
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .visibility-radio input[type="radio"]:checked {
      accent-color: #007bff;
    }

    .visibility-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    .visibility-text {
      font-weight: 600;
      color: #1a1a1a;
      margin-right: 8px;
    }

    .visibility-desc {
      font-size: 12px;
      color: #999;
      margin-left: auto;
    }

    .edit-image-upload {
      position: relative;
    }

    .edit-image-input {
      display: none;
    }

    .edit-image-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      border: 2px dashed #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fafafa;
    }

    .edit-image-label:hover {
      border-color: #007bff;
      background-color: #f8f9ff;
    }

    .edit-image-label svg {
      width: 32px;
      height: 32px;
      color: #007bff;
      margin-bottom: 8px;
    }

    .edit-image-label span {
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
    }

    .edit-image-label p {
      font-size: 12px;
      color: #999;
      margin: 4px 0 0 0;
    }

    .swal-btn-confirm,
    .swal-btn-cancel {
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .swal-btn-confirm {
      background-color: #007bff;
      color: white;
      margin-right: 8px;
    }

    .swal-btn-confirm:hover {
      background-color: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .swal-btn-cancel {
      background-color: #e0e0e0;
      color: #333;
    }

    .swal-btn-cancel:hover {
      background-color: #d0d0d0;
    }

    .swal2-actions {
      gap: 8px;
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .swal-edit-modal {
        padding: 24px !important;
        max-width: 90vw !important;
      }

      .edit-modal-wrapper {
        gap: 20px;
      }

      .edit-form-textarea {
        min-height: 100px;
      }

      .edit-image-label {
        padding: 24px;
      }

      .swal-btn-confirm,
      .swal-btn-cancel {
        padding: 10px 20px;
        font-size: 14px;
      }

      .swal-edit-modal .swal2-title {
        font-size: 22px;
        margin-bottom: 20px;
      }

      .visibility-desc {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .swal-edit-modal {
        padding: 16px !important;
        max-width: 95vw !important;
      }

      .edit-modal-wrapper {
        gap: 16px;
      }

      .edit-form-textarea {
        min-height: 80px;
        font-size: 13px;
      }

      .edit-form-label {
        font-size: 13px;
      }

      .edit-image-label {
        padding: 16px;
      }

      .visibility-radio {
        padding: 8px;
      }

      .visibility-text {
        font-size: 14px;
      }

      .swal-btn-confirm,
      .swal-btn-cancel {
        padding: 8px 16px;
        font-size: 13px;
      }

      .swal-edit-modal .swal2-title {
        font-size: 18px;
        margin-bottom: 16px;
      }
    }
  `;
};

