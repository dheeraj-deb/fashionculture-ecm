const product = require('../../model/product');
const admin = require('../../model/admin');
const user = require('../../model/User');
const path = require('path');

exports.getAdmin = (req, res) => {
    // if (req.session.isAdminLogIn) {
    res.render('admin/index', { title: "Admin Home", layout: 'admin_layout', admin: true, dashboardActive: true })
    // } else {
    //     req.flash('error', "Your Session has expired! Please Signin")
    //     res.redirect('/admin/auth/signin');
    // }
}

exports.getaddProduct = (req, res) => {
    product.getCategory().then((category) => {
        if (category) {
            return res.render('admin/add-product', {
                admin: true, layout: "admin_layout",
                menuActive: true,
                addProduct: true,
                errorMessage: req.flash('error'),
                category:category
            })
        }
        // handle error
        res.redirect('/admin/product')
    })

}

exports.addProduct = (req, res) => {
    const img = [];

    req.files.forEach(element => {
        img.push(element.filename)
    });
    req.body.img_id = img
    console.log(req.files);
    product.addProduct(req.body).then((response) => {
        if (response) {
            return res.redirect('/admin/add-product')
        }
    })
}

exports.getProduct = (req, res) => {
    product.getAllProduct().then((products) => {
        res.render('admin/products', { admin: true, layout: "admin_layout", productsActive: true, product: products })
    })
}


exports.deleteProduct = (req, res) => {
    product.deleteProduct(req.params).then((response) => {
        if (response) {
            res.redirect('/admin/product')
        }
    })
}

exports.getEditProduct = (req, res) => {
    product.getProduct(req.params).then((prod) => {
        if (product) {
            return product.getCategory().then((category) => {
                console.log((category));
                if (category) {
                    return res.render('admin/edit-product', {
                        layout: "admin_layout",
                        editProd: true,
                        productsActive: true,
                        product: prod,
                        category:category
                    })
                }
            })
        }
    })
}

exports.updateProduct = (req, res) => {
    const img = [];
    console.log("files", req.files);
    req.files.image.forEach(element => {
        img.push(element.filename)
    });
    req.body.img_id = img
    product.editProduct(req.body, req.params.id).then((response) => {
        console.log(req.files);
        if (response) {
            res.redirect('/admin/product')

        }
    })
}



exports.getUser = (req, res) => {
    user.getAllUsers().then((users) => {
        if (users) {
            return res.render('admin/manage-user', { layout: 'admin_layout', manageUser: true, user: users })
        }
    })
}



exports.blockUser = (req, res) => {
    user.blockUser(req.params.id).then((response) => {
        res.redirect('/admin/manage-user')
    })
}

exports.unblockUser = (req, res) => {
    user.unblockUser(req.params.id).then((response) => {
        res.redirect('/admin/manage-user')
    })
}

exports.deleteUser = (req, res) => {
    user.deleteUser(req.params).then(() => {
        res.redirect('/admin/manage-user')
    })
}


exports.getBanner = (req, res) => {
    res.render('admin/manage-banner',  { layout: 'admin_layout', manageBanner: true })
}

// ordr management

exports.getOrders = async (req, res) => {
    const orders = await admin.findOrders()
    console.log(orders[0].orderObj);
    res.render('admin/orders',  { layout: 'admin_layout', orders})
}


exports.findUserById = async (req, res) => {
    const user = await admin.findUser(req.body.userId)
    res.json(user)
}

exports.changeOrderStatus = async (req, res) => {
    await admin.changeOrderStatus(req.body.status, req.body.orderId)
}

// coupon

exports.getAddCoupon = (req, res) => {
    res.render('admin/add-coupon', { layout: 'admin_layout'})
}
exports.addCoupon = (req, res) => {
    admin.addCoupon(req.body)
    res.redirect('/admin/coupon')
}