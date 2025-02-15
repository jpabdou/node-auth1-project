// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require("express")
const {checkPasswordLength,checkUsernameExists,checkUsernameFree} = require("./auth-middleware")
const Users = require("../users/users-model")
const authRouter = express.Router()
const bcrypt = require("bcryptjs")
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
authRouter.post("/register", checkUsernameFree,checkPasswordLength, async (req, res, next)=>{
  const {username, password}= req.body;
  const hash = bcrypt.hashSync(password, 12);
  const user = {username, password: hash}
  const result = await Users.add(user)
  try {
    res.status(200).json(result)
  }
  catch(err){
    next(err)
  }
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

authRouter.post("/login", checkUsernameExists, async (req, res, next)=>{
  const {username, password}= req.body;
  const user = await Users.findBy({username}).first()
  try {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.status(200).json({message: `Welcome ${user.username}!`})
    } else {
      next({status: 401, message: "invalid credentials"})
  
    }
  }
  catch (err) {
    next(err)
  }

})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

authRouter.get("/logout", async (req, res, next)=>{
  if (req.session.user) {
    req.session.destroy(err=>{
      if (err) {
        next(err)
      } else {
        res.status(200).json({message: "logged out"})
      }
    })
  } else {
    res.status(200).json({message: "no session"})

  }
})

authRouter.use((error,req,res,next)=>{
    res.status(error.status||500).json({message: error.message || "bad request"})
  })

// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = authRouter
