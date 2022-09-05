const db = require('../util/database');
const collection = require('../util/collection').collection;
const objectId = require('mongodb').ObjectId;
let productTotal;

exports.findProductById = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const product = await db.get().collection(collection.PRODUCT_COLLECTIION).findOne({ _id: objectId(productId) })
            if (product) {
                return resolve(product)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
       
    })
}

exports.addProduct = (product) => {
    product.actual_price = parseInt(product.actual_price);
    product.discount_price = parseInt(product.discount_price);
    product.tags = product.tags.split(',');
    product.category = objectId(product.category);
    product.time = Date.now();
    return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTIION).insertOne(product).then((response) => {
            resolve(response)
        }).catch((err) => {

        })
    })
}


exports.getAllProduct = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const products = await db.get().collection(collection.PRODUCT_COLLECTIION).aggregate(
                [
                    {
                        $lookup: {
                            from: "category",
                            localField: "category",
                            foreignField: "_id",
                            as: "lookup_category"
                        }
                    },
                    {
                        $project: {
                            product_name: 1,
                            brand_name: 1,
                            actual_price: 1,
                            discount_price: 1,
                            category: 1,
                            stock: 1,
                            size: 1,
                            discription: 1,
                            tags: 1,
                            img_id: 1,
                            lookup_category: 1,
                            dis_per: {
                                $toInt: [
                                    {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    { $subtract: ["$actual_price", "$discount_price"] },
                                                    "$actual_price"
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            ).toArray();
            if (products) {
                return resolve(products)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}


exports.searchProduct = (search) => {

    console.log(search);
    return new Promise(async (resolve, reject) => {
        const result = await db.get().collection(collection.PRODUCT_COLLECTIION).aggregate(
            [
                {
                    '$lookup': {
                        'from': 'category',
                        'localField': 'category',
                        'foreignField': '_id',
                        'as': 'result'
                    }
                }, {
                    '$match': {
                        '$or': [
                            {
                                'product_name': {
                                    '$regex': search,
                                }
                            }, {
                                'result.category': {
                                    '$regex': search,
                                }
                            }
                        ]
                    }
                }
            ]
        ).toArray()
        resolve(result)
    })
}

// const products = await db.get().collection(collection.PRODUCT_COLLECTIION).find().toArray()
//         if (products) {
//             return resolve(products)
//         }
//         resolve()

exports.deleteProduct = (id) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTIION).deleteMany({ _id: objectId(id) }).then((response) => {
            if (response) {
                return resolve(response)
            }
            resolve()
        }).catch((err) => {

        })
    })
}



exports.getProduct = (id) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTIION).findOne({ _id: objectId(id) }).then((product) => {
            if (product) {
                return resolve(product)
            }
            resolve()
        }).catch((err) => {

        })
    })
}


exports.editProduct = (productDtls, id) => {
    console.log(productDtls, id);
    productDtls.tags = productDtls.tags.split(',')
    productDtls.category = objectId(productDtls.category)
    return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTIION).updateOne({ _id: objectId(id) }, {
            $set: {
                product_name: productDtls.product_name,
                brand_name: productDtls.brand_name,
                actual_price: parseInt(productDtls.actual_price),
                discount_price: parseInt(productDtls.discount_price),
                category: productDtls.category,
                stock:productDtls.stock,
                size:productDtls.size,
                discription: productDtls.discription,
                tags: productDtls.tags,
                img_id: productDtls.img_id
            }
        }).then((response) => {
            if (response) {
                return resolve(response)
            }
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}


exports.filterCategory = (filter) => {
    return new Promise(async (resolve, reject) => {
        try {
            const products = await db.get().collection(collection.PRODUCT_COLLECTIION).aggregate(
                [
                    {
                        $lookup: {
                            from: collection.CATEGORY,
                            localField: "category",
                            foreignField: "_id",
                            as: "lookup_category"
                        }
                    }
                ]
            ).toArray()
            const filterProducts = products.filter((prods) => {
                console.log(prods);
                return prods.lookup_category[0].category == filter
            })
            if (products) {
                return resolve(filterProducts)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

exports.filterByPrice = (data) => {
    console.log(data.filter);
    return new Promise(async (resolve, reject) => {
        try {
            const products = await db.get().collection(collection.PRODUCT_COLLECTIION).find().sort({ discount_price: data.filter }).toArray()
            if (products) {
                return resolve(products)
            }
        } catch (error) {
            console.log(error);
        }
    })
}

exports.getCategory = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const category = await db.get().collection(collection.CATEGORY).find().toArray();
            if (category) {
                return resolve(category)
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}


exports.addtoCart = (productId, size = null, qty= null, userId) => {
    const productObj = {
        item: objectId(productId),
        qty: 1,
        size:null
    }

    if(size && qty){
        productObj.qty = qty
        productObj.size = size
    }

    console.log(size, qty);
    
    return new Promise(async (resolve, reject) => {
        const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
        if (userCart) {
            const productExist = userCart.products.findIndex((product) => {
                return product.item == productId
            })
            if (productExist != -1) {
                // console.log("prodExist", productExist);
                return db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                    {
                        $inc: { 'products.$.qty': 1 }
                    }
                ).then((response) => {
                    resolve(response)
                })
            }
            db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {
                $push: { products: productObj }
            }).then((response) => {
                if (response) {
                    console.log("res after push product", response);
                    return resolve(response)
                }
                resolve()
            })
        } else {
            const cartObj = {
                user: objectId(userId),
                products: [productObj],
                total: null
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                if (response) {
                    return resolve(response)
                }
                resolve()
            })
        }
    })
}

exports.getCartItems = (userId) => {
    return new Promise(async (resolve, reject) => {
        const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
            [
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        qty: '$products.qty',
                        size:"$products.size"
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, qty: 1, size:1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $addFields: {
                        sum: { $multiply: ["$products.discount_price", "$qty"] }
                    }
                }
            ]
        ).toArray()
        console.log("cartitems", cartItems);
        if (cartItems) {
            const total = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            user: objectId(userId)
                        }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            qty: '$products.qty'
                        }
                    }, {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTIION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, qty: 1, products: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            total: { $sum: { $multiply: ['$qty', '$products.discount_price'] } }
                        }
                    }
                ]
            ).toArray()

            if (cartItems.length)
                return resolve(cartItems)
            resolve()
        }
        resolve()
    })
}

exports.incQtyAndTotal = (userId, data) => {
    const total = 0
    const count = parseInt(data.count)
    return new Promise(async (resolve, reject) => {
        return db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(data.cart), 'products.item': objectId(data.product) },
            {
                $inc: { 'products.$.qty': count }
            }
        ).then((response) => {
            let res = {
                response,
                total
            }
            resolve(res)
        })
    })
}

exports.changeSize = (userId, data) => {
    return new Promise(async (resolve, reject) => {
        return db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(data.cart), 'products.item': objectId(data.product) },
            {
                $inc: { 'products.$.size': data.size }
            }
        ).then((response) => {
            resolve()
        })
    })
}


exports.deleteCartItem = (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
        return db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(data.cart) },
            {
                $pull: { products: { item: objectId(data.product) } }
            }
        ).then((response) => {
            resolve(response)
        }).catch((err) => {
            console.log(err);
        })
    })
}


exports.getCartTotal = (userId) => {
    return new Promise(async (resolve, reject) => {
        const cartTotal = await db.get().collection(collection.CART_COLLECTION).aggregate(
            [
                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        qty: '$products.qty'
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, qty: 1, products: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$qty', '$products.discount_price'] } }
                    }
                }

            ]
        ).toArray()
        if (cartTotal.length) {
            return resolve(cartTotal[0].total)
        } else {
            resolve()
        }

    }).catch((err) => {
        console.log(err);
    })
}


// return new Promise(async (resolve, reject) => {
//     const total = await db.get().collection(collection.CART_COLLECTION).aggregate(
//         [
//             {
//                 $match: {
//                     user: objectId(userId)
//                 }
//             },
//             {
//                 $unwind: '$products'
//             },
//             {
//                 $project: {
//                     item: '$products.item',
//                     qty: '$products.qty'
//                 }
//             }, {
//                 $lookup: {
//                     from: collection.PRODUCT_COLLECTIION,
//                     localField: 'item',
//                     foreignField: '_id',
//                     as: 'product'
//                 }
//             },
//             {
//                 $project: {
//                     item: 1, qty: 1, products: { $arrayElemAt: ['$product', 0] }
//                 }
//             },
//             {
//                 $project:{
//                     total:{$sum:{$multiply:['$qty', '$products.price']}}
//                 }
//             }

//         ]
//     ).toArray()
//     console.log("total", total);
//     if (total) {
//         return resolve(total)
//     }
//     resolve()
// })


exports.addWhishlist = (userId, proId) => {
    const whishlist = {
        user: objectId(userId),
        product: [objectId(proId)]
    }
    return new Promise(async (resolve, reject) => {
        try {

            const user = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({ user: objectId(userId) })
            if (user) {
                const isProduct = await db.get().collection(collection.WHISHLIST_COLLECTION).findOne({ product: objectId(proId) })
                if (isProduct) {
                    return resolve()
                }
                db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({ user: objectId(userId) }, {
                    $push: { 'product': objectId(proId) }
                })
                    .then((response) => {
                        resolve()
                    })
            } else {
                console.log("false");
                const addWhishlist = await db.get().collection(collection.WHISHLIST_COLLECTION)
                    .insertOne(whishlist)
                if (addWhishlist) {
                    return resolve(addWhishlist)
                }
                resolve()
            }
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })
}






exports.getWishlistproducts = (userID) => {
    return new Promise(async (resolve, reject) => {
        let wishProducts = await db.get().collection(collection.WHISHLIST_COLLECTION).aggregate([
            { $match: { user: objectId(userID) } },
            { $unwind: '$product' },
            { $project: { item: '$product' } },

            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTIION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $project: {
                    item: 1,
                    product: {
                        $arrayElemAt: ['$productDetails', 0]
                    }
                }
            }

        ]).toArray()

        resolve(wishProducts)
    })
}

exports.removeFromWislist = (data) => {
    console.log("data", data);
    return new Promise((resolve, reject) => {
        return db.get().collection(collection.WHISHLIST_COLLECTION).updateOne({ _id: objectId(data.wishlist) },
            {
                $pull: { product: objectId(data.product) }
            }
        ).then((response) => {
            console.log(response);
            resolve(response)
        })
    })
}


exports.getCoupon = (userId) => {
    return new Promise(async (resolve, reject) => {
        const res = await db.get().collection(collection.COUPON_COLLECTION).find({ "users": userId }).toArray()
        if (res.length) {
            return resolve()
        }
        const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ status: "active" })

        resolve(coupon)
    })
}

exports.removeCoupon = (userId) => {
    return new Promise(async (resolve, reject) => {
        const response = await db.get().collection(collection.CART_COLLECTION).updateOne({ user: userId },
            {
                $set: {
                    total: null
                }
            }
        )

        if (response) {
            return resolve(response)
        }

        resolve()
    })
}

exports.create_coupon_discount = async (couponCode, userId) => {
    try {
        const status = {};
        const coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: couponCode })
        if (!couponCode) {
            status.isValid = false;
            return status;
        } else {
            status.isValid = true;
            const discount_amd = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        item: "$products.item",
                        qty: "$products.qty"
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "item",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $project: {
                        item: 1,
                        qty: 1,
                        product: {
                            $arrayElemAt: ['$products', 0]
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: {

                                $multiply: [
                                    "$product.discount_price",
                                    "$qty"
                                ]

                            }
                        }
                    }
                },
                {
                    $addFields: {
                        d_total: {
                            $subtract: [
                                "$total",
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                "$total",
                                                coupon.value
                                            ],
                                        },
                                        100
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        discount: {
                            $subtract: [
                                "$total",
                                "$d_total"
                            ]
                        }
                    }
                }

            ]).toArray()


            const discountAmd = discount_amd[0].d_total;

            if (discount_amd) {
                const response = await db.get().collection(collection.CART_COLLECTION).updateOne({ user: userId },
                    {
                        $set: {
                            total: discountAmd
                        }
                    }
                )
            }


            await db.get().collection(collection.COUPON_COLLECTION).updateOne({ code: couponCode },
                {
                    $push: {
                        "users": userId
                    }
                })

            return ({ discount: discount_amd[0], status })
        }
    } catch (error) {

    }
}

exports.isDiscountAvailable = (userId) => {
    return new Promise(async (resolve, reject) => {
        const cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: userId });
        console.log(cart);
        if (cart.total) {
            return resolve(cart.total)
        }
        resolve()
    })
}