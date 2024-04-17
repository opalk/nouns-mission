import express from 'express';
import { getNouns, updateNouns } from '../controllers/controller.js'; 

const router = express.Router();

router.get('/', getNouns);
router.put('/', updateNouns);

export default router;