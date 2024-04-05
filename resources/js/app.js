import axios from "axios";
import Noty from 'noty';
let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

const updateCart = (pizza) => {
    axios.post("/cart", pizza).then(res => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: "success",
            timeout: 1700,
            text: 'Item added to cart',
            progressBar: false
        }).show();
    }).catch(err => {
        new Noty({
            type: "error",
            timeout: 1700,
            text: 'Something went wrong!',
            progressBar: false
        }).show();
    })
}

addToCart.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
    })
})