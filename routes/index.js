import { Router, json } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const router = (app) => {
  const path = Router();
  app.use(json());
  app.use('/', path);
  path.get('/status', (request, response) => AppController.getStatus(response));
  path.get('/stats', (request, response) => AppController.getStats(response));
  path.post('/users', (request, response) => UsersController.postNew(request, response));
};

export default router;
