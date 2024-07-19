const Menu = require("../../models/menu");

const homeController = () => {
    return {
        async index(req, res) {
            let menus = await Menu.find();
            res.render("home.ejs", { menus });
        },
        policy(req, res) {
            res.render("legal/policy.ejs");
        },
        condition(req, res) {
            res.render("legal/conditions.ejs");
        },
        refund(req, res) {
            res.render("legal/refund.ejs");
        },
        delivery(req, res) {
            res.render("legal/delivery.ejs");
        }
    }
}
module.exports = homeController;