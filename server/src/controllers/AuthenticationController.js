const User = require('../models/User')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

function jwtSignUser (user){
    const ONE_MONTH = 60 * 60 * 24 * 30
    return jwt.sign(user, config.authentication.jwtSecret, {
        expiresIn: ONE_MONTH
    })
}

//Declare Endopoints

module.exports={
    async register (req, res){
        try {
          // Hash password in Model

          // New user
          const newUser = new User({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: req.body.password,
            zone: req.body.zone
          });
      
          //Debug New User
          if(true){
            console.log(`Name: ${newUser.name}`);
            console.log(`Surname: ${newUser.surname}`);
            console.log(`Email: ${newUser.email}`);
          }

          // Save new User
          await newUser.save();
          res.status(201).send('User created successfully.');
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error registering new user.' });
        }

        /*
        res.send({
          message: `Hi ${req.body.email}! Your account was registered!`
        })*/
    },

    async login (req, res) {
      try {
        const {email, password} = req.body
        const user = await User.findOne({ email });
  
        if (!user) {
          return res.status(403).send({
            error: 'The login information was incorrect'
          })
        }
  
        const isPasswordValid = await user.comparePassword(password)
        if (!isPasswordValid) {
          return res.status(403).send({
            error: 'The login information was incorrect'
          })
        }
  
        const userJson = user.toJSON()
        res.send({
          user: userJson,
          token: jwtSignUser(userJson)
        })
      } catch (err) {
        res.status(500).send({
          error: 'An error has occured trying to log in'
        })
      }
    }
}