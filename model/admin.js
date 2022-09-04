const db = require("../util/database");
const collection = require("../util/collection").collection;
const bcrypt = require("bcrypt");
const objectId = require("mongodb").ObjectId;

exports.doSignin = (adminData) => {
  return new Promise((resolve, reject) => {
    if (adminData.email && adminData.password) {
      return db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ email: adminData.email })
        .then((response) => {
          if (response) {
            return bcrypt
              .compare(adminData.password, response.password)
              .then((status) => {
                if (status) {
                  return resolve(status);
                }
                resolve();
              });
          }
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    }
    resolve();
  });
};

// order managemnt

exports.findOrders = (userId) => {
  return new Promise(async (resolve, reject) => {
    const orders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find()
      .toArray();
    resolve(orders);
  });
};

exports.findUser = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const user = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .findOne({ _id: objectId(userId) });
    resolve(user);
  });
};

// Shipped
// Pending
// Deliverd
// Canceled

exports.changeOrderStatus = (status, orderId) => {
  return new Promise(async (resolve, reject) => {
    if (status === "Placed") {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { "orderObj.orderId": objectId(orderId) },
          {
            $set: {
              "orderObj.status": status,
              placed: true,
              shipped: false,
              pending: false,
              deliverd: false,
              canceled: false,
              orderprossesing: false,
            },
          }
        );
      resolve(response);
    } else if (status === "Shipped") {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { "orderObj.orderId": objectId(orderId) },
          {
            $set: {
              "orderObj.status": status,
              placed: false,
              shipped: true,
              pending: false,
              deliverd: false,
              canceled: false,
              orderprossesing: false,
            },
          }
        );
      resolve(response);
    } else if (status === "Pending") {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { "orderObj.orderId": objectId(orderId) },
          {
            $set: {
              "orderObj.status": status,
              placed: false,
              shipped: false,
              pending: true,
              deliverd: false,
              canceled: false,
              orderprossesing: false,
            },
          }
        );
      resolve(response);
    } else if (status === "Deliverd") {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { "orderObj.orderId": objectId(orderId) },
          {
            $set: {
              "orderObj.status": status,
              placed: false,
              shipped: false,
              pending: false,
              deliverd: true,
              canceled: false,
              orderprossesing: false,
            },
          }
        );
      resolve(response);
    } else if (status === "Canceled") {
      const response = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { "orderObj.orderId": objectId(orderId) },
          {
            $set: {
              "orderObj.status": status,
              placed: false,
              shipped: false,
              pending: false,
              deliverd: false,
              canceled: true,
              orderprossesing: false,
            },
          }
        );
      resolve(response);
    }
  });
};

exports.addCoupon = (data) => {
  data.status = "active";
  data.value = parseInt(data.value);
  return new Promise(async (resolve, reject) => {
    const response = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .insertOne(data);
    resolve(response);
  });
};

exports.getCoupon = () => {
  return new Promise(async (resolve, reject) => {
    const coupon = await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .find()
      .toArray();
    if (coupon.length) {
      return resolve(coupon);
    }

    resolve();
  });
};

exports.changeCouponStatus = (couponId, status) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .updateOne(
        { _id: objectId(couponId) },
        {
          $set: {
            status: status,
          },
        }
      );
    resolve();
  });
};

exports.deleteCoupon = (couponId) => {
  return new Promise(async (resolve, reject) => {
    await db
      .get()
      .collection(collection.COUPON_COLLECTION)
      .deleteOne({ _id: objectId(couponId) });
    resolve();
  });
};

exports.findTotalUsers = () => {
  return new Promise(async (resolve, reject) => {
    const totalUsers = await db
      .get()
      .collection(collection.USER_COLLECTION)
      .find()
      .toArray();
    if (totalUsers.length) {
      return resolve(totalUsers.length);
    }
    resolve(0);
  });
};

exports.findTotalOrders = () => {
  return new Promise(async (resolve, reject) => {
    const totalOrders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find()
      .toArray();
    if (totalOrders.length) {
      return resolve(totalOrders.length);
    }
    resolve(0);
  });
};

exports.findTotalProfit = () => {
  return new Promise(async (resolve, reject) => {
    const totalProfit = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $project: {
            total: "$orderObj.totalAmount",
          },
        },
        {
          $group: {
            _id: null,
            profit: {
              $sum: {
                $multiply: ["$total"],
              },
            },
          },
        },
      ])
      .toArray();

    if (totalProfit[0]) {
      return resolve(totalProfit[0].profit);
    }

    resolve(0);
  });
};

exports.findProfitFromCod = () => {
  return new Promise(async (resolve, reject) => {
    const codProfit = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            "orderObj.paymentmethod": "cod",
          },
        },
        {
          $group: {
            _id: null,
            profit: {
              $sum: {
                $multiply: ["$orderObj.totalAmount"],
              },
            },
          },
        },
      ])
      .toArray();

    if (codProfit[0]) {
      return resolve(codProfit[0].profit);
    }

    resolve(0);
  });
};

exports.findProfitFromOnlineP = () => {
  return new Promise(async (resolve, reject) => {
    const onlinePProfit = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            "orderObj.paymentmethod": "online-payment",
          },
        },
        {
          $group: {
            _id: null,
            profit: {
              $sum: {
                $multiply: ["$orderObj.totalAmount"],
              },
            },
          },
        },
      ])
      .toArray();

    if (onlinePProfit[0]) {
      return resolve(onlinePProfit[0].profit);
    }
    resolve(0);
  });
};

exports.findOnlinePOrders = () => {
  return new Promise(async (resolve, reject) => {
    const onlinePOrders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find({ "orderObj.paymentmethod": "online-payment" })
      .toArray();
    if (onlinePOrders.length) {
      return resolve(onlinePOrders.length);
    }
    resolve(0);
  });
};

exports.findCodPOrders = () => {
  return new Promise(async (resolve, reject) => {
    const codOrders = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .find({ "orderObj.paymentmethod": "cod" })
      .toArray();
    if (codOrders.length) {
      return resolve(codOrders.length);
    }

    resolve(0);
  });
};

exports.findOrdrsByStatus = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const deliverd = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ deliverd: true })
        .toArray();
      const shipped = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ shipped: true })
        .toArray();
      const canceled = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ canceled: true })
        .toArray();
      const placed = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ placed: true })
        .toArray();
      const pending = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ pending: true })
        .toArray();
      // console.log(deliverd, shipped, canceled, placed, pending);
      resolve({
        deliverd: deliverd.length,
        shipped: shipped.length,
        canceled: canceled.length,
        placed: placed.length,
        pending: pending.length,
      });
    } catch (error) {
      return error;
    }
  });
};

exports.findProfitByMonth = (req, res) => {
  return new Promise(async (resolve, reject) => {
    const profit = await db
      .get()
      .collection(collection.ORDER_COLLECTION)
      .aggregate([
        {
          $match: {
            Canceled: { $ne: true },
          },
        },

        {
          $group: {
            _id: {
              $month: {
                $dateFromString: {
                  dateString: "$orderObj.date",
                },
              },
            },
            amount: {
              $sum: "$orderObj.totalAmount",
            },
          },
        },
      ])
      .toArray();

    // const earnings = [];
    // const month = [
    //   { alp: "Jan", num: 1 },
    //   { alp: "Feb", num: 2 },
    //   { alp: "Mar", num: 3 },
    //   { alp: "Apr", num: 4 },
    //   { alp: "May", num: 5 },
    //   { alp: "Jun", num: 6 },
    //   { alp: "Jul", num: 7 },
    //   { alp: "Aug", num: 8 },
    //   { alp: "Sep", num: 9 },
    //   { alp: "Oct", num: 10 },
    //   { alp: "Nov", num: 11 },
    //   { alp: "Dis", num: 12 },
    // ];

    // month.forEach((month, i) => {
    //   if (month[i].num + 1 == profit[i]._id + 1) {
    //     earnings.push({ total: profit[i].amount, month: month[i].alp });
    //   }
    // });

    console.log(profit);
    resolve(profit);
  });
};
