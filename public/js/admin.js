// API endpoints
const API_BASE = '/api/admin';

// DOM elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const loginMessage = document.getElementById('loginMessage');

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const galleryTab = document.getElementById('galleryTab');
const memoriesTab = document.getElementById('memoriesTab');

// Gallery
const uploadForm = document.getElementById('uploadForm');
const uploadMessage = document.getElementById('uploadMessage');
const galleryList = document.getElementById('galleryList');

// Memories
const memoriesAdminList = document.getElementById('memoriesAdminList');

// Modals
const editModal = document.getElementById('editModal');
const editPhotoModal = document.getElementById('editPhotoModal');
const cropModal = document.getElementById('cropModal');
const closeModal = document.querySelector('.close');
const closePhotoModal = document.querySelector('.close-photo');
const closeCropModal = document.querySelector('.close-crop');

// Cropper
let cropper = null;
let selectedFile = null;

// Check auth status on load
checkAuthStatus();

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (tabName === 'gallery') {
      galleryTab.classList.add('active');
      memoriesTab.classList.remove('active');
    } else {
      memoriesTab.classList.add('active');
      galleryTab.classList.remove('active');
    }
  });
});

// Login
loginForm.addEventListener('submit', async e => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      showMessage(loginMessage, 'Login successful!', 'success');
      setTimeout(() => {
        showDashboard();
      }, 500);
    } else {
      showMessage(loginMessage, data.message || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showMessage(loginMessage, 'Login failed. Please try again.', 'error');
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    showLogin();
  } catch (error) {
    console.error('Logout error:', error);
  }
});

// File input change handler - show crop modal
document.getElementById('photoFile').addEventListener('change', e => {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.match('image.*')) {
    showMessage(uploadMessage, 'Please select an image file', 'error');
    return;
  }

  selectedFile = file;
  const reader = new FileReader();

  reader.onload = event => {
    const image = document.getElementById('cropImage');
    image.src = event.target.result;

    cropModal.classList.add('active');

    // Destroy previous cropper if exists
    if (cropper) {
      cropper.destroy();
    }

    // Initialize cropper
    cropper = new Cropper(image, {
      aspectRatio: NaN, // Free aspect ratio
      viewMode: 1,
      autoCropArea: 1,
      responsive: true,
      background: false
    });
  };

  reader.readAsDataURL(file);
});

// Confirm crop and upload
document.getElementById('cropConfirm').addEventListener('click', async () => {
  if (!cropper) return;

  const caption = document.getElementById('cropCaption').value;

  // Get cropped canvas
  const canvas = cropper.getCroppedCanvas();

  // Convert to blob
  canvas.toBlob(
    async blob => {
      const formData = new FormData();
      formData.append('photo', blob, selectedFile.name);
      formData.append('caption', caption);

      try {
        const response = await fetch(`${API_BASE}/gallery`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          showMessage(uploadMessage, 'Photo uploaded successfully!', 'success');
          uploadForm.reset();
          document.getElementById('cropCaption').value = '';
          cropModal.classList.remove('active');
          cropper.destroy();
          cropper = null;
          loadGallery();
        } else {
          showMessage(uploadMessage, data.message || 'Upload failed', 'error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        showMessage(uploadMessage, 'Upload failed. Please try again.', 'error');
      }
    },
    'image/jpeg',
    0.9
  );
});

// Cancel crop
document.getElementById('cancelCrop').addEventListener('click', () => {
  cropModal.classList.remove('active');
  document.getElementById('cropCaption').value = '';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  uploadForm.reset();
});

// Upload photo (form submit now just validates)
uploadForm.addEventListener('submit', e => {
  e.preventDefault();
  // Actual upload happens in crop confirmation
});

// Load gallery
async function loadGallery() {
  try {
    const response = await fetch(`${API_BASE}/gallery`, {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success) {
      displayGallery(data.photos);
    } else {
      galleryList.innerHTML = '<p class="message error">Failed to load gallery</p>';
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    galleryList.innerHTML = '<p class="message error">Failed to load gallery</p>';
  }
}

// Display gallery
function displayGallery(photos) {
  if (!photos || photos.length === 0) {
    galleryList.innerHTML = '<p>No photos yet. Upload your first photo above.</p>';
    return;
  }

  const html = photos
    .map(
      photo => `
    <div class="gallery-admin-item" draggable="true" data-id="${photo.id}">
      <div class="drag-handle" title="Drag to reorder">☰</div>
      <img src="${photo.photo_url}" alt="${photo.caption}">
      <div class="gallery-admin-info">
        <div class="gallery-admin-caption">${escapeHtml(photo.caption)}</div>
        <div class="gallery-admin-actions">
          <button class="btn btn-small" onclick="editPhoto(${photo.id}, '${escapeHtml(photo.caption).replace(/'/g, "\\'")}')">Edit Caption</button>
          <button class="btn btn-small btn-danger" onclick="deletePhoto(${photo.id})">Delete</button>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  galleryList.innerHTML = html;
  initializeDragAndDrop();
}

// Edit photo
function editPhoto(id, caption) {
  document.getElementById('editPhotoId').value = id;
  document.getElementById('editPhotoCaption').value = unescapeHtml(caption);
  editPhotoModal.classList.add('active');
}

// Edit photo form
document.getElementById('editPhotoForm').addEventListener('submit', async e => {
  e.preventDefault();

  const id = document.getElementById('editPhotoId').value;
  const caption = document.getElementById('editPhotoCaption').value;

  try {
    const response = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caption }),
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      editPhotoModal.classList.remove('active');
      loadGallery();
    } else {
      showMessage(
        document.getElementById('editPhotoMessage'),
        data.message || 'Update failed',
        'error'
      );
    }
  } catch (error) {
    console.error('Error updating photo:', error);
    showMessage(
      document.getElementById('editPhotoMessage'),
      'Update failed. Please try again.',
      'error'
    );
  }
});

// Delete photo
async function deletePhoto(id) {
  if (!confirm('Are you sure you want to delete this photo?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      loadGallery();
    } else {
      alert(data.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    alert('Delete failed. Please try again.');
  }
}

// Load memories
async function loadMemories() {
  try {
    const response = await fetch(`${API_BASE}/memories`, {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success) {
      displayMemories(data.memories);
    } else {
      memoriesAdminList.innerHTML = '<p class="message error">Failed to load memories</p>';
    }
  } catch (error) {
    console.error('Error loading memories:', error);
    memoriesAdminList.innerHTML = '<p class="message error">Failed to load memories</p>';
  }
}

// Display memories
function displayMemories(memories) {
  if (!memories || memories.length === 0) {
    memoriesAdminList.innerHTML = '<p>No memories shared yet.</p>';
    return;
  }

  const html = memories
    .map(memory => {
      const date = new Date(memory.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const photoHtml = memory.photo
        ? `<div class="memory-admin-photo">
           <img src="${memory.photo}" alt="Memory photo" style="max-width: 200px; margin-top: 0.5rem; border-radius: 4px;">
         </div>`
        : '';

      return `
      <div class="memory-admin-card">
        <div class="memory-admin-header">
          <div>
            <div class="memory-admin-from">${escapeHtml(memory.from)}</div>
            <div class="memory-admin-date">${date}</div>
          </div>
        </div>
        <div class="memory-admin-message">${escapeHtml(memory.message)}</div>
        ${photoHtml}
        <div class="memory-admin-actions">
          <button class="btn btn-small" onclick="editMemory(${memory.id}, '${escapeHtml(memory.from).replace(/'/g, "\\'")}', '${escapeHtml(memory.message).replace(/'/g, "\\'")}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="deleteMemory(${memory.id})">Delete</button>
        </div>
      </div>
    `;
    })
    .join('');

  memoriesAdminList.innerHTML = html;
}

// Edit memory
function editMemory(id, from, message) {
  document.getElementById('editMemoryIndex').value = id;
  document.getElementById('editFrom').value = unescapeHtml(from);
  document.getElementById('editMessage').value = unescapeHtml(message);
  editModal.classList.add('active');
}

// Edit memory form
document.getElementById('editMemoryForm').addEventListener('submit', async e => {
  e.preventDefault();

  const id = document.getElementById('editMemoryIndex').value;
  const from = document.getElementById('editFrom').value;
  const message = document.getElementById('editMessage').value;

  try {
    const response = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, message }),
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      editModal.classList.remove('active');
      loadMemories();
    } else {
      showMessage(document.getElementById('editMessage'), data.message || 'Update failed', 'error');
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    showMessage(
      document.getElementById('editMessage'),
      'Update failed. Please try again.',
      'error'
    );
  }
});

// Delete memory
async function deleteMemory(id) {
  if (!confirm('Are you sure you want to delete this memory?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/memories/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const data = await response.json();

    if (data.success) {
      loadMemories();
    } else {
      alert(data.message || 'Delete failed');
    }
  } catch (error) {
    console.error('Error deleting memory:', error);
    alert('Delete failed. Please try again.');
  }
}

// Check auth status
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE}/status`, {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.isAuthenticated) {
      showDashboard();
    } else {
      showLogin();
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    showLogin();
  }
}

// Show login
function showLogin() {
  loginContainer.style.display = 'flex';
  dashboardContainer.style.display = 'none';
}

// Show dashboard
async function showDashboard() {
  loginContainer.style.display = 'none';
  dashboardContainer.style.display = 'block';

  // Load sequentially to avoid race conditions
  try {
    await loadGallery();
  } catch (error) {
    console.error('Gallery load failed:', error);
  }

  try {
    await loadMemories();
  } catch (error) {
    console.error('Memories load failed:', error);
  }
}

// Show message
function showMessage(container, message, type) {
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

// HTML escape/unescape
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function unescapeHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent;
}

// Modal close handlers
closeModal.addEventListener('click', () => {
  editModal.classList.remove('active');
});

closePhotoModal.addEventListener('click', () => {
  editPhotoModal.classList.remove('active');
});

closeCropModal.addEventListener('click', () => {
  cropModal.classList.remove('active');
  document.getElementById('cropCaption').value = '';
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  uploadForm.reset();
});

document.getElementById('cancelEdit').addEventListener('click', () => {
  editModal.classList.remove('active');
});

document.getElementById('cancelPhotoEdit').addEventListener('click', () => {
  editPhotoModal.classList.remove('active');
});

// Close modal on outside click
window.addEventListener('click', e => {
  if (e.target === editModal) {
    editModal.classList.remove('active');
  }
  if (e.target === editPhotoModal) {
    editPhotoModal.classList.remove('active');
  }
  if (e.target === cropModal) {
    cropModal.classList.remove('active');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    uploadForm.reset();
  }
});

// Note: Memory photo editing removed - visitors crop photos when submitting

// Drag and Drop functionality for gallery reordering
let draggedElement = null;

function initializeDragAndDrop() {
  const items = document.querySelectorAll('.gallery-admin-item');

  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('dragend', handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(_e) {
  if (this !== draggedElement) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave(_e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }

  if (draggedElement !== this) {
    // Swap elements
    const allItems = [...galleryList.querySelectorAll('.gallery-admin-item')];
    const draggedIndex = allItems.indexOf(draggedElement);
    const targetIndex = allItems.indexOf(this);

    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedElement, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedElement, this);
    }

    // Save new order to server
    savePhotoOrder();
  }

  this.classList.remove('drag-over');
  return false;
}

function handleDragEnd(_e) {
  this.classList.remove('dragging');

  const items = document.querySelectorAll('.gallery-admin-item');
  items.forEach(item => {
    item.classList.remove('drag-over');
  });
}

// Expose functions called from inline onclick= handlers in HTML.
// Without these assignments, bundlers/linters can't see the usage.
window.editPhoto = editPhoto;
window.deletePhoto = deletePhoto;
window.editMemory = editMemory;
window.deleteMemory = deleteMemory;

async function savePhotoOrder() {
  const items = [...galleryList.querySelectorAll('.gallery-admin-item')];
  const photoOrders = items.map((item, index) => ({
    id: parseInt(item.dataset.id),
    order: index + 1
  }));

  try {
    const response = await fetch(`${API_BASE}/gallery/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoOrders }),
      credentials: 'include'
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Failed to save order:', data.message);
      // Reload gallery to restore correct order
      loadGallery();
    }
  } catch (error) {
    console.error('Error saving photo order:', error);
    // Reload gallery to restore correct order
    loadGallery();
  }
}
