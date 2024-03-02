require("dotenv").config();
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const { Order } = require("../models/order");

const bodyParser = require("body-parser");
router.use(bodyParser.json());

const stripe = Stripe(process.env.STRIPE_KEY);

router
  .post("/:id", async (req, res) => {
    const paymentOrder = await Order.findById(req.params.id)
      .populate("user")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
        }, 
      });
    console.log(paymentOrder);
    const order_items = Array.isArray(paymentOrder.orderItems)
      ? paymentOrder.orderItems
      : [];
    const customer = await stripe.customers.create({
      metadata: {
        userId: paymentOrder.userId,
        cart: JSON.stringify(paymentOrder.orderItems),
      },
    });
    console.log(order_items);
    const line_items = order_items.map((item) => {
      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            description: item.product.description,
            metadata: {
              item: item._id,
            },
          },
          unit_amount: item.product.price * 100,
        },
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "KE"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free shipping",
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "usd",
            },
            display_name: "Next day air",
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      line_items,
      mode: "payment",
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/products`,
      cancel_url: `${process.env.CLIENT_URL}/payments`,
    });
    res.send({ url: session.url });
  })
  // .then((success_url) => {
  //   console.log('gvgfbf')
  //   const order = Order.findByIdAndUpdate(
  //     paymentOrder._id,
  //     {
    
  //       status: "SUCCESS",
  //     },
  //     { new: true }
  //   );
  // });

module.exports = router;

// router.post('/:id', async (req, res) => {
//     try {
//         const paymentOrder = await Order.findById(req.params.id)
//         .populate('user', 'name')
//         .populate({
//             path: 'orderItems', populate: {
//                 path: 'product', populate: 'category'
//             }
//         });
//         const line_items=JSON.stringify(paymentOrder.orderItems)
//         console.log(line_items)
//         console.log(paymentOrder)
//         const payment = await stripe.paymentLinks.create({
//             line_items:line_items,

//             currency: "usd"
//         });
//         console.log(payment.url)
//         return res.redirect(payment.url)
//     } catch (error) {
//         console.error('Error creating product:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// });
// module.exports = router;
// router.post("/create-checkout-session", async (req, res) => {
//   const customer = await User.findById()
//   console.log(customer)

//   const line_items = req.body.orderItems.map((item) => {
//     return {
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: item.name,
//           images: [item.image],
//           description: item.desc,
//           metadata: {
//             id: item.id,
//           },
//         },
//         unit_amount: item.price * 100,
//       },
//       quantity: item.cartQuantity,
//     };
//   });

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     shipping_address_collection: {
//       allowed_countries: ["US", "CA", "KE"],
//     },
//     shipping_options: [
//       {
//         shipping_rate_data: {
//           type: "fixed_amount",
//           fixed_amount: {
//             amount: 0,
//             currency: "usd",
//           },
//           display_name: "Free shipping",
//           // Delivers between 5-7 business days
//           delivery_estimate: {
//             minimum: {
//               unit: "business_day",
//               value: 5,
//             },
//             maximum: {
//               unit: "business_day",
//               value: 7,
//             },
//           },
//         },
//       },
//       {
//         shipping_rate_data: {
//           type: "fixed_amount",
//           fixed_amount: {
//             amount: 1500,
//             currency: "usd",
//           },
//           display_name: "Next day air",
//           // Delivers in exactly 1 business day
//           delivery_estimate: {
//             minimum: {
//               unit: "business_day",
//               value: 1,
//             },
//             maximum: {
//               unit: "business_day",
//               value: 1,
//             },
//           },
//         },
//       },
//     ],
//     phone_number_collection: {
//       enabled: true,
//     },
//     line_items,
//     mode: "payment",
//     customer: customer.id,
//     success_url: `${process.env.CLIENT_URL}/checkout-success`,
//     cancel_url: `${process.env.CLIENT_URL}/cart`,
//   });

//   // res.redirect(303, session.url);
//   res.send({ url: session.url });
// });

// // Create order function

// const createOrder = async (customer, data) => {
//   const Items = JSON.parse(customer.metadata.cart);

//   const products = Items.map((item) => {
//     return {
//       productId: item.id,
//       quantity: item.cartQuantity,
//     };
//   });

//   const newOrder = new Order({
//     userId: customer.metadata.userId,
//     customerId: data.customer,
//     paymentIntentId: data.payment_intent,
//     products,
//     subtotal: data.amount_subtotal,
//     total: data.amount_total,
//     shipping: data.customer_details,
//     payment_status: data.payment_status,
//   });

//   try {
//     const savedOrder = await newOrder.save();
//     console.log("Processed Order:", savedOrder);
//   } catch (err) {
//     console.log(err);
//   }
// };

// // Stripe webhoook

// router.post(
//   "/webhook",
//   express.json({ type: "application/json" }),
//   async (req, res) => {
//     let data;
//     let eventType;

//     // Check if webhook signing is configured.
//     let webhookSecret;
//     //webhookSecret = process.env.STRIPE_WEB_HOOK;

//     if (webhookSecret) {
//       // Retrieve the event by verifying the signature using the raw body and secret.
//       let event;
//       let signature = req.headers["stripe-signature"];

//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           signature,
//           webhookSecret
//         );
//       } catch (err) {
//         console.log(`⚠️  Webhook signature verification failed:  ${err}`);
//         return res.sendStatus(400);
//       }
//       // Extract the object from the event.
//       data = event.data.object;
//       eventType = event.type;
//     } else {
//       // Webhook signing is recommended, but if the secret is not configured in `config.js`,
//       // retrieve the event data directly from the request body.
//       data = req.body.data.object;
//       eventType = req.body.type;
//     }

//     // Handle the checkout.session.completed event
//     if (eventType === "checkout.session.completed") {
//       stripe.customers
//         .retrieve(data.customer)
//         .then(async (customer) => {
//           try {
//             // CREATE ORDER
//             createOrder(customer, data);
//           } catch (err) {
//             console.log(typeof createOrder);
//             console.log(err);
//           }
//         })
//         .catch((err) => console.log(err.message));
//     }

//     res.status(200).end();
//   }
// );

// module.exports = router;

// // const stripe = require('stripe')('sk_test_51OXiRCSBLCgrGSzMe5AYorUl6gurNKVZmaABv9PKZHV1cbCc4JCejRmxgTDuSPzPwEpaS3M804cVx3cemfPGT2zd00JGSVkDmQ');
// // const express = require('express');
// // const router = express();
// // const {Order} = require('../models/order')

// // router.post('/:id', async (req, res) => {
// //     try {
// //         const order = await Order.findById(req.params.id)
// //             .populate('user', 'name')
// //             .populate({
// //                 path: 'orderItems', populate: {
// //                     path: 'product', populate: 'category'
// //                 }
// //             });
// //             console.log(order)
// //         if (!order) {
// //             res.status(500).json({ success: false })
// //         } else {
// //             const Paymnet = await stripe.paymentLinks.create({
// //                 currency: "inr",
// //                 payment_method_types: ["card"],
// //                 line_items: order.orderItems.map((item) => ({
// //                     price:order.totalPrice, quantity: item.count
// //                     })),
// //                     // ?redirect_url=https://example.com/completed
// //                     // url: `${process.env.CLIENT_URL}/orders`,

// //                 // product: order.orderItems,
// //                 // currency: "usd",
// //                 // user: order.user,
// //                 // price: order.totalPrice,
// //                 // url: "https://buy.stripe.com/test_cN25nr0iZ7bUa7meUY"
// //             });
// //             console.log(Paymnet)
// //             return res.redirect(Paymnet.url)
// //         }
// //     } catch (error) {
// //         console.error('Error creating product:', error);
// //         return res.status(500).send('Internal Server Error');
// //     }
// // });

// // module.exports = router;
