/* eslint-disable */
import redisClient from "../utils/redis";
import dbClient from "../utils/db";
import { v4 as uuidv4 } from "uuid";
import sha1 from 'sha1';

// The AuthController class
class AuthController {
    /**
     * This Handles user authentication and token generation
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @returns {Object} - The response object with the authentication token or an error message
     */
    // static async getconnect
    static async getConnect(req, res) {
        // This Extract the Authorization header
        const auth = req.header('Authorization') || null;
        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // This Decode Base64 credentials
        const buffer = Buffer.from(auth.replace('Basic ', ''), 'base64');
        const credentials = {
            email: buffer.toString('utf-8').split(':')[0],
            password: buffer.toString('utf-8').split(':')[1],
        };

        // This Check if both email and password are provided
        if (!credentials.email || !credentials.password) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // This Hash the password using sha1
        credentials.password = sha1(credentials.password);

        //This Find user in the database by email and hashed password
        const user = await dbClient.db.collection('users').findOne(credentials);
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        //This Generate a unique token
        const token = uuidv4();
        const key = `auth_${token}`;

        //This Store the token in Redis with an expiration time of 24 hours (86400 seconds)
        await redisClient.set(key, user._id.toString(), 86400);

        //This Return the generated token
        return res.status(200).json({ token })
    }

    /**
     *This Handles user logout by deleting the authentication token
     * @param {Object} req - The request object
     * @param {Object} res - The response object
     * @returns {Object} - The response object with status 204 on success or an error message
     */
    // static async get disconnect
    static async getDisconnect(req, res) {
        // This Extract the token from the headers
        const token = req.header('X-Token') || null;
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // This Retrieve the token from Redis
        const redisToken = await redisClient.get(`auth_${token}`);
        if (!redisToken) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // This Delete the token from Redis
        await redisClient.del(`auth_${token}`);
        return res.status(204).send();
    }
}

// The module export
module.exports = AuthController;