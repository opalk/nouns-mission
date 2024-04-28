import db from '../db/dbconfig.js';

/**
 * Validate the request body to ensure it's an array.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {boolean} - True if valid, false otherwise
 */
async function validateRequestBody(req, res) {
  const changes = req.body;
  if (!Array.isArray(changes)) {
    res.status(400).json({ error: 'Invalid request body, expected an array' });
    return false;
  }
  return true;
}

/**
 * Validate the length of a noun.
 * @param {string} noun - The noun to validate
 * @returns {string|null} - An error message if the length exceeds 30 characters, otherwise null
 */
async function validateNounLength(noun) {
  if (noun.length > 30) {
    return `Noun "${noun}" exceeds maximum length of 30 characters`;
  }
  return null;
}

/**
 * Validate if the page number is a valid positive integer.
 *
 * @param {number} page - Page number to check
 * @param {number} pageCount - Total number of pages
 * @returns {boolean} Whether the page number is valid
 */
function validatePage(page, pageCount) {
    // Regular expression to match a positive integer
    const validPageRegex = /^[1-9]\d*$/;
    return validPageRegex.test(page.toString()) && page <= pageCount;
  }
  
  /**
   * Validate the request page parameter.
   *
   * @param {number} page - Page number to validate
   * @param {number} pageCount - Total number of pages
   * @returns {string|null} Error message if validation fails, otherwise null
   */
//   function validatePageParameter(page, pageCount) {
//     if (!validatePage(page, pageCount)) {
//       return `Invalid page number. Must be an integer between 1 and ${pageCount}`;
//     }
//     return null;
//   }

function validatePageParameter(page) {
    // Attempt to parse page as an integer (base 10)
    const parsedPage = parseInt(page, 10);
  
    // Check if parsing failed or resulted in NaN
    if (isNaN(parsedPage) || !Number.isInteger(parsedPage)) {
      return { isValid: false, message: 'Invalid page number. Must be a positive integer.' };
    }
  
    // Check if the parsed value is positive
    if (parsedPage <= 0) {
      return { isValid: false, message: 'Invalid page number. Must be a positive integer.' };
    }
  
    // You can add further validation here, such as checking for maximum allowed page number
    // based on your application logic (optional)
  
    return { isValid: true, page: parsedPage }; // Return parsed page as well if needed
  }
// /**
//  * Validate if a noun already exists in the database (case insensitive).
//  * @param {string} noun - The noun to check
//  * @returns {Promise<string|null>} - An error message if the noun already exists, otherwise null
//  */
// async function validateNounExistence(noun) {
//   const existingNoun = await db('nouns')
//     .whereRaw('LOWER(name) = ?', [noun.toLowerCase()])
//     .first();

//   if (existingNoun) {
//     return `Noun '${noun}' already exists (case insensitive)`;
//   }

//   return null;
// }

export { validateRequestBody, validateNounLength,validatePageParameter};
