const Menu = require("../../models/menu");

const homeController = () => {
    return {
        async index(req, res) {
            let menus = await Menu.find();
            res.render("home.ejs", { menus });
        }
    }
}
module.exports = homeController;