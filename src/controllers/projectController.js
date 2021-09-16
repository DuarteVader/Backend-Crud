const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/usuarios', async (req, res) => {
  try {
    const users = await User.findById(req.userId);
    console.log(users)
    // if (users.level != 999) {
    //   return res.status(401).send({ error: 'Usuário não autorizado' });
    // }
    const usuarios = await User.find({
      $or: [
        {
          level: 0,
        },
        {
          level: 1,
        },
      ],
    });

    return res.send({ usuarios });
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
router.put('/update/:userId', async function (req, res) {

  try{
  const newUser = req.body;
  
  if(newUser.password) {
    newUser.password = await bcrypt.hashSync(req.body.password, 10);
  }
  const usuario = await User.findByIdAndUpdate(req.params.userId, newUser, {
    new: true,
  });

  await usuario.save();

  return res.send({ usuario })
  
}catch (err) {
  console.log(err);
  return res.status(400).send({ error: "Erro no alterar"});
}

});


router.put('/update/DesativarUsuario/:userId', async function (req, res) {
  try {
    const newData = req.body;
    //atualizando e retornando usuario atualizado
    if (newData.password)
      newData.password = await bcrypt.hashSync(req.body.password, 10);
    const usuario = await User.findByIdAndUpdate(req.params.idUser, {
      level: 0,
    });
    await usuario.save();
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Erro ao atualizar usuário!' });
  }
});

router.put('/update/AtivarUsuario/:userId', async function (req, res) {
  try {
    const newData = req.body;
    //atualizando e retornando usuario atualizado
    if (newData.password)
      newData.password = await bcrypt.hashSync(req.body.password, 10);
    const usuario = await User.findByIdAndUpdate(req.params.idUser, {
      level: 1,
    });
    await usuario.save();
    return res.send({ usuario });
  } catch (err) {
    console.log(err);
    return res.send({ error: 'Erro ao atualizar usuário!' });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const useradm = await User.findById(req.userId);
    if (useradm.level !== 999) {
      return res.send({ error: 'Sem autorização de exclusão' });
    }
    
    await User.findByIdAndRemove(req.params.userId);
    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Erro ao deletar o usuario' });
  }
});

module.exports = (app) => app.use('/projects', router);
