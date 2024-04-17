// controllers/controller.js

import db from '../db/dbconfig.js';
import { validateRequestBody, validateNounLength, validateNounExistence } from '../validations/validation.js';

// Load environment variables
const PAGE_LIMIT = process.env.PAGE_LIMIT || 100;

async function getNouns(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided

  try {
    const total = await db('nouns').count('id as total').first().total;
    const pageCount = Math.ceil(total / PAGE_LIMIT);

    // Calculate offset based on page number
    const offset = (page - 1) * PAGE_LIMIT;

    const nouns = await db('nouns')
      .select('id', 'name')
      .limit(PAGE_LIMIT)
      .offset(offset);
      
    console.log(`Fetched nouns (page: ${page}, page size: ${PAGE_LIMIT}):`, nouns); // Log fetched nouns with page and page size
    res.json({ nouns, total, pageCount });
  } catch (error) {
    console.error('Error fetching nouns:', error);
    res.status(500).json({ message: 'Error retrieving nouns' });
  }
}

async function updateNouns(req, res) {
  // Validate request body
  if (!validateRequestBody(req, res)) {
    return;
  }

  const changes = req.body.changes;
  const pageSize = 100;
  const pageCount = Math.ceil(changes.length / pageSize);
  const errors = [];

  for (let page = 0; page < pageCount; page++) {
    const start = page * pageSize;
    const end = Math.min((page + 1) * pageSize, changes.length);
    const pageChanges = changes.slice(start, end);

    console.log(`Processing page ${page + 1} of ${pageCount} (changes: ${pageChanges.length})`); // Log page processing info

    const existingNouns = await db('nouns').select('name');

    for (const change of pageChanges) {
      if (change.startsWith('-')) {
        const nounToRemove = change.substring(1);
        await db('nouns').where('name', nounToRemove).del();
      } else {
        const newNoun = change.trim();
        const lengthError = await validateNounLength(newNoun);
        const existenceError = await validateNounExistence(newNoun);

        if (lengthError) {
          errors.push(lengthError);
        } else if (existenceError) {
          errors.push(existenceError);
        } else {
          await db('nouns').insert({ name: newNoun });
          console.log(`Inserted new noun: ${newNoun}`); // Log successful new noun insertion
        }
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  console.log('Nouns updated successfully'); // Log successful update
  res.json({ message: 'Nouns updated successfully' });
}

export { getNouns, updateNouns };
