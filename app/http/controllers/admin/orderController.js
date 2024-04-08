const Order = require("../../../models/order");
const moment = require("moment");
const orderController = () => {
    return {
        index(req, res) {
            Order.find({ status: { $ne: "completed" } }, null, { sort: { createdAt: -1 } })
                .populate("customerId", "-password")
                .then(orders => {
                    if (req.xhr) {
                        return res.json(orders);
                    } else {
                        return res.render('admin/orders', { orders });
                    }
                }).catch(err => {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                });
        }
    }
}

module.exports = orderController;