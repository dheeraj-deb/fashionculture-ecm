const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../util/database');
const collection = require('../util/collection').collection;
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
require('dotenv').config()


const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


let userFound = false;



function getUser(userData) {
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email, isBlocked: false }).then((response) => {
                if (response) {
                    return resolve(response)
                }
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

function getUserById(id) {
    return new Promise((resolve, reject) => {
        try {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(id) }).then((response) => {
                if (response) {
                    return resolve(response)
                }
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

exports.getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            if (users) {
                return resolve(users)
            }
            resolve(users)
        } catch (error) {
            reject(error)
        }
    })
}



// otp verification

// exports.doSms = (data)=>{
//     return new Promise((resolve, reject) => {
//         client.verify.services(sericeSid).verifications.create({
//             to:`+91${data.mobile}`,
//             channel:"sms"
//         }).then((response)=>{
//             if(response){
//                 resolve(response)
//             }
//             resolve()
//         })
//     })
// }

// exports.verityOtp =(otp, data) => {
//     return new Promise((resolve, reject) => {
//         client.verify.services(sericeSid).verificationChecks.create({
//             to:`+91${data.phone}`,
//             code:otp.otp
//         }).then((response)=>{
//             console.log("response");
//             resolve(response)
//         })
//     })
// }

exports.userSignUp = (userData) => {
    return new Promise((resolve, reject) => {
        getUser(userData).then(async (res) => {
            if (res) {
                userFound = true;
                return resolve(userFound)
            }
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((response) => {
                resolve()
            }).catch((err) => {
                console.log(err);
            });
        })
    })
}



exports.userSignin = (userData) => {
    return new Promise((resolve, reject) => {
        return getUser(userData).then((data) => {
            if (data) {
                return bcrypt.compare(userData.password, data.password).then((response) => {
                    // console.log("res", response);
                    if (response) {
                        return resolve({ response, data })
                    }
                    resolve()
                }).catch((err) => {
                    console.log(err);
                    reject()
                })
            }
            resolve()
        })
    })
}


exports.createToken = (userData) => {
    // console.log(userData.email);
    return new Promise((resolve, reject) => {
        getUser(userData).then((response) => {
            // console.log(response);
            if (response) {
                return crypto.randomBytes(30, async (err, buffer) => {
                    if (err) {
                        // add - error message
                        return resolve()
                    }
                    const token = await buffer.toString('hex');
                    db.get().collection(collection.USER_COLLECTION).updateOne({ email: response.email }, {
                        $set: {
                            resetToken: token,
                            resetTokenExpiration: Date.now() + 600000
                        }
                    }).then((data) => {
                        // console.log(data);
                        resolve({ response, token })
                    })
                })
            }
            resolve()
        })
    })
}




exports.getNewPass = (token) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then((userData) => {
            if (userData) {
                // console.log("userdata", userData);
                return resolve(userData)
            }
            resolve()
        })
    })
}


exports.resetPass = (data) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(data.uId), resetTokenExpiration: { $gt: Date.now() } }).then(async (user) => {
            if (user) {
                data.password = await bcrypt.hash(data.password, 10);
                return db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(data.uId) }, {
                    $set: {
                        password: data.password,
                        resetToken: undefined,
                        resetTokenExpiration: undefined
                    }
                }).then((response) => {
                    return resolve(response)
                })
            }
            // token expired 
            resolve()
        }).catch((err) => {
            console.log(err);
        })
    })
}



exports.blockUser = (id) => {
    return new Promise((resolve, reject) => {
        getUserById(id).then((user) => {
            if (user) {
                return db.get().collection(collection.USER_COLLECTION).updateOne({ _id: user._id }, {
                    $set: {
                        isBlocked: true
                    }
                }).then((response) => {
                    if (response) {
                        return resolve(response)
                    }
                    resolve()
                })
            }
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}


exports.unblockUser = (id) => {
    return new Promise((resolve, reject) => {
        getUserById(id).then((user) => {
            if (user) {
                return db.get().collection(collection.USER_COLLECTION).updateOne({ _id: user._id }, {
                    $set: {
                        isBlocked: false
                    }
                }).then((response) => {
                    if (response) {
                        return resolve(response)
                    }
                    resolve()
                })
            }
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}


exports.deleteUser = (id) => {
    return new Promise((resolve, reject) => {
        getUserById(id).then((user) => {
            db.get().collection(collection.USER_COLLECTION).deleteOne({ _id: user._id }).then((response) => {
                resolve()
            }).catch((err) => {
                reject(err)
            })
        })
    })
}


exports.addAddress = (adderss, userId) => {
    adderss.time = Date.now()
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userId }, {
            $push: { address: adderss }
        }).then((response) => {
            resolve(response)
        })
    })
}


exports.getAddress = (userId) => {
    return new Promise(async (resolve, reject) => {
        const userAddress = await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $match: { _id: objectId(userId) }
            },
            {
                $unwind: "$address"
            },
            {
                $group: { _id: "$address" }
            },
            {
                $sort: { "_id.time": -1 }
            }


        ]).toArray()
        if (userAddress) {
            return resolve(userAddress)
        }
        resolve()

    })
}

exports.getAddressByAddressId = (data, userId) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {

        const address = await db.get().collection(collection.USER_COLLECTION).aggregate([
            {
                $match: { _id: userId }
            },
            {
                $project: { address: 1 }
            },
            {
                $unwind: "$address"
            },
            {
                $match: { "address.time": parseInt(data) }
            }

        ]).toArray()
        console.log("addr----------------", address);
        if (address) {
            return resolve(address)
        }
        resolve()

    })
}

// edit address

exports.editAddress = (addrId, address, userId) => {
    console.log(addrId);
    console.log(address);
    return new Promise(async (resolve, reject) => {
        try {
            const response = await db.get().collection(collection.USER_COLLECTION).updateOne(
                { _id: userId, "address.time": parseInt(addrId) },
                {
                    $set: {
                        "address.$.name": address.name,
                        "address.$.moblie": address.mobile,
                        "address.$.pincode": address.pincode,
                        "address.$.locality": address.locality,
                        "address.$.address": address.address,
                        "address.$.district": address.district,
                        "address.$.state": address.state
                    }
                }
            )
            console.log(response);
            resolve(response)
        } catch (err) {
            console.log(err);
        }
    })
}

exports.deleteAddress = (addrId, userId) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
            {
                $pull: { address: { time: parseInt(addrId) } }
            }
        )

        resolve(response)
    })
}


exports.editProfile = (userId, data) => {
    console.log(userId);
    console.log(data);
    return new Promise(async (resolve, reject) => {
        const response = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
            {
                $set: {
                    f_name: data.f_name,
                    l_name: data.l_name,
                    email: data.email,
                    mobile: data.mobile
                }
            }
        )

        resolve(response)
    })
}

exports.validatePassword = (password, userId) => {
    try {
        return new Promise(async (resolve, reject) => {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId })
            const response = await bcrypt.compare(password, user.password)
            resolve(response)
        })
    } catch (error) {

    }
}

exports.changePassword = (password, cr_pass, userId) => {
    return new Promise(async (resolve, reject) => {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: userId })
        const response = await bcrypt.compare(cr_pass, user.password)
        const pass = await bcrypt.hash(password, 10)
        if (response) {
            const res = await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: userId }, {
                $set: {
                    password: pass
                }
            })
            console.log(res);
            resolve(res)
        } else {
            resolve()
        }
    })
}


exports.placeOrder = (order, products, cartTotal, coupon_discount,  address, userId) => {
    let discountedAmd = null
    return new Promise(async (resolve, reject) => {
        const status = order.paymentmethod === 'cod' ? 'placed' : 'pending';
        coupon_discount < cartTotal ? discountedAmd = coupon_discount : discountedAmd
        const orderObj = {
            orderId: new objectId(),
            addr: address[0].address,
            paymentmethod: order.paymentmethod,
            totalAmount: cartTotal,
            coupon_discount:discountedAmd,
            products: products,
            status: status,
            date: new Date().toDateString()
        }

        db.get().collection(collection.ORDER_COLLECTION).insertOne({
            user: objectId(userId), orderObj,
            orderprossesing: true,
            Placed: false,
            Pending: true,
            Deliverd: false,
            Canceled: false,
            Placed: false
        }).then(async (response) => {
            if (status === "placed") {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(userId) })
            }
            if (response) {
                resolve(response.insertedId.toString())
            } else {
                resolve()
            }


        })
        // }
    })
}

exports.findOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        const orders = await db.get().collection(collection.ORDER_COLLECTION).find({ user: userId }).toArray()
        resolve(orders)
    })
}

// exports.orderProductsTotal = (userId) => {
//     return new Promise((resolve, reject) => {
//         const productTotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

//         ])
//     })
// }

exports.findLimitedOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: { user: userId }
            },
            {
                $sort: { "orderObj.orderId": -1 }
            },
            {
                $limit: 2
            }
        ]).toArray()
        console.log(order);
        resolve(order)
    })
}

exports.generateRazopay = (total, response) => {
    console.log("total", total);
    return new Promise(async (resolve, reject) => {
        const amount = total;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: response
        };

        instance.orders.create(options, function (err, order) {
            if (err) {
                return console.log("errrrrrrrrrrrrrr", err);
            }
            resolve(order)
        })

    })
}

exports.verifyPayment = (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
        const body = data['payment[razorpay_order_id]'] + "|" + data['payment[razorpay_payment_id]'];
        const expectedSignature = crypto.createHmac('sha256', 'rU5Oo1OqZAgybktcAuxaOrwH').update(body.toString())
            .digest('hex')
        let response = { "signatureIsValid": false }

        if (expectedSignature === data['payment[razorpay_signature]']) {
            response = { "signatureIsValid": true }
            resolve(response)
        } else {
            resolve(response)
        }
    })
}

exports.changePaymentStatus = (orederId, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(orderId)
            },
                {
                    $set: {
                        "orderObj.status": "placed"
                    }
                }
            )
        } catch (error) {

        }
    })
}








exports.getCartCount = (userId) => {
    let cartCount = 0
    return new Promise(async (resolve, reject) => {
        const cart = await db.get().collection(collection.CART_COLLECTION).find({ user: userId }).toArray()
        if (cart.length) {
            cartCount = cart[0].products.length
        }
        resolve(cartCount)
    })
}

exports.getWishlistCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        const whishlist = await db.get().collection(collection.WHISHLIST_COLLECTION).find({ user: userId }).toArray()
       if(whishlist.length){
        const whishlistCount = whishlist[0].product.length
        resolve(whishlistCount)
       }else{
        resolve(0)
       }
    })
}

exports.getOrderCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        const orderCount = await db.get().collection(collection.ORDER_COLLECTION).find({ user: userId }).count()
        resolve(orderCount)
    })
}



// invoice

exports.generateInvoice = (orderId) => {
    return new Promise(async(resolve, reject) => {
        const order = await db.get().collection(collection.ORDER_COLLECTION).findOne({"orderObj.orderId":objectId(orderId)})
        if(order){
            return resolve(order)
        }
        resolve()
    })
}


module.exports.getUser = getUser;