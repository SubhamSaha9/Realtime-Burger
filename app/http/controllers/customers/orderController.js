const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const orderController = () => {
    return {
        store(req, res) {
            const { phone, address, stripeToken, paymentType } = req.body;
            if (!phone || !address) {
                return res.status(422).json({ message: "All fields are required!" });
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address
            })
            order.save().then(result => {
                Order.populate(result, { path: "customerId" })
                    .then(placedOrder => {
                        // req.flash("success", "Order placed successfully!");

                        if (paymentType === 'card') {
                            stripe.charges.create({
                                amount: req.session.cart.totalPrice * 100,
                                source: stripeToken,
                                currency: 'inr',
                                description: `Burger order: ${placedOrder._id}`
                            }).then(() => {
                                placedOrder.paymentStatus = true;
                                placedOrder.paymentType = paymentType;
                                placedOrder.save().then((ord) => {
                                    // Emit event
                                    const eventEmitter = req.app.get("eventEmitter");
                                    eventEmitter.emit("orderPlaced", ord);
                                    delete req.session.cart;
                                    return res.json({ message: "Payment successful. Order placed successfully!" });
                                }).catch(e => {
                                    console.log(e);
                                })
                            }).catch(() => {
                                // Emit event
                                const eventEmitter = req.app.get("eventEmitter");
                                eventEmitter.emit("orderPlaced", placedOrder);
                                delete req.session.cart;
                                return res.json({ message: "Order placed but payment failed! You can pay at delivery time" });
                            })
                        } else {
                            // Emit event
                            const eventEmitter = req.app.get("eventEmitter");
                            eventEmitter.emit("orderPlaced", placedOrder);
                            delete req.session.cart;
                            return res.json({ message: 'Order placed succesfully' });
                        }

                        // return res.redirect("/customer/orders");
                    })
                    .catch(err => {
                        // Handle error
                        console.error(err);
                        return res.status(500).send('Internal Server Error');
                    });
            }).catch(err => {
                return res.status(500).json({ message: "Something went wrong!" });
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, null, { sort: { "createdAt": -1 } });
            res.header('Cache-Control', 'no-store');
            res.render("customers/orders", { orders: orders, moment: moment });
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id);
            if (req.user._id.toString() === order.customerId.toString()) {
                res.render("customers/singleOrder", { order });
            } else {
                return res.redirect("/");
            }
        }
    }
}

module.exports = orderController;