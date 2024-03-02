const mongoose = require('mongoose');

const inCartSchema = mongoose.Schema({
    productItem:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required: true
        },
        qty: {
            type :Number , 
            default:1} 
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
})

inCartSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

inCartSchema.set('toJSON', {
    virtuals: true,
});


// Increment quantity method
// inCartSchema.methods.incrementQuantity = function (productId, incrementBy = 1) {
//     const productItem = this.productItem.find(item => item.product.equals(productId));
//     if (productItem) {
//         productItem.qty += incrementBy;
//     } else {
//         // Product not found, you might want to handle this case
//     }
// };

// // Decrement quantity method
// inCartSchema.methods.decrementQuantity = function (productId, decrementBy = 1) {
//     const productItem = this.productItem.find(item => item.product.equals(productId));
//     if (productItem) {
//         productItem.qty = Math.max(1, productItem.qty - decrementBy);
//     } else {
//         // Product not found, you might want to handle this case
//     }
// };

exports.InCart = mongoose.model('InCart', inCartSchema);
