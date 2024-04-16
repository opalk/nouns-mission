const { db } = require('../db/dbconfig.js');

async function getNouns(req, res) {
  const limit = parseInt(req.query.limit) || 100; // Limit of 100 items per request
  const offset = parseInt(req.query.offset) || 0; // Offset of 0 (first 100)

  try {
    const total = await db('nouns').count('id as total').first().total;
    const nouns = await db('nouns')
      .select('id', 'name')
      .limit(limit)
      .offset(offset);
    console.log(`Fetched nouns (limit: ${limit}, offset: ${offset}):`, nouns); // Log fetched nouns with limit and offset
    res.json({ nouns, total });
  } catch (error) {
    console.error('Error fetching nouns:', error);
    res.status(500).json({ message: 'Error retrieving nouns' });
  }
}

async function updateNouns(req, res) {
  const changes = req.body.changes;
  if (!changes || !Array.isArray(changes)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const pageSize = 100;
    const pageCount = Math.ceil(changes.length / pageSize);
    const errors = [];

    for (let page = 0; page < pageCount; page++) {
      const start = page * pageSize;
      const end = Math.min((page + 1) * pageSize, changes.length);
      const pageChanges = changes.slice(start, end);

      console.log(`Processing page ${page + 1} of ${pageCount} (changes: ${pageChanges.length})`); // Log page processing info

      const existingNouns = await db('nouns').select('name');

      await Promise.all(pageChanges.map(async (change) => {
        if (change.startsWith('-')) {
          const nounToRemove = change.substring(1);
          await db('nouns').where('name', nounToRemove).del();
        } else {
          const newNoun = change.trim();
          if (newNoun.length > 30) {
            errors.push(`Noun "${newNoun}" exceeds maximum length of 30 characters`);
          } else if (existingNouns.some(noun => noun.name === newNoun)) {
            errors.push(`Noun "${newNoun}" already exists`);
          } else {
            await db('nouns').insert({ name: newNoun });
            console.log(`Inserted new noun: ${newNoun}`); // Log successful new noun insertion
          }
        }
      }));
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    console.log('Nouns updated successfully'); // Log successful update
    res.json({ message: 'Nouns updated successfully' });
  } catch (error) {
    console.error('Error updating nouns:', error);
    res.status(500).json({ error: 'Failed to update nouns in database' });
  }
}

module.exports = { getNouns, updateNouns };
