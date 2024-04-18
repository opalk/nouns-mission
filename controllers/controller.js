// controllers/controller.js

import db from '../db/dbconfig.js';
import { validateRequestBody, validateNounLength } from '../validations/validation.js';

// Load environment variables
const PAGE_LIMIT = process.env.PAGE_LIMIT || 100;
const MAX_ARRAY_LENGTH = process.env.MAX_ARRAY_LENGTH || 5000;

async function getNouns(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided

  try {
    // Check if total nouns exceed limit
    const total = await db('nouns').count('id as total').first().total;
    if (total > MAX_ARRAY_LENGTH) {
      const pageCount = Math.ceil(total / PAGE_LIMIT);

      // Calculate offset based on page number
      const offset = (page - 1) * PAGE_LIMIT;

      const nouns = await db('nouns')
        .select('id', 'name')
        .limit(PAGE_LIMIT)
        .offset(offset);

      console.log(`Fetched nouns (page: ${page}, page size: ${PAGE_LIMIT}):`, nouns);
      res.json({ nouns, total, pageCount });
    } else {
      // Fetch all nouns if total is less than limit
      const nouns = await db('nouns').select('id', 'name');
      console.log(`Fetched all nouns (total: ${nouns.length})`);
      res.json({ nouns });
    }
  } catch (error) {
    console.error('Error fetching nouns:', error);
    res.status(500).json({ message: 'Error retrieving nouns' });
  }
}



async function updateNouns(req, res) {
  if (!validateRequestBody(req, res)) {
    return;
  }

  try {
    const changes = req.body.changes;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * PAGE_LIMIT;

    const allNouns = await db('nouns').select('id', 'name');
    const usePagination = allNouns.length > parseInt(process.env.MAX_ARRAY_LENGTH);

    let nouns;
    if (usePagination) {
      nouns = await db('nouns')
        .select('id', 'name')
        .limit(PAGE_LIMIT)
        .offset(offset);
    } else {
      nouns = allNouns;
    }

    // Fetch all existing nouns from the database
    const existingNouns = new Set(allNouns.map(noun => noun.name));

    const pageCount = usePagination ? Math.ceil(allNouns.length / PAGE_LIMIT) : 1;
    const errors = [];

    for (let page = 0; page < pageCount; page++) {
      const start = usePagination ? page * PAGE_LIMIT : 0;
      const end = usePagination ? Math.min((page + 1) * PAGE_LIMIT, allNouns.length) : allNouns.length;
      const pageChanges = changes.slice(start, end);

      console.log(`Processing page ${page + 1} of ${pageCount} (changes: ${pageChanges.length})`);

      for (const change of pageChanges) {
        if (change.startsWith('-')) {
          const nounToRemove = change.substring(1);
          await db('nouns').where('name', nounToRemove).del();
        } else {
          const newNoun = change.trim();
          const lengthError = await validateNounLength(newNoun);
          
          if (lengthError) {
            errors.push(lengthError);
          } else if (existingNouns.has(newNoun)) {
            errors.push(`Noun '${newNoun}' already exists`);
          } else {
            await db('nouns').insert({ name: newNoun });
            console.log(`Inserted new noun: ${newNoun}`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    console.log('Nouns updated successfully');
    res.json({ message: 'Nouns updated successfully' });
  } catch (error) {
    console.error('Error updating nouns:', error);
    res.status(500).json({ message: 'Error updating nouns' });
  }
}


export { getNouns, updateNouns };