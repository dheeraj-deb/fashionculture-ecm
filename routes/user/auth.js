const express = require('express');
const controller = require("../../controller/user/auth");
const isAuth = require('../../middleware/user/is-auth');
const router = express.Router();

// login
router.get('/user_signin', controller.getLogin)

router.post('/user_signin', controller.postLogin)



// signUp

router.get('/user_registration', controller.getSignUp);

router.post('/user_registration',controller.postSignUp);


// reset pass form GET =>>>
router.get('/reset_pass', controller.getReset);

//reset password form POST =>>
router.post('/reset_pass', controller.postReset)

// update password GET =>>
router.get('/reset_pass/:token', controller.getNewPassword);

// update password POST =>>
router.post('/pass_update', controller.postNewPassword);


// otp

// router.post('/user_signin', controller.doOtpSignin());


router.get('/logout', controller.logout);


module.exports = router