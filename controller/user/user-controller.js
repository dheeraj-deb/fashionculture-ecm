const product = require('../../model/product');
const user = require('../../model/User');
const nodeMailer = require('nodemailer');
const session = require('express-session');
require('dotenv').config()
let prod;
let cartProducts;
let cartTotal;
let productTotal;
let wishListProducts;
let searchProduct = null;

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: "dheerajknight81@gmail.com",
        pass: process.env.NODEMAILER_PASS
    }
})

// localhost:3000/   
exports.getHome = async (req, res) => {
    // console.log(req.query);
    // const { email } = req.session.user
    // console.log(email);
    // user.getUser(email).then((userdata) => {
    // console.log(userdata);
    // if (!userdata.isBlocked) {
    if (req.query.search) {
        const result = await product.searchProduct(req.query.search)
        searchProduct = result
        res.redirect('/')
    } else {
        product.getAllProduct().then(async (result) => {
            if (searchProduct) {
                result = searchProduct;;
            }

            res.render('user/index', {
                title: 'Wear Again',
                user: true,
                product: result,
                session: req.session,
                cartProducts,
                cartTotal,
                layout: "user-layout",
                Home: true
            });



        })
    }

    // } else {
    // req.flash("error", "you have been blocked!")
    // res.redirect('/')
    // }

    // })

}

// get products from database
exports.getShop = (req, res) => {
    product.getAllProduct().then((result) => {
        prod = result
        console.log(prod);
        res.redirect('/products')
    })
}


// filter category (men,women,kids)
exports.filterCategory = (req, res) => {
    let filter
    filter = req.body.filter
    if (req.query.category) {
        filter = req.query.category;
    }
    product.filterCategory(filter).then((result) => {
        console.log("res", result);
        prod = result
        res.redirect('/products')
    })
}

// filter - allProducts
exports.getallProducts = (req, res) => {
    product.getAllProduct().then((result) => {
        console.log("here");
        prod = result
        res.redirect('/products')

    })
}

exports.filterByPrice = async (req, res) => {
    prod = await product.filterByPrice(req.body)
    res.redirect('/products')
}

// to render the shop page
exports.getProducts = async (req, res) => {
    if (req.query.search) {
        const result = await product.searchProduct(req.query.search)
        searchProduct = result
        res.redirect('/products')
    } else {
        if (searchProduct) {
            prod = searchProduct;
        }
        res.render('user/shop', { product: prod, layout: "user-layout", user: true, Shop: true })
        searchProduct = null;
    }
}

// product details 
exports.productDetails = (req, res) => {
    const productId = req.params.id;
    product.findProductById(productId).then((prod) => {
        if (prod) {
            return res.render('user/product-details', { product: prod, layout: "user-layout", user: true })
        }

    })
}

// add to cart
exports.addToCart = async (req, res) => {
    await product.addtoCart(req.body.productId, req.session.user._id)
    res.json({ status: true })
}


exports.getCart = async (req, res) => {
    cartProducts = await product.getCartItems(req.session.user._id)
    console.log(cartProducts);
    if (cartProducts) {
        cartTotal = await product.getCartTotal(req.session.user._id)
        const coupon = await product.getCoupon(req.session.user._id);
        if (cartTotal) {
            res.render('user/cart', {
                layout: "user-layout",
                user: true,
                products: cartProducts,
                total: cartTotal,
                productTotal,
                Cart: true,
                coupon
            })
        } else {
            res.render('user/cart', {
                layout: "user-layout",
                user: true,
                Cart: true,
                coupon
            })
        }
    } else {
        res.render('user/cart', {
            layout: "user-layout",
            user: true,
            Cart: true,
        })
    }
}

// inc qty and total of the product in the cart
exports.incQty = (req, res) => {
    product.incQtyAndTotal(req.session.user._id, req.body).then((data) => {
        if (data) {
            productTotal = data
            res.json({
                staus: true
            })
            // res.redirect('/cart')
        } else {
            console.log("inc faild");
        }
    }).catch((err) => {

    })
}

// remove product from the cart
exports.deleteCartProduct = (req, res) => {
    product.deleteCartItem(req.body).then(async (response) => {
        res.redirect('/cart')
    })
}



exports.getplaceOrder = (req, res) => {
    const userId = req.session.user._id;
    user.getAddress(userId).then(async (address) => {
        const discountPrice = await product.isDiscountAvailable(userId)
        if (discountPrice) {
            console.log(discountPrice);
            res.render('user/place-order', { layout: "user-layout", user: true, addr: true, total: discountPrice, address })
        } else {
            product.getCartTotal(userId).then((total) => {
                console.log(total);
                res.render('user/place-order', { layout: "user-layout", user: true, addr: true, total: total, address })
            })
        }
    })
}

exports.placeOrder = async (req, res) => {
    let totalPrice;
    const products = await product.getCartItems(req.session.user._id);
    const discount_price = await product.isDiscountAvailable(req.session.user._id)
    const cartTotal = await product.getCartTotal(req.session.user._id);
    const address = await user.getAddressByAddressId(req.body.address[1], req.session.user._id)
    if (discount_price) {
        totalPrice = discount_price
    } else {
        totalPrice = cartTotal
    }
    user.placeOrder(req.body, products, totalPrice, address, req.session.user._id).then((response) => {
        if (req.body.paymentmethod === 'cod') {
            res.json({ sts: true })
        } else {
            user.generateRazopay(totalPrice, response).then((response) => {
                console.log("responseeeeeeeee", response);
                res.json(response)
            })
        }

    })
}

exports.verifyPayment = (req, res) => {
    user.verifyPayment(req.body).then((response) => {
        user.changePaymentStatus(req.body["order[receipt]"], req.session.user._id)
        res.json(response)
    })
}


exports.getaddNewAdress = (req, res) => {
    res.render('user/place-address')
}

exports.addNewAddress = (req, res) => {
    console.log("---------------------------------------", req.body);
    const address = {
        name: req.body.name,
        mobile: req.body.mobile,
        pincode: req.body.pincode,
        address: req.body.address,
        locality: req.body.locality,
        district: req.body.district,
        state: req.body.state,
    }
    user.addAddress(address, req.session.user._id).then((response) => {
        if (response) {
            return res.redirect('/placeorder')
        }
    })

}


exports.editAddress = async (req, res) => {
    const { addrId } = req.body;
    const response = await user.editAddress(addrId, req.body, req.session.user._id)
    res.json(response)
}

exports.deleteAddress = async (req, res) => {
    await user.deleteAddress(req.body.addrId, req.session.user._id)
    res.json({ status: true })
}


exports.changeAddress = async (req, res) => {
    console.log(req.body);
    const addr = await user.getAddressByAddressId(req.body.address, req.session.user._id)
    res.json(addr)
}




// profile

exports.editProfile = async (req, res) => {
    console.log(req.body);
    const response = await user.editProfile(req.session.user._id, req.body)
    res.json(response)
}

// wishlist

exports.getWhishList = async (req, res) => {
    wishListProducts = await product.getWishlistproducts(req.session.user._id)
    console.log(wishListProducts);
    if (wishListProducts.length) {
        res.render('user/wishlist', { layout: "user-layout", user: true, whishlist: true, products: wishListProducts })
    } else {
        res.render('user/wishlist', { layout: "user-layout", user: true, whishlist: true, })
    }
}

exports.add_to_whishlist = async (req, res) => {
    console.log("req.body", req.body);
    const response = await product.addWhishlist(req.session.user._id, req.body.product)
    console.log("success");
}

exports.removeWishlist = async (req, res) => {
    const rmWishlist = await product.removeFromWislist(req.body);
    if (rmWishlist) {
        res.redirect('/whish-list')
    }
}


exports.getOrders = async (req, res) => {
    const orderDetails = await user.findOrders(req.session.user._id)
    console.log(orderDetails);
    res.render('user/orders', { layout: "user-layout", order: true, user: true, orderDetails })
}


exports.getMyAccount = async (req, res) => {
    const userDetails = await user.getUser(req.session.user)
    const cartCount = await user.getCartCount(req.session.user._id)
    const whishlistCount = await user.getWishlistCount(req.session.user._id)
    const orderDetails = await user.findLimitedOrders(req.session.user._id)
    console.log("order-details", orderDetails);
    res.render('user/my-acc', { layout: "user-layout", user: true, profile: true, myacc: true, userDetails, cartCount, whishlistCount, orderDetails })
}

exports.getMyProfile = async (req, res) => {
    const userDetails = await user.getUser(req.session.user)
    console.log(userDetails);
    res.render('user/my-profile', { layout: "user-layout", user: true, profile: true, myprofile: true, userDetails })
}
exports.getEditMyAcc = async (req, res) => {
    const userDetails = await user.getUser(req.session.user)
    console.log(userDetails);
    res.render('user/edit-userinfo', { layout: "user-layout", user: true, profile: true, myprofile: true, userDetails })
}

exports.getChangePassword = (req, res) => {
    res.render('user/change-password', { layout: "user-layout", user: true, profile: true, myprofile: true })
}

exports.changePassword = async (req, res) => {
    const response = await user.changePassword(req.body.password1, req.body['cr-password'], req.session.user._id)
    res.json(response)
    if (response) {
        const userDetails = await user.getUser(req.session.user)
        transporter.sendMail({
            to: userDetails.email,
            subject: 'WearAgain Change P',
            html: `
        <p>Hai ${userDetails.f_name + " " + userDetails.l_name} Your Password Is Changed Succesfully</p>`
        })
    }
}

exports.getForgotPass = async (req, res) => {
    res.render('user/my-profile-forgotpass', { layout: "user-layout", user: true, profile: true, myprofile: true, errMessage: req.flash('error') })
}

exports.forgotPassword = async (req, res) => {
    user.createToken(req.body).then((response) => {
        if (response && response.response) {
            const { token } = response;
            const user = response.response
            res.redirect('/myaccount/myprofile');

            transporter.sendMail({
                to: user.email,
                from: 'dheerajknight81@gmail.com',
                subject: 'Reset Password',
                html: `
            <p>Hai ${user.f_name + " " + user.l_name} You requested a password reset</p>
            <p>Please click this <a href ="https://fashioncluture.ml/reset_pass/${token}">Link</a> to set a new pasword.</p>
            `
            })
        } else {
            req.flash('error', 'email not found!')
            res.redirect('/myprofile/forgot-password')
        }
    })
}

exports.validatePass = async (req, res) => {
    console.log(req.body);
    const response = await user.validatePassword(req.body.password, req.session.user._id);
    if (!response) {
        return res.json({ isValid: false })
    }
    res.json({ isValid: true })
}

exports.getMyOrders = async (req, res) => {
    const orderDetails = await user.findOrders(req.session.user._id)
    res.render('user/my-profile-orders', { layout: "user-layout", order: true, user: true, profile: true, orderDetails })
}


exports.getUserAddress = async (req, res) => {
    const userDetails = await user.getUser(req.session.user)
    const address = await user.getAddress(req.session.user._id)
    console.log("addr---------", address);
    res.render('user/manage-address', { layout: "user-layout", user: true, address, addr: true, profile: true, userDetails })

}

// coupon

// exports.getCoupon = async (req, res) => {
//     const coupon = await user.getCoupon()
// }

exports.create_coupon_discount = async (req, res) => {
    const disObj = await product.create_coupon_discount(req.body.coupon, req.session.user._id)
    console.log(disObj);
    res.json(disObj)
}

exports.removeCoupon = async (req, res) => {
    const userId = req.session.user._id
    await product.removeCoupon(userId)
    res.json({
        status:true
    })
}


exports.order = (req, res) => {
    res.render('user/order', { layout: "user-layout", user: true, order: true })
} 