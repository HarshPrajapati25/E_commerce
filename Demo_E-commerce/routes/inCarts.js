const express=require('express')
const router=express.Router()
const {InCart}=require('../models/InCart')

router.get(`/`, async (req, res) => {
    const inCartList = await InCart.find();

    if (!inCartList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(inCartList); 
}) 

router.get('/:id',async (req,res)=>{
    const id=req.params.id;
    const item=await InCart.findById(id)
    if(!item){
        return res.status(404).json({msg:"No Item found"});
        }else{
            res.json(item);
            }
})

router.post(`/`, async (req, res) => {
    let inCartList = new InCart({
        productItem:req.body.productItem,
        user:req.body.user    
    })
    inCartList = await inCartList.save();

    if (!inCartList)
        return res.status(400).send('the inCartList cannot be created!')

    res.send(inCartList);
})

router.put('/:inCartId', async (req, res) => {
    const { inCartId } = req.params;
    const { type,productId } = req.body;

    const inCartInstance = await InCart.findById(inCartId);
    console.log(type);

        if(type==="increament"){ 
            inCartInstance.productItem.map((item)=>{

                console.log(item.product,productId);
              if(item.product.toString()===productId) {
 
                console.log(item.product,productId); 
                item.qty=item.qty+1; 
              }else{
                return res.send("err") ;
              }  
            })
        }
 
        if(type==="decreament"){ 
            inCartInstance.productItem.map((item)=>{

                console.log(item.product,productId);
              if(item.product.toString()===productId) {
 
                console.log(item.product,productId);
                item.qty=item.qty-1;
              }else{
                return res.send("err") ;
              }    
            })
        }
        await inCartInstance.save();
        return res.json(inCartInstance);
});

router.delete('/:id', async (req, res) => {
    let inCart = await InCart.findOneAndDelete(req.params.id).then(inCart => {
        if (inCart) {
            return res.status(200).json({ success: true, message: 'the InCart is deleted!' })
        } else {
            return res.status(404).json({ success: false, message: "InCart not found!" })
        }
    }).catch(err => {
        return res.status(500).json({ success: false, error: err })
    })
})
        

module.exports=router           





// router.post('/checkout/:id',async (req,res)=>{
//     const checkoutID = await InCart.findById(req.params.id);
//     if(!checkoutID){ 
//         res.status(500).json({success:false})
//     }
//     else
//     {
//         await InCart.findOneAndDelete(checkoutID).then(
//             async(req,res)=>{
//                 checkoutID.push(orderList)
//                 // console.log("aa")
//             // let order = await new Order({
//             //     orderItems: checkoutID,
//             //     shippingAddress1: req.body.shippingAddress1,
//             //     shippingAddress2: req.body.shippingAddress2,
//             //     city: req.body.city,
//             //     zip: req.body.zip,
//             //     country: req.body.country,
//             //     phone: req.body.phone, 
//             //     status: req.body.status,
//             //     // totalPrice: totalPrice, 
//             //     // user: req.body.user,
//             // })
//             console.log(orderList)
//             // Order= await order.save()
//             // // console.log("order",order)
//         }).catch((err)=>{err})
//     return res.json({success:true,msg:'Order successfully!!',checkoutID}).status(200)


//     //    console.log("aa")
//         // await InCart.delete();
//         // let ORDERDONE=await InCart.find((InCart)=>InCart.id===checkoutID)
//         // return res.delete(ORDERDONE)
//         // res.status(201).json({msg:"Order done successfully!!"})
//     }
//     // if(checkoutID===inCartList){
//     //     // checkoutID = await inCartList.findOneAndDelete(checkoutID)
//     //     // inCartList=inCartList.find(checkoutID)
//     //     // res.json('order done successfully !!')
//     //     // return res.delete(inCartList)
//     //     console.log('bbbb')
//     })
//     // const id=Number(req.params.id)
//     // const user=users.find((user)=>user.id===id)
//     // return res.delete(user)
//     //res.send(checkoutID)


// // router.post('/checkout', (req, res) => {
// //     const { productId, quantity } = req.body;

// //     // Find the product in the cart
// //     const cartIndex = cartItems.findIndex(item => item.productId === productId);

// //     if (cartIndex !== -1) {
// //         // Remove the product from the cart
// //         const removedItem = cartItems.splice(cartIndex, 1)[0];

// //         // Add the product to the order list
// //         orderItems.push({
// //             productId: removedItem.productId,
// //             quantity: removedItem.quantity,
// //         });

// //         res.json({ message: 'Item moved to order list successfully' });
// //     } else {
// //         res.status(404).json({ message: 'Item not found in the cart' });
// //     }
// // });

// // router.put('/:id',async(req,res)=>{
// //     const result=await InCart.updateOne({_id : req.params.id},
// //         {$set:{qty:req.body.qty}})
// //         if(result.nModified==0){
// //             res.status(404).send("The item is not in the cart")
// //             }else{
// //                 res.send(result)
// //                  }
// // })