// validations/validation.js

import db from '../db/dbconfig.js';

async function validateRequestBody(req, res) {
  const changes = req.body.changes;
  if (!changes || !Array.isArray(changes)) {
    res.status(400).json({ error: 'Invalid request body' });
    return false;
  }
  return true;
}

async function validateNounLength(noun) {
  if (noun.length > 30) {
    return `Noun "${noun}" exceeds maximum length of 30 characters`;
  }
  return null;
}

// async function validateNounExistence(noun) {
//   const existingNouns = await db('nouns').select('name');
//   if (existingNouns.some(existingNoun => existingNoun.name.toLowerCase() === noun.toLowerCase())) {
//     return `Noun "${noun}" already exists`;
//   }
//   return null;
// }

export { validateRequestBody, validateNounLength };
