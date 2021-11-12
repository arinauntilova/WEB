const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  name:{
     firstname: {
      type: String,
      required: true,
     },
     lastname: {
      type: String,
      required: true,
     }
  },

  date_birth: {
    type: Date,
    required: false,
  },
  
  country:{       // address
    type: Schema.Types.Mixed,
    required: false,
  },

  cart: {
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  
  resetToken: String,
  resetTokenExpiration: Date,
});


userSchema.methods.addToCart = function (product) {
  // findIndex() возвращает индекс в массиве, если элемент удовлетворяет условию проверяющей функции. 
  const cartProductIndex = this.cart.items.findIndex(
    // Оператор == сравнивает на равенство, а вот === — на идентичность
    (cp) => cp.productId.toString() === product._id.toString()
  );
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity += this.cart.items[cartProductIndex].quantity;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: newQuantity });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== prodId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  this.save();
};

module.exports = mongoose.model("User", userSchema);
