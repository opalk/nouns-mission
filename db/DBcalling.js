import db from './dbconfig.js';

async function getNounsFromDB(page, limit) {
  const offset = (page - 1) * limit;
  return await db('nouns')
    .select('id', 'name')
    .limit(limit)
    .offset(offset);
}

async function updateNounsInDB(changes) {
    try {
      await Promise.all(changes.map(async (change) => {
        if (change.startsWith('-')) {
          const nounToRemove = change.substring(1);
          await db('nouns').where('name', nounToRemove).del();
        } else {
          const newNoun = change.trim();
          await db('nouns').insert({ name: newNoun });
        }
      }));
      console.log('Nouns updated successfully');
      return { success: true, message: 'Nouns updated successfully' };
    } catch (error) {
      console.error('Error updating nouns:', error);
      return { success: false, error: 'Failed to update nouns in database' };
    }
  }

async function fetchNounsFromDB(page, pageSize) {
  const offset = page * pageSize;
  return await db('nouns')
    .select('name')
    .limit(pageSize)
    .offset(offset);
}

export { getNounsFromDB, updateNounsInDB, fetchNounsFromDB };