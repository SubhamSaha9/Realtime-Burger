import axios from "axios";
import Noty from 'noty';
import { initAdmin } from "./admin";
import { initStripe } from "./stripe";
import moment from "moment";

let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");

const updateCart = (pizza) => {
    axios.post("/cart", pizza).then(res => {
        cartCounter.innerText = res.data.totalQty;
        new Noty({
            type: "success",
            timeout: 1500,
            text: 'Item added to cart',
            progressBar: false
        }).show();
    }).catch(err => {
        new Noty({
            type: "error",
            timeout: 1500,
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

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}


let hiddenOrders = document.querySelector("#hiddenOrder");
let customerOrders = hiddenOrders ? hiddenOrders.value : null;
customerOrders = JSON.parse(customerOrders);
let links = document.querySelectorAll(".link");

if (customerOrders) {
    customerOrders.forEach((customerOrder) => {
        if (customerOrder.status === "completed") {
            for (let link of links) {
                let id = link.dataset.id;
                if (customerOrder._id === id) {
                    link.style.textDecoration = "line-through";
                }
            }
        }
    })
}



// Change order status
let statuses = document.querySelectorAll(".status_line");
let hiddenInput = document.querySelector("#hiddenInput");
let order = hiddenInput ? hiddenInput.value : null;
order = JSON.parse(order);
let time = document.createElement("small");

function updateStatus(order) {
    statuses.forEach((status) => {
        status.classList.remove("step-completed");
        status.classList.remove("current");
    })
    let stepCompleted = true;
    statuses.forEach((status) => {
        let dataProp = status.dataset.status;
        if (stepCompleted) {
            status.classList.add("step-completed");
        }
        if (dataProp === order.status) {
            stepCompleted = false;
            time.innerText = moment(order.updatedAt).format("hh:mm A");
            status.appendChild(time);
            if (status.nextElementSibling) {
                status.nextElementSibling.classList.add("current");
            }
        }
    })
}
updateStatus(order);



initStripe();



let socket = io();

if (order) {
    socket.emit("join", `order_${order._id}`);
}

let adminAreaPath = window.location.pathname;
if (adminAreaPath.includes("admin")) {
    initAdmin(socket);
    socket.emit("join", "adminRoom");
}

socket.on("orderUpdated", (data) => {
    const updatedOrder = { ...order };
    updatedOrder.updatedAt = moment().format();
    updatedOrder.status = data.status;
    updateStatus(updatedOrder);
    new Noty({
        type: "success",
        timeout: 1500,
        text: 'Order Updated',
        progressBar: false
    }).show();
})