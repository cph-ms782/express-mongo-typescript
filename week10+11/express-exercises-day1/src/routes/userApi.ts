import express from "express";
import userFacade from "../facades/user";
const router = express.Router();
import { ApiError } from "../errors/apiError";
import authMiddleware from "../middlewares/basic-auth";

// Endpoint: /api/users

router.post('/', async function (req, res, next) { // skal kunne bruges uden at være logget på
  try {
    let newUser = req.body;
    newUser.role = "user";  //Even if a hacker tried to "sneak" in his own role, this is what you get
    const status = await userFacade.addUser(newUser)
    res.json({ status })
  } catch (err) {
    next(err);
  }
})

// router.use(authMiddleware); // sikkerhed kommer først på her så man kan bruge POST ovenover for at logge ind

// skal kun kunne bruges som admin Owasp A5 security problem
router.get('/:userName', async function (req: any, res, next) {
  try {
    const role = req.role;
    // if (role != "admin") {
    //   throw new ApiError("Not Authorized", 401);
    // }
    const user_Name = req.params.userName;
    const user = await userFacade.getUser(user_Name);
    const { name, userName } = user;
    const userDTO = { name, userName }
    res.json(userDTO);
  } catch (err) {
    next(err)
  }
});

router.get('/user/me', async function (req: any, res, next) {
  try {
    const user_Name = req.userName;
    const user = await userFacade.getUser(user_Name);
    const { name, userName } = user;
    const userDTO = { name, userName }
    res.json(userDTO);
  } catch (err) {
    next(err)
  }
});

router.get('/', async function (req: any, res, next) {
  try {
    const role = req.role;
    // if (role != "admin") {
    //   throw new ApiError("Not Authorized", 401);
    // }
    const users = await userFacade.getAllUsers();
    const usersDTO = users.map((user) => {
      const { name, userName } = user;
      return { name, userName }
    })
    res.json(usersDTO);
  } catch (err) {
    next(err)
  }
});

router.delete('/:userName', async function (req:any, res, next) {
  try {
    const role = req.role;
    // if (role != "admin") {
    //   throw new ApiError("Not Authorized", 401);
    // }
    const user_name = req.params.userName;
    const status = await userFacade.deleteUser(user_name)
    res.json({ status })
  } catch (err) {
    next(err);
  }
})

module.exports = router;