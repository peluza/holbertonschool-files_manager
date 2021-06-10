import { Router, json } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const router = (app) => {
  const path = Router();
  app.use(json());
  app.use('/', path);
  path.get('/status', (request, response) => AppController.getStatus(response));
  path.get('/stats', (request, response) => AppController.getStats(response));
  path.post('/users', (request, response) => UsersController.postNew(request, response));
  path.get('/connect', (request, response) => AuthController.getConnect(request, response));
  path.get('/disconnect', (request, response) => AuthController.getDisconnect(request, response));
  path.get('/users/me', (request, response) => UsersController.getMe(request, response));
};

export default router;
