import { Router, json } from 'express';
import AppController from '../controllers/AppController';

// const router = Router();
// router.get('/', (request, response) => response.send('Hola'));
// router.get('/status', ((request, response) => AppController.getStatus(request, response)));
// router.get('/stats', ((request, response) => AppController.getStats(request, response)));

const router = (app) => {
  const path = Router();
  app.use(json());
  app.use('/', path);
  path.get('/status', (request, response) => AppController.getStatus(request, response));
  path.get('/stats', (request, response) => AppController.getStats(request, response));
};

export default router;
