import sha1 from 'sha1';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }
    const emailExist = await dbClient.DB.collection('users').findOne({ email: `${email}` });
    if (emailExist) {
      return response.status(400).send({ error: 'Already exist' });
    }
    const pwdHash = sha1(password);
    const res = await dbClient.DB.collection('users').insertOne({ email: `${email}`, password: `${pwdHash}` });
    return response.status(201).send({ id: res.insertedId, email: `${email}` });
  }

  static async getMe(request, response) {
    const xToken = request.header('X-Token');
    if (!xToken) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const tokenRedis = await redisClient.get(`auth_${xToken}`);
    if (!tokenRedis) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const result = await dbClient.DB.collection('users').findOne({ _id: ObjectId(tokenRedis) });
    console.log(result);
    if (!result) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    return response.status(200).send({ id: result._id, email: result.email });
  }
}

module.exports = UsersController;
