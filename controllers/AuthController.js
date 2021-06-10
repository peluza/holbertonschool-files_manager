import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization');
    console.log(Authorization);
    if (!Authorization) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const buf = Buffer.from(Authorization.replace('Basic', ''), 'base64');
    const cred = { email: buf.toString('utf-8').split(':')[0], password: buf.toString('utf-8').split(':')[1] };
    cred.password = sha1(cred.password);
    const userExists = await dbClient.DB.collection('users').findOne(cred);
    if (!userExists) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const tokenUser = uuidv4();
    const keyTok = `auth_${tokenUser}`;
    redisClient.set(keyTok, userExists._id.toString(), 86400);
    return response.status(200).send({ tokenUser });
  }

  static async getDisconnect(request, response) {
    const xToken = request.header('X-Token');
    if (!xToken) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    const tokenRedis = await redisClient.get(`auth_${xToken}`);
    console.log(tokenRedis);
    if (!tokenRedis) {
      return response.status(401).send({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${xToken}`);
    return response.status(204).send();
  }
}

module.exports = AuthController;
