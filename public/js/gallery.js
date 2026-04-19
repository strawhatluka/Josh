/**
 * Implements lazy loading for gallery images
 * @param {Object} config - { threshold: number, rootMargin: string }
 * @returns {IntersectionObserver}
 */
function initLazyLoad(config = {}) {
  const defaultConfig = {
    threshold: 0.1,
    rootMargin: '50px'
  };

  const observerConfig = { ...defaultConfig, ...config };

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');

        if (src) {
          img.src = src;
          img.removeAttribute('data-src');

          img.addEventListener('load', () => {
            img.style.opacity = '0';
            setTimeout(() => {
              img.style.transition = 'opacity 0.3s ease-in';
              img.style.opacity = '1';
            }, 10);
          });

          img.addEventListener('error', () => {
            img.alt = 'Image not found';
            img.style.backgroundColor = '#f3f4f6';
          });

          observer.unobserve(img);
        }
      }
    });
  }, observerConfig);

  return imageObserver;
}

/**
 * Loads gallery photos from API
 */
async function loadGalleryPhotos() {
  const galleryContainer = document.getElementById('gallery');

  if (!galleryContainer) return;

  try {
    const response = await fetch('/api/gallery');
    const data = await response.json();

    if (data.success && data.photos && data.photos.length > 0) {
      displayGalleryPhotos(data.photos, galleryContainer);
    } else {
      galleryContainer.innerHTML = '<p class="text-center">Gallery coming soon...</p>';
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
    galleryContainer.innerHTML = '<p class="text-center">Gallery coming soon...</p>';
  }
}

/**
 * Displays gallery photos in the DOM
 */
function displayGalleryPhotos(photos, container) {
  const html = photos
    .map(
      photo => `
    <div class="gallery-item">
      <img data-src="${photo.photo_url}" alt="${photo.caption || 'Photo'}">
      <div class="gallery-caption">
        ${photo.caption || ''}
      </div>
    </div>
  `
    )
    .join('');

  container.innerHTML = html;

  // Initialize lazy loading after photos are added
  initLazyLoadingForImages();
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoadingForImages() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const observer = initLazyLoad();

    images.forEach(img => {
      observer.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.src = src;
        img.removeAttribute('data-src');
      }
    });
  }
}

// Load gallery when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadGalleryPhotos();
});
