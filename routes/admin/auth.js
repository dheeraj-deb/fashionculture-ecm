const express = require('express');
const router = express.Router()
const controller = require('../../controller/admin/auth');;


router.get('/signin', controller.getSigin)

router.post('/signin', controller.postSignIn)

router.get('/logout', controller.adminLogOut);


router.use((req, res) => {
    res.render('error', {layout:false})
})


module.exports = router;