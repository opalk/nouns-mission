// validation.js

function validateRequestBody(req, res) {
    const changes = req.body.changes;
    if (!changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
  }
  
  function validateNounLength(req, res) {
    const changes = req.body.changes;
    const errors = [];
    for (let change of changes) {
      const newNoun = change.trim();
      if (newNoun.length > 30) {
        errors.push(`Noun "${newNoun}" exceeds maximum length of 30 characters`);
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  }
  
  async function validateNounExistence(req, res) {
    const changes = req.body.changes;
    const existingNouns = req.existingNouns;
    const errors = [];
    for (let change of changes) {
      const newNoun = change.trim();
      if (existingNouns.some(noun => noun.name === newNoun)) {
        errors.push(`Noun "${newNoun}" already exists`);
      }
    }
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  }
  
  export { validateRequestBody, validateNounLength, validateNounExistence };