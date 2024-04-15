const { db } = require('../db/dbconfig.js');

async function getNouns(req, res) {
  try {
    const nouns = await db('nouns').select('id', 'name');
    res.json(nouns);
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
    let origin = await db('nouns').select();
    let maxId = origin.reduce((max, noun) => Math.max(max, noun.id), 0);

    for (const change of changes) {
      if (change.startsWith('-')) {
        const indexToRemove = origin.findIndex(obj => obj.name === change.substring(1));
        if (indexToRemove !== -1) {
          origin.splice(indexToRemove, 1);
        }
      } else {
        const newNoun = change.trim();
        if (newNoun.length > 30) {
          return res.status(400).json({ error: `Noun "${newNoun}" exceeds maximum length of 30 characters` });
        }
        if (origin.some(obj => obj.name === newNoun)) {
          return res.status(400).json({ error: `Noun "${newNoun}" already exists` });
        }
        origin.push({ id: ++maxId, name: newNoun });
      }
    }

  
    res.json({ message: 'Nouns updated successfully'});
  } catch (error) {
    console.error('Error updating nouns:', error);
    res.status(500).json({ error: 'Failed to update nouns in database' });
  }
}

module.exports = { getNouns, updateNouns };
