import express from 'express';
import bodyParser from 'body-parser';
import nounsRoutes from './routes/routes.js'; 

const app = express();

app.use(bodyParser.json());

app.use('/api/nouns', nounsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));