import { getNounsFromDB, getNounsDB, insertNounIntoDB, removeNounFromDB } from '../db/DBcalling.js';
import { validateRequestBody, validateNounLength } from '../validations/validation.js';

// Default values for pagination and array length
const PAGE_LIMIT = parseInt(process.env.PAGE_LIMIT) || 100;
const MAX_ARRAY_LENGTH = parseInt(process.env.MAX_ARRAY_LENGTH) || 5000;

/**
 * Get paginated list of nouns.
 * Pagination is implemented to loop through all pages and process accordingly.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getNouns(req, res) {
  // Parse page number from query parameter, default to 1 if not provided
  const page = parseInt(req.query.page) || 1;

  try {
    // Fetch total count of nouns and paginated list of nouns
    const { nouns, total } = await getNounsFromDB(page, MAX_ARRAY_LENGTH);

    if (total > MAX_ARRAY_LENGTH) {
      // Calculate total pages based on PAGE_LIMIT
      const pageCount = Math.ceil(total / PAGE_LIMIT);

      // Validate page number
      if (page <= 0 || page > pageCount) {
        return res.status(400).json({ message: `Invalid page number. Must be between 1 and ${pageCount}` });
      }

      // Return paginated list of nouns
      res.json({ nouns, total, pageCount });
    } else {
      // Fetch all nouns if total is less than or equal to limit
      res.json({ nouns });
    }
  } catch (error) {
    console.error('Error fetching nouns:', error);
    res.status(500).json({ message: 'Error retrieving nouns' });
  }
}

/**
 * Update nouns based on changes provided in the request body.
 * Performs validations on changes array, checks for existing nouns,
 * and paginates the changes if necessary.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateNouns(req, res) {
  // Checking request body validation
  if (!validateRequestBody(req, res)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    // Ensure changes is an array, even if only one item is provided
    const changes = Array.isArray(req.body) ? req.body : [req.body];

    // Fetch all nouns or paginated nouns based on array length
    const allNouns = await getNounsDB(1, MAX_ARRAY_LENGTH);
    const usePagination = allNouns.length > MAX_ARRAY_LENGTH;
    let nouns;

    if (usePagination) {
      // Use pagination if necessary
      const page = parseInt(req.query.page) || 1;
      nouns = await getNounsDB(page, PAGE_LIMIT);
    } else {
      // Use all nouns if array length is within limit
      nouns = allNouns;
    }

    // Create a set of existing noun names for efficient lookup
    const existingNouns = new Set(nouns.map(noun => noun.name));

    // Calculate page count if pagination is used
    const pageCount = usePagination ? Math.ceil(allNouns.length / PAGE_LIMIT) : 1;
    const errors = [];

    // Loop through each page of changes
    for (let page = 0; page < pageCount; page++) {
      const start = usePagination ? page * PAGE_LIMIT : 0;
      const end = usePagination ? Math.min((page + 1) * PAGE_LIMIT, allNouns.length) : allNouns.length;
      const pageChanges = changes.slice(start, end);

      console.log(`Processing page ${page + 1} of ${pageCount} (changes: ${pageChanges.length})`);

      // Process each change in the current page
      for (const change of pageChanges) {
        const trimmedChange = change.trim();

        // Validate the length of the change
        const lengthError = await validateNounLength(trimmedChange);
        if (lengthError) {
          errors.push(lengthError);
        } else {
          // Check if the change already exists
          const existingNoun = existingNouns.has(trimmedChange.toLowerCase());
          if (existingNoun) {
            errors.push(`Noun '${trimmedChange}' already exists`);
          } else {
            // Perform the appropriate action based on the change
            if (trimmedChange.startsWith('-')) {
              // If change starts with '-', remove the noun
              const nounToRemove = trimmedChange.substring(1);
              await removeNounFromDB(nounToRemove);
            } else {
              // Otherwise, insert the new noun
              await insertNounIntoDB(trimmedChange);
              console.log(`Inserted new noun: ${trimmedChange}`);
            }
          }
        }
      }
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Respond with success message
    console.log('Nouns updated successfully');
    res.json({ message: 'Nouns updated successfully' });
  } catch (error) {
    console.error('Error updating nouns:', error);
    res.status(500).json({ message: 'Error updating nouns' });
  }
}

// Export the functions for use in routes
export { getNouns, updateNouns };
