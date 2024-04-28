import { getNounsFromDB, getNounsDB, insertNounIntoDB, removeNounFromDB } from '../db/DBcalling.js';
import { validateRequestBody, validateNounLength, validatePageParameter} from '../validations/validation.js';

// Default values for pagination and array length
const PAGE_LIMIT = parseInt(process.env.PAGE_LIMIT) || 100;
const MAX_ARRAY_LENGTH = parseInt(process.env.MAX_ARRAY_LENGTH) || 2000;

/**
 * Get paginated list of nouns.
 * Pagination is implemented to loop through all pages and process accordingly.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getNouns(req, res) {
  // Parse page number from query parameter, default to 1 if not provided
  const page = req.query.page || 1;

  // Validate the page parameter
  const pageValidation = validatePageParameter(page);
  if (!pageValidation.isValid) {
    return res.status(400).json({ message: pageValidation.message });
  }

  // Check if the parsed page matches the original string
  if (String(pageValidation.page) !== page) {
    return res.status(400).json({ message: 'Invalid page number. Must be a positive integer.' });
  }

  try {
    // Fetch total count of nouns and paginated list of nouns
    const { nouns, total } = await getNounsFromDB(page, MAX_ARRAY_LENGTH);
    console.log(total);
    console.log(page);

    if (total > MAX_ARRAY_LENGTH) {
      // Calculate total pages based on PAGE_LIMIT
      const pageCount = Math.ceil(total / PAGE_LIMIT);

       // Validate page number
      if (pageValidation.page > pageCount) {
        return res.status(400).json({ message: `Invalid page number. Must be an integer between 1 and ${pageCount}` });
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

    // Validate length of each change before database operations
    const lengthErrors = [];
    for (const change of changes) {
      const trimmedChange = change.trim();
      const lengthError = await validateNounLength(trimmedChange);
      if (lengthError) {
        lengthErrors.push(lengthError);
      }
    }

    if (lengthErrors.length > 0) {
      return res.status(400).json({ errors: lengthErrors });
    }

    // Fetch all nouns
    const allNouns = await getNounsDB(1, Infinity); // Fetch all without pagination

    // Create a set of existing noun names for efficient lookup
    const existingNouns = new Set(allNouns.map(noun => noun.name.toLowerCase()));

    let start = 0;
    let end = Math.min(PAGE_LIMIT, allNouns.length);

    const processedStrings = new Set(); // Keep track of processed strings across all chunks
    let errors = [];

    while (start < allNouns.length) {
      const pageNouns = allNouns.slice(start, end);

      for (const change of changes) {
        const trimmedChange = change.trim();

        // Check if the change already exists
        const existingNoun = existingNouns.has(trimmedChange.toLowerCase());
        if (existingNoun) {
          // errors.push(`Noun '${trimmedChange}' already exists`);
        } else if (processedStrings.has(trimmedChange.toLowerCase())) {
          errors.push(`Noun '${trimmedChange}'  update successfully`);
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

          // Add the processed string to the set
          processedStrings.add(trimmedChange.toLowerCase());
        }
      }

      // Moving to the next chunk
      start = end;
      end = Math.min(end + PAGE_LIMIT, allNouns.length);
    }

    // Filter out duplicate errors
    errors = errors.filter((error, index) => errors.indexOf(error) === index);

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
