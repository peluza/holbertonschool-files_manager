import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(request, response) {
    const xToken = request.header('X-Token');
    if (!xToken) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const tokenRedis = await redisClient.get(`auth_${xToken}`);
    if (!tokenRedis) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const result = await dbClient.DB.collection('users').findOne({ _id: ObjectId(tokenRedis) });
    if (!result) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const {
      name, parentId, type, isPublic, data,
    } = request.body;
    if (!name) {
      return response.status(400).send({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return response.status(400).send({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return response.status(400).send({ error: 'Missing data' });
    }
    const isFilePublic = isPublic || false;
    const parId = parentId || 0;
    const value = parseInt('0', 10);
    if (parId !== value) {
      const resultFiles = await dbClient.DB.collection('files').findOne({ _id: ObjectId(parId) });
      if (!resultFiles) {
        return response.status(400).send({ error: 'Parent not found' });
      }
      if (!['folder'].includes(resultFiles.type)) {
        return response.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    const info = {
      name: `${name}`, type: `${type}`, parentId: `${parentId}`, isPublic: `${isFilePublic}`, userId: `${result._id}`,
    };
    if (['folder'].includes(type)) {
      await dbClient.DB.collection('files').insertOne(info);
      return response.status(201).send(info);
    }
    const path = process.env.FOLDER_PATH || '/tmp/files_manager';
    const nameFile = uuidv4();
    const fullFile = `${path}/${nameFile}`;
    const buf = Buffer.from(data, 'base64');
    fs.mkdir(path, (err) => {
      if (err) {
        return response.status(400).send({ error: `${err.message}` });
      }
      return true;
    });
    fs.writeFile(fullFile, buf, (err) => {
      if (err) {
        return response.status(400).send({ error: `${err.message}` });
      }
      return true;
    });
    const infoFI = {
      name: `${name}`, type: `${type}`, parentId: `${parentId}`, isPublic: `${isPublic}`, userId: `${result._id}`, localPath: `${fullFile}`,
    };
    await dbClient.DB.collection('files').insertOne(infoFI);
    return response.status(201).send(infoFI);
  }
}

module.exports = FilesController;
