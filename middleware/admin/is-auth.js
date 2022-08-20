module.exports = (req, res, next) => {
    if(!req.session.isAdminLogIn){
        req.flash('error', "Your Session has expired! Please Signin")
        return res.redirect('/admin/auth/signin')
    }
    next()
}