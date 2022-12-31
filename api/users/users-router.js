// Require the `restricted` middleware from `auth-middleware.js`. You will need it here!
const express = require("express")
const {restricted} = require("../auth/auth-middleware")
const Users = require("./users-model")
const userRouter = express.Router()
/**
  [GET] /api/users

  This endpoint is RESTRICTED: only authenticated clients
  should have access.

  response:
  status 200
  [
    {
      "user_id": 1,
      "username": "bob"
    },
    // etc
  ]

  response on non-authenticated:
  status 401
  {
    "message": "You shall not pass!"
  }
 */
userRouter.get("/", restricted, async (req, res, next)=>{
  const data = await Users.find()
  try {
    res.status(200).json(data)

  } catch(error) {
    next(error)

  }
})


userRouter.use((error,req,res,next)=>{
  res.status(error.status||500).json({message: error.message || "bad request"})
})


// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = userRouter
