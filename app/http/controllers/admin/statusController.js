const Order = require("../../../models/order");
const moment = require("moment");
const statusController = () => {
    return {
        update(req, res) {
            Order.updateOne({ _id: req.body.orderId }, { status: req.body.status })
                .then(data => {
                    // Emit event
                    const eventEmitter = req.app.get("eventEmitter");
                    eventEmitter.emit("orderUpdated", { id: req.body.orderId, status: req.body.status });
                    return res.redirect("/admin/orders");
                }).catch(err => {
                    return res.redirect("/admin/orders");
                });
        }
    }
}

module.exports = statusController;