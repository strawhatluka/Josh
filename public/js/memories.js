// API endpoint
const API_URL = '/api/memories';

// DOM elements
const form = document.getElementById('memoryForm');
const fromInput = document.getElementById('from');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('charCount');
const formMessage = document.getElementById('formMessage');
const memoriesList = document.getElementById('memoriesList');
const submitBtn = document.getElementById('submitBtn');
const photoInput = document.getElementById('photo');
const cropModal = document.getElementById('cropModal');
const closeCropModal = document.querySelector('.close-crop');

// Cropper variables
let cropper = null;
let selectedFile = null;
let croppedBlob = null;

// Character counter
messageInput.addEventListener('input', () => {
  const count = messageInput.value.length;
  charCount.textContent = count;

  charCount.classList.remove('warning', 'error');
  if (count > 9000) {
    charCount.classList.add('error');
  } else if (count > 7500) {
    charCount.classList.add('warning');
  }
});

/**
 * Displays a message to the user
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showMessage(message, type) {
  formMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
  setTimeout(() => {
    formMessage.innerHTML = '';
  }, 5000);
}

/**
 * Submits a memory message to the backend
 * @param {FormData} formData - FormData with from, message, and optional photo
 * @returns {Promise<Response>}
 * @throws {ValidationError} If character limit exceeded or fields empty
 */
async function submitMemory(formData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Submission failed');
    }

    return data;
  } catch (error) {
    console.error('Error submitting memory:', error);
    throw error;
  }
}

/**
 * Loads and displays all memories
 * @param {HTMLElement} container - DOM element to render memories
 * @returns {Promise<void>}
 * @throws {NetworkError} If fetch fails
 */
async function loadMemories(container) {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to load memories');
    }

    displayMemories(data.memories, container);
  } catch (error) {
    console.error('Error loading memories:', error);
    container.innerHTML =
      '<div class="message error">Failed to load memories. Please refresh the page.</div>';
  }
}

/**
 * Displays memories in the DOM
 * @param {Array} memories - Array of memory objects
 * @param {HTMLElement} container - Container element
 */
function displayMemories(memories, container) {
  if (!memories || memories.length === 0) {
    container.innerHTML =
      '<p class="text-center">No memories shared yet. Be the first to share a memory.</p>';
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
        ? `<div class="memory-photo"><img src="${memory.photo}" alt="Memory photo" loading="lazy"></div>`
        : '';

      return `
      <div class="memory-card">
        <div class="memory-from">${escapeHtml(memory.from)}</div>
        <div class="memory-message">${escapeHtml(memory.message)}</div>
        ${photoHtml}
        <div class="memory-date">${date}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = html;
}

/**
 * Escapes HTML to prevent XSS (double protection)
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Photo file input change handler - show crop modal
photoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  selectedFile = file;
  const reader = new FileReader();

  reader.onload = event => {
    const image = document.getElementById('cropImage');
    image.src = event.target.result;
    cropModal.classList.add('active');

    if (cropper) {
      cropper.destroy();
    }

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

// Confirm crop
document.getElementById('cropConfirm').addEventListener('click', () => {
  if (!cropper) return;

  const canvas = cropper.getCroppedCanvas();
  canvas.toBlob(
    blob => {
      croppedBlob = blob;
      cropModal.classList.remove('active');
      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
      // Show user feedback that photo is ready
      showMessage('Photo ready! Fill out your message and click Share Memory.', 'success');
    },
    'image/jpeg',
    0.9
  );
});

// Cancel crop
document.getElementById('cancelCrop').addEventListener('click', () => {
  cropModal.classList.remove('active');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  photoInput.value = '';
  croppedBlob = null;
});

// Close crop modal
closeCropModal.addEventListener('click', () => {
  cropModal.classList.remove('active');
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  photoInput.value = '';
  croppedBlob = null;
});

// Close modal on outside click
window.addEventListener('click', e => {
  if (e.target === cropModal) {
    cropModal.classList.remove('active');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    photoInput.value = '';
    croppedBlob = null;
  }
});

// Form submission handler
form.addEventListener('submit', async e => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('from', fromInput.value.trim());
  formData.append('message', messageInput.value.trim());

  // Add cropped photo if available
  if (croppedBlob) {
    formData.append('photo', croppedBlob, selectedFile.name);
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    await submitMemory(formData);

    showMessage('Thank you for sharing your memory.', 'success');

    // Reset form
    form.reset();
    charCount.textContent = '0';
    charCount.classList.remove('warning', 'error');
    croppedBlob = null;
    selectedFile = null;

    // Reload memories
    await loadMemories(memoriesList);
  } catch (error) {
    showMessage(error.message || 'Failed to submit. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Share Memory';
  }
});

// Load memories on page load
document.addEventListener('DOMContentLoaded', () => {
  loadMemories(memoriesList);
});
