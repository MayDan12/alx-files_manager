import express from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';

// Declaring the router
const router = express.Router();

// The Route to always get the status of Redis and MongoDB clients
router.get('/status', AppController.getStatus);

// The Route to always get the statistics of the application
router.get('/stats', AppController.getStat);

// The Route to always create a new user
router.post('/users', AppController.createUser);

// The Route to always find a user by email
router.get('/users', AppController.findUser);

// The Route to always Authenticate user with token
router.get('/connect', AuthController.getConnect);

// The Route to always Logout or disconnect User by token
router.get('/disconnect', AuthController.getDisconnect);

// The Route to always get User
router.get('/users/me', UsersController.getMe);

// The Route to always post files
router.post('/files', FilesController.postUpload);

export default (app) => {
  // This uses the defined routes in the express application
  app.use('/', router);
};
