const db = require('../util/database');
const collection = require('../util/collection').collection;
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId


exports.doSignin = (adminData) => {
    return new Promise((resolve, reject) => {
        if (adminData.email && adminData.password) {
            return db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email }).then((response) => {
                if (response) {
                    return bcrypt.compare(adminData.password, response.password).then((status) => {
                        if (status) {
                            return resolve(status)
                        }
                        resolve()
                    })
                }
                resolve()
            }).catch((err) => {
                reject(err)
            })
        }
        resolve();
    })
}

// order managemnt

exports.findOrders = (userId) => {
    return new Promise(async (resolve, reject) => {
        const orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
        resolve(orders)
    })
}


exports.findUser = async (userId) => {
    return new Promise(async (resolve, reject) => {
        const user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userId) })
        resolve(user)
    })
}

// Shipped
// Pending
// Deliverd
// Canceled

exports.changeOrderStatus = (status, orderId) => {
    return new Promise(async (resolve, reject) => {
        if (status === 'Placed') {
            const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ "orderObj.orderId": objectId(orderId) },
                {
                    $set: {
                        "orderObj.status": status,
                        placed: true,
                        shipped: false,
                        pending: false,
                        deliverd: false,
                        canceled: false,
                    }
                })
            resolve(response)
        } else if (status === 'Shipped') {
            const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ "orderObj.orderId": objectId(orderId) },
                {
                    $set: {
                        "orderObj.status": status,
                        placed: false,
                        shipped: true,
                        pending: false,
                        deliverd: false,
                        canceled: false,
                    }
                })
            resolve(response)
        } else if (status === 'Pending') {
            const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ "orderObj.orderId": objectId(orderId) },
                {
                    $set: {
                        "orderObj.status": status,
                        placed: false,
                        shipped: false,
                        pending: true,
                        deliverd: false,
                        canceled: false,
                    }
                })
            resolve(response)
        } else if (status === 'Deliverd') {
            const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ "orderObj.orderId": objectId(orderId) },
                {
                    $set: {
                        "orderObj.status": status,
                        placed: false,
                        shipped: false,
                        pending: false,
                        deliverd: true,
                        canceled: false,
                    }
                })
            resolve(response)
        } else if (status === 'Canceled') {
            const response = await db.get().collection(collection.ORDER_COLLECTION).updateOne({ "orderObj.orderId": objectId(orderId) },
                {
                    $set: {
                        "orderObj.status": status,
                        placed: false,
                        shipped: false,
                        pending: false,
                        deliverd: false,
                        canceled: true,
                    }
                })
            resolve(response)
        }
    })
}

exports.addCoupon = (data) => {
    data.status = "active"
    data.value = parseInt(data.value)
    return new Promise(async (resolve, reject) => {
        const response = await db.get().collection(collection.COUPON_COLLECTION).insertOne(data)
        resolve(response)
    })
}

