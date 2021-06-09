import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}

module.exports = UsersController;
