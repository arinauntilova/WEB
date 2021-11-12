const fs = require("fs");
const path = require("path");
const stripe = require("stripe")("test");
const PdfInvoiceService = require("../services/PdfInvoiceService");
const productRep = require("../repositories/IProductRep")
const userRep = require("../repositories/IUserRep")
const orderRep = require("../repositories/IOrderRep")
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

const ITEMS_PER_PAGE = 4;

function createProductRep() {
  return new productRep();
}

function createUserRep() {
  return new userRep();
}

function createOrderRep() {
  return new orderRep();
}

// YES                                    
exports.getIndex = (req, res, next) => {
  let message = req.flash("error");
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  let productRepos = createProductRep();

  const page = +req.query.page || 1;
  let totalProducts = 0;
                                
  productRepos
    .count()  
    .then((numProducts) => {
      totalProducts = numProducts;
      return productRepos.get((page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE)   //
    })
    .then((products) => {
      // console.log(products[0].date_purch);
      // const date = new Date(products[0].date_purch);
      // console.log(date.getMonth() + 1);
      if(req.headers.type === 'json'){
        res.status(200).send( {
          success: "true",
          products
        });
      }
      else{
        res.render("shop/index", {
          prods: products,
          pageTitle: "Shop",
          path: "/",
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
          errorMessage: message,
          
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// YES
exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;

  let productRepos = createProductRep();

  productRepos
    .count()   //
    .then((numProducts) => {
      totalProducts = numProducts;
      return productRepos.get((page - 1) * ITEMS_PER_PAGE, ITEMS_PER_PAGE);
    })
    .then((products) => {
      if(req.headers.type === 'json'){
        res.status(200).send( {
          success: "true",
          products
        });
      }
      else{
        res.render("shop/product-list", {
          prods: products,
          pageTitle: "All Products",
          path: "/products",
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// YES
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  let productRepos = createProductRep();

  productRepos.findById(prodId)
    .then((product) => {
      if(req.headers.type === 'json'){
        res.status(200).send( {
          success: "true",
          product
        });
      }
      else{
      res.render("shop/product-detail", {
        pageTitle: "Product detail",
        product: product,
        path: "/products",
      });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// 
exports.getCart = (req, res, next) => {
  const userId = req.session.user._id;
  let user_rep = createUserRep();
  user_rep.findById(userId).then((user) => {
    user_rep.get_user_products(user)
      .then((user_tmp) => {
        let products = user_tmp.cart.items;
        if(req.headers.type === 'json'){
          res.status(200).send( {
            success: "true",
            products
          });
        }
        else{
          res.render("shop/cart", {
            pageTitle: "Your Cart",
            path: "/cart",
            products: products,
          });
        }
      })    
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }); 
};

// // YES
// exports.postCart = (req, res, next) => {

//   const userId = req.session.user._id;
//   const prodId = req.body.productId;
  
//   let user_rep = createUserRep();

//   user_rep.findById(userId)
//   .then((user) => {
//     let productRepos = createProductRep();
//     productRepos.findById(prodId)
//       .then((product) => user_rep.add_to_cart(user, product))
//       .then(() => res.redirect("/cart"))
//       .catch((err) => {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//       });
//   });
// };


// YES
exports.postCart = (req, res, next) => {

  const userId = req.session.user._id;
  const prodId = req.body.productId;
  
  let user_rep = createUserRep();

  user_rep.findById(userId)
  .then((user) => {
    let productRepos = createProductRep();
    productRepos.findById(prodId)
      .then((product) => {
        if(req.headers.type === 'json'){
          res.status(200).send( {
            success: "true",
            product
          });
        }
        user_rep.add_to_cart(user, product)
      })
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};


exports.postCartDeleteProduct = (req, res, next) => {
   const prodId = req.body.productId;

   const prodRepos = createProductRep();

   prodRepos.findById(prodId).then((product) => {
    prodRepos.update_num_deletions(product);
   })
  
  const userId = req.session.user._id;
  let user_rep = createUserRep();
  
  user_rep.findById(userId)
  .then((user) => {
    if(req.headers.type === 'json'){
      prodRepos.findById(prodId).then((product) => {
        if (product){
          res.status(200).send( {
            success: "true",
            product
          });
        }
        else{
          res.status(404).send( {
            success: "false"
          });
        }

       })
    }
    else{
      user
      .removeFromCart(prodId)
      // user_rep.remove_from_cart(user, prodId)
      .then(() => res.redirect("/cart"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
    }
  });
};

exports.postOrder = (req, res, next) => {

  const userId = req.session.user._id;
  let user_rep = createUserRep();

  user_rep.findById(userId).then((user) => {
      user_rep.get_user_products(user)
      .then((user) => {
          const products = user.cart.items.map((i) => {
            
            let productRepos = createProductRep();

            productRepos.findById(i.productId)
              .then((product) => {
                var currentTime = new Date(Date.now());
                //var month = currentTime.getMonth() + 1;                
                //var year = currentTime.getFullYear();
                productRepos.update_purch(product, currentTime, i.quantity);
                });
            // Поле _doc позволяет получить прямой доступ к документу
          return { quantity: i.quantity, productData: { ...i.productId._doc } };
        });
        var currentTime = new Date(Date.now());
        const order = new Order({
          user: {
            email: user.email,
            userId: user,
          },
          products: products,
          date_purch: currentTime.toISOString(),
        });
        return order.save();
      })
      .then(() => user_rep.clear_cart(user))
      .then(() => res.redirect("/orders"))
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        console.log("ERR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  ", err);
        return next(error);
      });
  });
};


// YES
exports.getOrders = (req, res, next) => {
  const userId = req.session.user._id;
  let order_rep = createOrderRep();

  order_rep.findByUserId(userId)
    .then((orders) =>{
      if(req.headers.type === 'json'){
        res.status(200).send( {
          success: "true",
          orders
        });
      }
      else {
        res.render("shop/orders", {
          pageTitle: "Your Orders",
          path: "/orders",
          orders: orders,
        })
      }
    }
      
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};



// YES 
exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  let order_rep = createOrderRep();
  order_rep.findById(orderId)
    .then((order) => {
      if(req.headers.type === 'json'){
        res.status(200).send( {
          success: "true",
          order
        });
      }
      else {
        if (!order) {
          return next(new Error("No order found"));
        }
        if (order.user.userId.toString() !== req.session.user._id.toString()) {
          return next(new Error("Unautrhorized"));
        }

        const docService = new PdfInvoiceService();
        const file = docService.createInvoice(order);
        file.pipe(res);
      }
    })
    .catch((err) => next(err));
};
