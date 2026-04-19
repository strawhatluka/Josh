const { sql } = require('../db');

/**
 * Reads all gallery photos from Postgres database
 * @returns {Promise<Array>}
 */
async function readGallery() {
  try {
    const { rows } = await sql`
      SELECT
        id,
        filename,
        photo_url,
        caption,
        display_order as order
      FROM gallery
      ORDER BY display_order ASC
    `;

    return rows;
  } catch (error) {
    console.error('Error reading gallery:', error);
    throw new Error('Failed to read gallery');
  }
}

/**
 * Adds a new photo to gallery
 * @param {Object} photo - { filename, photoUrl, caption }
 * @returns {Promise<Object>}
 */
async function addPhoto(photo) {
  try {
    const { filename, photoUrl, caption } = photo;

    // Get the max order value to add to the end
    const { rows: orderRows } = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order FROM gallery
    `;
    const maxOrder = orderRows[0].max_order;

    const { rows } = await sql`
      INSERT INTO gallery (filename, photo_url, caption, display_order)
      VALUES (${filename}, ${photoUrl}, ${caption || ''}, ${maxOrder + 1})
      RETURNING
        id,
        filename,
        photo_url,
        caption,
        display_order as order
    `;

    return rows[0];
  } catch (error) {
    console.error('Error adding photo:', error);
    throw new Error('Failed to add photo');
  }
}

/**
 * Updates a photo's caption
 * @param {string|number} id - Photo ID
 * @param {Object} updates - { caption }
 * @returns {Promise<Object>}
 */
async function updatePhoto(id, updates) {
  try {
    const { caption } = updates;

    const { rows } = await sql`
      UPDATE gallery
      SET caption = ${caption}
      WHERE id = ${id}
      RETURNING
        id,
        filename,
        photo_url,
        caption,
        display_order as order
    `;

    if (rows.length === 0) {
      throw new Error('Photo not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error updating photo:', error);
    throw error;
  }
}

/**
 * Deletes a photo from gallery
 * @param {number} id - Photo ID
 * @returns {Promise<Object>} - Deleted photo data
 */
async function deletePhoto(id) {
  try {
    const { rows } = await sql`
      DELETE FROM gallery
      WHERE id = ${id}
      RETURNING
        id,
        filename,
        photo_url,
        caption,
        display_order as order
    `;

    if (rows.length === 0) {
      throw new Error('Photo not found');
    }

    return rows[0];
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
}

/**
 * Updates photo order/positions
 * @param {Array<{id: number, order: number}>} photoOrders - Array of photo IDs and their new orders
 * @returns {Promise<void>}
 */
async function updatePhotoOrder(photoOrders) {
  try {
    // Update all orders sequentially
    for (const { id, order } of photoOrders) {
      await sql`
        UPDATE gallery
        SET display_order = ${order}
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    console.error('Error updating photo order:', error);
    throw new Error('Failed to update photo order');
  }
}

module.exports = {
  readGallery,
  addPhoto,
  updatePhoto,
  deletePhoto,
  updatePhotoOrder
};
