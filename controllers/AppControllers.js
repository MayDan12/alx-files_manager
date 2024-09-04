import redisClient from '../utils/redis';
import dbClient from '../utils/db';

// The AppContriller class
class AppController {
  /**
   * The Method to get the status of Redis and MongoDB clients
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  // Static getStatus
  static getStatus(req, res) {
    const status = {
      redis: redisClient.isAlive(), 
      // This Check if Redis client is alive
      db: dbClient.isAlive(), 
      // This Check if MongoDB client is alive
    };
    res.status(200).send(status); 
    // This code Send the status as response
  }

  /**
   * The Method to get the statistics of the application
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  // async getStat
  static async getStat(req, res) {
    const stats = {
      users: await dbClient.nbUsers(), //This Get the number of users from MongoDB
      files: await dbClient.nbFiles(), //This Get the number of files from MongoDB
    };
    res.status(200).send(stats); //This Send the statistics as response
  }

  /**
   * The Method to create a new user
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  // static async create user
  static async createUser(req, res) {
    const { email, password } = req.body; //This Get email and password from request body
    if (!email || !password) {
      return res.status(400).send({ error: 'Missing email or password' }); // Send error if email or password is missing
    }

    try {
      const newUser = await dbClient.createUser(email, password); // Create a new user in MongoDB
      // This Send the new user's ID and email as response
      return res.status(201).send({ id: newUser.id, email: newUser.email });
    } catch (error) {
      return res.status(400).send({ error: error.message }); // Send error if user creation fails
    }
  }

  /**
   * The Method to find a user by email
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   */
  static async findUser(req, res) {
    const { email } = req.query; // This Get email from query parameters
    if (!email) {
      return res.status(400).send({ error: 'Missing email' }); // Send error if email is missing
    }

    try {
      const user = await dbClient.findUser(email); //The Find the user in MongoDB
      if (!user) {
        return res.status(404).send({ error: 'User not found' }); // Send error if user is not found
      }
      return res.status(200).send(user); //The  Send the user as response
    } catch (error) {
      //The Send error if there is a server issue
      return res.status(500).send({ error: error.message });
    }
  }
}

export default AppController;