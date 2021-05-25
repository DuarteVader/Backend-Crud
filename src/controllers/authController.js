const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth');

const User = require('../models/User');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400, //Um dia pra expirar o token
  });
}

router.post('/register', async (req, res) => {

  try {
    const {
      name,
      cpf,
      email,
      password,
      level,
    } = req.body;
    
    if (await User.findOne({ email }))
      return res.send({ error: 'Email ja registrado' });
    if (await User.findOne({ cpf }))
      return res.send({ error: 'CPF ja registrado' });


    const user = await User.create({ name, cpf, email, password: bcrypt.hashSync(req.body.password, 10), level});
    user.password = undefined;

    await user.save();
    return res.send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Registration failed' });
  }
});

router.post('/authenticate', async (req, res) => {
  try {
    const { password } = req.body;
    const { usuario: usuário } = req.body;
    var user = await User.findOne({ email: usuário }).select('+password');
    if (!user) {
      user = await User.findOne({ cpf: usuário }).select('+password');
      if (!user) {
        console.log('Usuario nao encontrado ', user);
        return res.send({ error: 'Usuario nao encontrado' });
      }
    }
    if (!await bcrypt.compare(password, user.password)) {
      console.log(password);
      console.log(user);
      console.log('Senha invalida');
      return res.send({ error: 'Senha Inválida' });
    }
    console.log(user);
    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Falha no login' });
  }
});

module.exports = (app) => app.use('/auth', router);
