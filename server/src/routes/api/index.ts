import { Router } from 'express';
const router = Router();

import weatherRoutes from './weatherRoutes'; // Remove the `.js` extension if you're using TypeScript

router.use('/weather', weatherRoutes);

export default router;