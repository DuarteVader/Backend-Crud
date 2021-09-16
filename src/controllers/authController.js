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
      level: req.body.level,
    })

    await newUser.save()


    return res
      .status(200)
      .send({ newUser, token: generateToken({ id: newUser.id }), sucess: 'Sucesso' })
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Usuário não pode ser cadastrado!' })
  }
})

router.post('/login', async function (req, res) {
  const {cpf} = req.body;
  const {email} = req.body;
  const {password} = req.body;
  try{
    
    console.debug(password);
if(cpf != null){
  var user = await User.findOne({ cpf }).select('+password')
}
else if(email != null) {
  var user = await User.findOne({ email }).select('+password')
}
    if (!user) {
      console.log(user)
      return res
        .status(400)
        .send({ error: 'Usuário não encontrado!' })
    }

  if (!(await bcrypt.compare(password, user.password))){
    console.log(user)
    console.log(password)
    console.log(user.password)
    return res.status(400).send({ error: 'Senha invalida!' })
  }

  
  if (user.level === 0) {
    console.log('Usuario Desativado');
    return res.send({ error: 'Esse usuário foi desativado' });
  }


  user.password = undefined

  return res.send({ user, token: generateToken({ id: user.id }) })
} catch (err) {
  console.log(err)
  return res.statur(400).send({ error: "Erro no login"})
}
})

module.exports = (app) => app.use('/auth', router);
