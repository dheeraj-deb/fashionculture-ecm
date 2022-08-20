const admin = require('../../model/admin');



exports.getSigin = (req, res) => {
    if(req.session.isAdminLogIn){
        return res.redirect('/admin/')
    }
    res.render('admin/login', { title:"Admin Login", isAdminLogin:true,  layout:"admin_layout", errorMessage: req.flash('error')})
}

exports.postSignIn = (req, res) => {
    // console.log(req);
    admin.doSignin(req.body).then((response)=>{
        if(response){
            req.session.isAdminLogIn = true;
            return res.redirect('/admin/')
        }
        req.flash('error', 'Invalid Email or Password')
        res.redirect('/admin/auth/signin')
    }).catch((err)=>{
        if(err){
            req.flash('error', 'something went wrong! please try again.')
            res.redirect('/admin/auth/signin')
        }
    })
}


exports.adminLogOut = (req, res) => {
    if (req.session.isAdminLogIn) {
        return req.session.destroy((err)=>{
            if(err) console.log(err);
            console.log(req);
            res.redirect('/admin/auth/signin')
        })
    }
    req.flash('error', "your session has expired! please login")
    res.redirect('/admin/auth/signin')
}



