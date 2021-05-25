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

router.post('/login', async function (req, res) {
  const { password } = req.body
  const { usuario } = req.body

  var user = await User.findOne({ email: usuario }).select('+password')
  if (!user) {
    user = await User.findOne({ cpf: usuario }).select('+password')

    if (!user) {
      return res
        .status(400)
        .send({ error: 'Usuário não encontrado!' })
    }
  }

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(400).send({ error: 'Senha invalida!' })

  user.password = undefined

  return res.send({ user, token: gerarToken({ id: user.id }) })
})

module.exports = (app) => app.use('/auth', router);
