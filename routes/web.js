const homeController = require("../app/http/controllers/homeController");
const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const AdminOrderController = require("../app/http/controllers/admin/orderController");
const StatusController = require("../app/http/controllers/admin/statusController");
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");

const initRoutes = (app) => {
    app.get("/", homeController().index);

    app.get("/cart", cartController().index);
    app.post("/cart", cartController().update);

    app.get("/login", guest, authController().login);
    app.post("/login", authController().postLogin);

    app.get("/register", guest, authController().register);
    app.post("/register", authController().postRegister);
    app.post("/logout", authController().logout);

    // customers
    app.post("/orders", auth, orderController().store);
    app.get("/customer/orders", auth, orderController().index);
    app.get("/customer/orders/:id", auth, orderController().show);

    // Admin route
    app.get("/admin/orders", admin, AdminOrderController().index);
    app.post("/admin/order/status", admin, StatusController().update);

}

module.exports = initRoutes;