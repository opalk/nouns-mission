import db from './dbconfig.js';

/**
 * Get paginated list of nouns from the database with total count.
 * 
 * @param {number} page - Page number
 * @param {number} limit - Number of items per page
 * @returns {Promise<{ nouns: Array, total: number }>} - Array of nouns for the page and total count
 */
async function getNounsFromDB(page, limit) {
    const offset = (page - 1) * limit;
  
    // Fetch total count
    const totalCountResult = await db('nouns').count('id as totalCount').first();
    const totalCount = parseInt(totalCountResult.totalCount);
  
    // Fetch paginated data
    const nouns = await db('nouns')
      .select('id', 'name')
      .limit(limit)
      .offset(offset);
  
    return { nouns, total: totalCount };
  }
  
/**
 * Get paginated list of nouns from the database ,for updatenouns to work (nouns now get as array)
 * 
 * @param {number} page - Page number
 * @param {number} limit - Number of items per page
 * @returns {Promise<Array>} - Array of nouns for the page
 */
async function getNounsDB(page, limit) {
    const offset = (page - 1) * limit;
  
    // Fetch paginated data without total count
    return db('nouns')
      .select('id', 'name')
      .limit(limit)
      .offset(offset);
  }

/**
 * Insert a new noun into the database.
 * 
 * @param {string} noun - The noun to insert
 * @returns {Promise<void>} - Promise indicating success or failure
 */
async function insertNounIntoDB(noun) {
  return db('nouns').insert({ name: noun });
}

/**
 * Remove a noun from the database.
 * 
 * @param {string} noun - The noun to remove
 * @returns {Promise<void>} - Promise indicating success or failure
 */
async function removeNounFromDB(noun) {
  return db('nouns').where('name', noun).del();
}

// Export the functions for use in other files
export { getNounsFromDB, getNounsDB, insertNounIntoDB, removeNounFromDB };
