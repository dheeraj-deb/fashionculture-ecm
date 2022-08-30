const express = require('express');
const controller = require('../../controller/user/user-controller');
const isAuth = require('../../middleware/user/is-auth');
const isBlocked = require('../../middleware/user/isBlocked');
const router = express.Router();
const passport = require('passport')

/* GET home page. */

router.get('/', isBlocked, controller.getHome);

router.get('/shop', isBlocked, controller.getShop);

router.get('/products', isBlocked, controller.getProducts);


// filter
router.post('/all-products', isBlocked, controller.getallProducts);

router.get('/filter-category', isBlocked, controller.filterCategory)

router.post('/filter-category', isBlocked, controller.filterCategory);

router.post('/products/filterByPrice', isBlocked, controller.filterByPrice)

// product overview

router.get('/product_details/:id', isBlocked, controller.productDetails);

// cart

router.get('/cart', isAuth, isBlocked, controller.getCart)

router.post('/add-to-cart', isAuth, isBlocked, controller.addToCart)

// addtocart from product details
router.get('/add-to-cart', isAuth, isBlocked, controller.addToCart)

router.post('/cart/change-qty', isAuth, isBlocked, controller.incQty)

router.post('/cart/change-size', isAuth, isBlocked, controller.changeSize)

router.post('/cart/removeProduct', isAuth, isBlocked, controller.deleteCartProduct)


router.get('/placeorder', isAuth, controller.getplaceOrder);

router.post('/place-order', isAuth, controller.placeOrder);

router.get('/orders', isAuth, controller.getOrders);

router.post('/verify-payment', controller.verifyPayment)

// router.get('/placeorder/add-new-adderss',isAuth, controller.getaddNewAdress)

// manage address
router.post('/add-new-address', isAuth, controller.addNewAddress)

router.post('/change-address', isAuth, controller.changeAddress)

router.post('/delete-address', isAuth, controller.deleteAddress)

router.post('/edit-address', isAuth, controller.editAddress);

// profile
router.post('/edit-profile', isAuth, controller.editProfile)

router.get('/myaccount/orders', isAuth, controller.getMyOrders)

router.get('/whish-list', isAuth, controller.getWhishList)

router.post('/add-to-whishlist', isAuth, controller.add_to_whishlist)

router.post('/wishlist/removeproduct', isAuth, controller.removeWishlist)


router.get('/myaccount', controller.getMyAccount)

router.get('/myaccount/manage-address/', controller.getUserAddress)

router.get('/myaccount/myprofile', isAuth, controller.getMyProfile)

router.get('/myprofile/edit-profile', isAuth, controller.getEditMyAcc)

router.get('/myprofile/change-password', isAuth, controller.getChangePassword)

router.post('/myprofile/change-password', isAuth, controller.changePassword)

router.post('/myprofile/validate-password', isAuth, controller.validatePass)

router.get('/myprofile/forgot-password', isAuth, controller.getForgotPass)

router.post('/myprofile/forgot-password', isAuth, controller.forgotPassword)


// coupon

router.post('/cart/submit_coupon', isAuth, controller.create_coupon_discount)

router.post('/remove-coupon', isAuth, controller.removeCoupon)

// invoice

router.get('/myaccount/orders/invoice/:orderId', isAuth, controller.generateInvoice)

// google Oauth




module.exports = router;
