const crypto = require('crypto');
const nodeMailer = require('nodemailer');
require('dotenv').config()
const db = require('../../util/database');
const collection = require('../../util/collection').collection;
const user = require('../../model/User');
const bcrypt = require('bcrypt');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: "dheerajknight81@gmail.com",
        pass: "lresljrchluhpapx"
    }
})


exports.getLogin = (req, res) => {
    if (req.session.isUserLoggedIn) {
        return res.redirect('/');
    }
    res.render('user/login.hbs', { isAuth: true, layout: "user-layout", errorMessage: req.flash('error') })
}


exports.postLogin = (req, res) => {
    console.log(req.body);
    user.userSignin(req.body).then((response) => {
        // const data = response.data;
        if (response && response.data) {
            req.session.isUserLoggedIn = true
            req.session.user = response.data
            return req.session.save((err) => {
                if (err) throw err
                res.redirect('/')
            })
        }
        console.log("not valid");
        req.flash('error', "The email address or password that you've entered doesn't match any account. Sign up for an account.")
        res.redirect('/user_signin')
    }).catch((err) => {
        console.log(err);
        if (err) {
            res.redirect('/user_signin')
        }
    })

}



// signUp
exports.getSignUp = (req, res) => {
    if (req.session.isUserLoggedIn) {
        return res.redirect('/')
    }
    res.render('user/signup', { isAuth: true, errorMessage: req.flash('error'), layout: "user-layout" });
}

exports.postSignUp = (req, res) => {
    const { f_name, l_name, email, mobile, password } = req.body;
    req.body.isBlocked = false;
    user.userSignUp(req.body).then((response) => {
        if (response) {
            req.flash('error', 'E-Mail exists already, please pick a diffrent one')
            res.redirect('/user_registration')
        } else {
            res.redirect('/user_signin')
        }
    })
}



// reset-password

exports.getReset = (req, res) => {
    res.render('user/reset', { user: true, layout: "user-layout", errorMessage: req.flash('error') });
}


exports.postReset = (req, res) => {
    user.createToken(req.body).then((response) => {
        if (response && response.response) {
            const { token } = response;
            const user = response.response
            res.redirect('/');

            transporter.sendMail({
                to: user.email,
                from: 'dheerajknight81@gmail.com',
                subject: 'Reset Password',
                html: `
            <p>Hai ${user.f_name + " " + user.l_name} You requested a password reset</p>
            <p>Please click this <a href ="http://localhost:3000/reset_pass/${token}">Link</a> to set a new pasword.</p>
            `
            })
        } else {
            req.flash('error', 'email not found!')
            res.redirect('/reset_pass')
        }
    })
}


exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    user.getNewPass(token).then((response) => {
        // console.log(response.uid);
        if (response) {
            return res.render('user/new-password', { uId: response._id, layout: "user-layout" });
        }
        res.redirect('/reset_pass')
    })
}

exports.postNewPassword = (req, res) => {
    user.resetPass(req.body).then((response) => {
        if (response) {
            // console.log("res", response);
            res.redirect('/user_signin')
        }
    }).catch((err) => { })
}







// logout ---
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err
        res.redirect('/')
    })
}

