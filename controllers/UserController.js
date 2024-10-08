// This is the controllers/UsersController.js
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// The UserController class
class UsersController {
  static async createUser(req, res) {
    const { email, password } = req.body;
    try {
      const user = await dbClient.createUser(email, password);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // The static async find user
  static async findUser(req, res) {
    // The email query
    const { email } = req.query;
    try {
      const user = await dbClient.findUser(email);
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ error: 'User not found' });
    }
  }

  // The static async getme
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const user = await dbClient.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

// The export default usercontroller
export default UsersController;
