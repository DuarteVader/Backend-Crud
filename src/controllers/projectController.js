const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const users = await User.find();

    return res.send({ users });
  } catch (err) {
    return res.status(400).send({ error: 'Erro ao listar todos os usuarios' });
  }
});
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    return res.send({ user });
  } catch (err) {
    return res.status(400).send({ error: 'Erro ao listar o usuario' });
  }
});
router.put('/update/:idUser', async function (req, res) {

  try{
  const newUser = req.body;
  
  if(newUser.password) {
    newUser.password = await bcrypt.hashSync(req.body.password, 10);
  }
  console.log(newUser);
  const user = await User.findByIdAndUpdate(req.params.idUser, newUser, {new: true,})

  
  
  await user.save()
  return res.send({ user })
}catch (err) {
  console.log(err);
  return res.status(400).send({ error: "Erro no alterar"});
}

});
router.delete('/:userId', async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.userId);

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Erro ao deletar o usuario' });
  }
});

module.exports = (app) => app.use('/projects', router);
