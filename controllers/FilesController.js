// The FilesController
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb'; // Import ObjectId directly from mongodb package
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

// FilesController class
class FilesController {
  static async postUpload(req, res) {
    try {
      // This Extract the token from the headers
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // This Retrieve the user ID from Redis using the token
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // This Extract file details from the request body
      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      // This  Validate required fields
      if (!name || !type) {
        return res.status(400).json({ error: 'Missing required fields (name or type)' });
      }

      if (!['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Invalid file type' });
      }

      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing file data' });
      }

      // This Validate parentId if provided
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent file not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // This Prepares the new file document
      const newFile = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? '0' : ObjectId(parentId),
      };

      // This sHandle folder type
      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(newFile);
        return res.status(201).json({
          id: result.insertedId,
          userId,
          name,
          type,
          isPublic,
          parentId,
        });
      }

      // This Handle file and image types
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      // This Generate a unique local path for the file
      const fileExtension = path.extname(name); // Get file extension
      const fileId = uuidv4(); // Generate unique ID for the file
      const localPath = path.join(folderPath, `${fileId}${fileExtension}`);

      // This Write the file content to the local path
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

      // This Add local path to the file document
      newFile.localPath = localPath;

      // This Insert the new file document into the database
      const result = await dbClient.db.collection('files').insertOne(newFile);

      // This Return the new file document
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

// The export default filecontroller
export default FilesController;
