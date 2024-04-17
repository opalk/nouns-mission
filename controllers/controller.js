// controllers/controller.js

import db from '../db/dbconfig.js';
import { validateRequestBody, validateNounLength, validateNounExistence } from '../validation.js';

async function getNouns(req, res) {
  const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
  const limitPerPage = process.env.PAGE_LIMIT ; 

  try {
    const total = await db('nouns').count('id as total').first().total;
    const offset = (page - 1) * limitPerPage;

    const nouns = await db('nouns')
      .select('id', 'name')
      .limit(limitPerPage)
      .offset(offset);
      console.log(`Fetched nouns (page: ${page}, limit per page: ${limitPerPage}):`, nouns); // Log fetched nouns with page and limit per page
      res.json({ nouns, total });
    } catch (error) {
      console.error('Error fetching nouns:', error);
      res.status(500).json({ message: 'Error retrieving nouns' });
    }
  }

async function updateNouns(req, res) {
  try {
    validateRequestBody(req, res);
    validateNounLength(req, res);
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

      req.existingNouns = existingNouns; // Pass existing nouns to the request object

      validateNounExistence(req, res);

      await Promise.all(pageChanges.map(async (change) => {
        if (change.startsWith('-')) {
          const nounToRemove = change.substring(1);
          await db('nouns').where('name', nounToRemove).del();
        } else {
          const newNoun = change.trim();
          await db('nouns').insert({ name: newNoun });
          console.log(`Inserted new noun: ${newNoun}`); // Log successful new noun insertion
        }
      }));
    }

    console.log('Nouns updated successfully'); // Log successful update
    res.json({ message: 'Nouns updated successfully' });
  } catch (error) {
    console.error('Error updating nouns:', error);
    res.status(500).json({ error: 'Failed to update nouns in database' });
  }
}

export { getNouns, updateNouns };