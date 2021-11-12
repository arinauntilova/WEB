const IRep = require("./IRep");
const User = require("../models/user");

class IUserRep extends IRep {
    get_user_products(user) { }
    add_to_cart(user, product){ }
    remove_from_cart(user, product){ }
}

module.exports = IUserRep;

class UserRep extends IUserRep {
    findById(id){
        return User.findById(id);
    }

    get_user_products(user){
        return user.populate("cart.items.productId").execPopulate()
    }

    add_to_cart(user, product){
        user.addToCart(product)
    }

    remove_from_cart(user, prodId){
        user.removeFromCart(prodId)
    }

    clear_cart(user){
        user.clearCart()
    }

    findByEmail(email){
        return User.findOne({ email: email })
    }
}

module.exports = UserRep;