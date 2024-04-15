const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const knex = require('knex');
const dotenv = require('dotenv');


dotenv.config();

//connect to db mysql
const db = knex({
  client: 'mysql',
  connection: {
    host: '100.100.100.101',
    port: 3306,
    user: 'test',
    password: 'wBIR7GOtiHlQ!',
    database: 'tests',
  },
});

//checking connection
db.raw('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch((error) => {
    console.error('Error connecting to MySQL database:', error);
    process.exit(1); // Exit process on connection failure
  });


app.use(bodyParser.json());

// the function
async function updateNouns(origin, changes) {
    try {
        let maxId = Math.max(...origin.map(obj => obj.id), 0);
        for (let change of changes) {
            if (change.startsWith("-")) {
                const indexToRemove = origin.findIndex(obj => obj.name === change.substring(1));
                if (indexToRemove !== -1) {
                    origin.splice(indexToRemove, 1);
                }
            } else {
                origin.push({ id: ++maxId, name: change });
            }
        }
        return origin;
    } catch (error) {
        throw new Error('Error updating nouns');
    }
}


// get route
app.get('/api/nouns', async (req, res) => {
    try {
      const nouns = await db('nouns').select('id', 'name'); 
      res.json(nouns);
    } catch (error) {
      console.error('Error fetching nouns:', error);
      res.status(500).json({ message: 'Error retrieving nouns' });
    }
  });
  

// put route
app.put('/api/nouns', async (req, res) => {
    const changes = req.body.changes;
    if (!changes || !Array.isArray(changes)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    try {
        let origin = await db.select().from('nouns');
        origin = await updateNouns(origin, changes);
        console.log('Updated nouns:', origin);

        await db.transaction(async (trx) => {
            await trx('nouns').del();
            await trx('nouns').insert(origin);
            console.log('Transaction completed successfully');
        });

        res.json({ message: 'Nouns updated successfully', updatedNouns: origin });
    } catch (error) {
        console.error('Error updating nouns:', error);
        res.status(500).json({ error: 'Failed to update nouns in database' });
    }
});
  

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));






