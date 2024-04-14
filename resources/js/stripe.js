
import { loadStripe } from '@stripe/stripe-js';
import { placeOrder } from "./apiService";

export async function initStripe() {
    const stripe = await loadStripe('pk_test_51P497ASAhMTVbtyGP8eWJ2qUWU1UnarfTfnH3jz83qbJNMcq0MDqivqczl7hUDhU4zwPJqSEmJDcKRzTtC9gIN2Z00aoikIcui');

    let card = null;
    function mountWigit() {
        const elements = stripe.elements();
        let style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        };
        card = elements.create("card", { style, hidePostalCode: true });
        card.mount("#card-element");
    }


    let paymentType = document.querySelector("#paymentType");
    if (!paymentType) {
        return;
    }
    paymentType.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            // Display Widget
            // card = new CardWidget(stripe)
            mountWigit();
            // card.mount()
        } else {
            card.destroy()
        }

    })



    // Ajax call
    let paymentForm = document.querySelector("#payment-form");
    if (paymentForm) {
        paymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            let formData = new FormData(paymentForm);
            let formObject = {};
            for (let [key, value] of formData) {
                formObject[key] = value;
            }

            if (!card) {
                placeOrder(formObject);
                return;
            }

            // Verify card
            stripe.createToken(card).then(result => {
                formObject.stripeToken = result.token.id;
                placeOrder(formObject);
            }).catch(err => {
                console.log(err);
            })


        })
    }

}