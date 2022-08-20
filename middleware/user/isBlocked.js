module.exports = (req, res, next) => {
    // if(req.session.user.isBlocked){
    //     next()
    // }else{
    //     req.flash("error", "Administrator has blocked you from running this app!")
    //     res.redirect('/user_signin')
    // }
    next()
}
