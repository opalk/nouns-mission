const express = require('express');
const bodyParser = require('body-parser');
const nounsRoutes = require('./routes/routes.js');

const app = express();

app.use(bodyParser.json());

app.use('/api/nouns', nounsRoutes);


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
