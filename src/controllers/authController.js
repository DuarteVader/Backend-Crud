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

router.post('/cadastro', async function (req, res) {
  try {
    console.log()
    const { email } = req.body
    const { cpf } = req.body

    if (await User.findOne({ email }))
      return res
        .status(400)
        .send({ error: 'Email já existente' })

    if (await User.findOne({ cpf }))
      return res
        .status(400)
        .send({ error: 'CPF já existente' })

    const newUser = new User({
      name: req.body.name,
      cpf: req.body.cpf,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      level: 1,
    })

    await newUser.save()

    newUser.password = undefined

    return res
      .status(400)
      .send({ newUser, token: generateToken({ id: newUser.id }) })
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Usuário não pode ser cadastrado!' })
  }
})

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

  return res.send({ user, token: generateToken({ id: user.id }) })
})

module.exports = (app) => app.use('/auth', router);
