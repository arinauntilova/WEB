const fileHelper = require("../util/file");

const { validationResult } = require("express-validator/check");

const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

const productRep = require("../repositories/IProductRep")
const userRep = require("../repositories/IUserRep")
const orderRep = require("../repositories/IOrderRep")

function createProductRep() {
  return new productRep();
}

function createUserRep() {
  return new userRep();
}

function createOrderRep() {
  return new orderRep();
}

exports.getProducts = (req, res, next) => {
  const userId = req.session.user._id;
  let user_rep = createUserRep();
  user_rep.findById(userId).then((user) => {
    let productRepos = createProductRep();
    productRepos.findByAdmin(userId)                  // !!!!
      .then((products) => {
        res.render("admin/products", {
          prods: products,
          pageTitle: "Admin Products",
          path: "/admin/products",
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const genre = req.body.genre;
  // console.log("GENRE ADD", genre);
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const prime_price = req.body.prime_price;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        genre: genre,
        prime_price: prime_price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        genre: genre,
        price: price,
        prime_price: prime_price,
        description: description,
      },
      errorMessage: "Some error occured.",
      validationErrors: [],
    });
  }

  const imageUrl = image.path.replace("public", "");
  var currentTime = new Date(Date.now());

  const product = new Product({
    title: title,
    genre: genre,
    price: price,
    prime_price: prime_price,
    num_purch: 0,
    num_deletions: 0,
    date_add: currentTime.toISOString(),
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user,
  });


  if(req.headers.type === 'json'){
    res.status(200).send( {
      success: "true",
      product
    });
  }
  else{
    product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  }

};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
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
        if (!product) {
          return res.redirect("/");
        }
        res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: editMode,
          product: product,
          hasError: false,
          errorMessage: null,
          validationErrors: [],
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedGenre = req.body.genre;
  const updatedPrice = req.body.price;
  const updatedPrimePrice = req.body.prime_price;
  const updatedDescription = req.body.description;

  console.log("GENRE EDIT", updatedGenre);
  console.log("DESCR EDIT", updatedDescription);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        genre: updatedGenre,
        price: updatedPrice,
        prime_price: updatedPrimePrice,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // update 
  let productRepos = createProductRep();
  productRepos.findById(prodId)
    .then((product) => {
      const userId = req.session.user._id;
      let user_rep = createUserRep();
      user_rep.findById(userId).then((user) => {
      // User.findById(req.session.user._id).then((user) => {
        if (product.userId.toString() !== user._id.toString()) {
          req.flash("error", "You are not allowed to edit this product");
          return res.redirect("/");
        }
        productRepos.update(product, updatedTitle, updatedPrice, updatedPrimePrice, updatedDescription, updatedImage, updatedGenre)
        return res.redirect("/admin/products")
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  const userId = req.session.user._id; 
  let user_rep = createUserRep();
  user_rep.findById(userId).then((user) => {
    let productRepos = createProductRep();
    productRepos.findById(prodId)
      .then((product) => {
        // if(req.headers.type === 'json'){
        //   res.status(200).send( {
        //     success: "true",
        //     product
        //   });   

        // }
        // else{
        if (!product) {
          return next(new Error("Product not found"));
        }
        fileHelper.deleteFile("public" + product.imageUrl);
        // const res = productRepos.deleteOne(userId, prodId);
        // if(req.headers.type === 'json'){
        //   res.status(200).send( {
        //     success: "true",
        //     product
        //   });   
        // }
        return productRepos.deleteOne(userId, prodId);
      //  }
      
      })
      .then(() => res.status(200).json({ message: "Success!" }))
      .catch(() => res.status(500).json({ message: "Deleting product failed!" }));
  });
};


// ===== АНАЛИТИКА ========

exports.getAnalytics = (req, res, next) => {
  res.render("admin/analytics", {
    pageTitle: "Analytics",
    path: "/admin/analytics",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAnalytics = (req, res, next) => {
  const type = req.body.btnId;
  return res.redirect("/admin/analytics/graph");
};

// гистограмма среднего чека
exports.getGraph_avg_bill = function (req, res, next){
  console.log(req.query);
  const year = req.query.year;
  console.log("CHECK ", year);
  let data = new Array(12);
  let orderRepos = createOrderRep();
  
  for (let i = 0; i < 12; i += 1){
    orderRepos.get_by_year_month(year, i).then((orders) => {   // заказы указанного года и месяца
      let price = orderRepos.totalPrice(orders);           // нахождение общей стоимости заказов, внутри - цикл
      orderRepos.get_num_by_year_month(year, i).then((cnt) => {    
      let avg_price = price / cnt;  
      data[i] = avg_price; 
    });
  })
  }
 
  setTimeout(function(){
     console.log("DATA !", data);
     res.end(JSON.stringify(data));
  },250);
};

// гистограмма прибыли
exports.getGraph_benefit = (req, res, next) => {
  console.log(req.query);
  const year = req.query.year;
  let data = new Array(12);
  let orderRepos = createOrderRep();
  
  for (let i = 0; i < 12; i += 1){
    orderRepos.get_by_year_month(year, i).then((orders) => {   // заказы указанного года и месяца
    let price = orderRepos.totalPrice(orders);           // нахождение общей стоимости заказов, внутри - цикл
    let trade_price = orderRepos.trade_price(orders);    // нахождение общей стоимости оптовой цены заказа, внутри цикл
    data[i] = price - trade_price;
    })
  }
 
  setTimeout(function(){
    console.log("DATA !!", data);
    res.end(JSON.stringify(data));
}, 250);

};

// бубликовая диаграмма популярных жанров
exports.getGraph_popgenres = (req, res, next) => {
  console.log(req.query);
  let prodRepos = createProductRep();
  let data;
  data = prodRepos.sort_by_num_purch(-1);
 
  setTimeout(function(){
    console.log("DATA !!!", data);
    console.log("DATA !!!", Object.keys(data)[0]);
    res.end(JSON.stringify(data));
}, 250);
};

// бубликовая диаграмма удаляемых жанров
exports.getGraph_nonpopgenres = (req, res, next) => {
  console.log(req.query);
  let prodRepos = createProductRep();
  let data;
  data = prodRepos.sort_by_num_del(-1);
 
  setTimeout(function(){
    console.log("DATA(del) !!!", data);
    res.end(JSON.stringify(data));
}, 250);
};


// круговая диаграмма названий товаров
exports.getGraph_titles = function (req, res, next){
  console.log(req.query);
  const year = req.query.year;
  console.log("CHECK ", year);
  // console.log("I'm HERE!")
  let data = new Array(12);
  let orderRepos = createOrderRep();
  
  orderRepos.get_by_year(year).then((orders) => {   // заказы указанного года и месяца
    data = orderRepos.get_title_and_num_purch(orders);  // json-строка, хранит "имя_товара": кол-во покупок  (для переданных заказов)
    // data[i] = avg_price; 
    // console.log("PROD_NUM", data);
  });

  setTimeout(function(){
     console.log("DATA TITLES!", data);
     res.end(JSON.stringify(data[0]));
  },450);
};

// круговая диаграмма поставщиков
exports.getGraph_providers = function (req, res, next){
  console.log(req.query);
  const year = req.query.year;
  console.log("CHECK ", year);
  console.log("I'   m HERE!")
  let data = new Array(12);
  let orderRepos = createOrderRep();
  // let result;
  
  orderRepos.get_by_year(year).then((orders) => {   // заказы указанного года и месяца
    // data = orderRepos.get_title_and_num_purch(orders);  // json-строка, хранит "имя_товара": кол-во покупок  (для переданных заказов)
    // let prodRepos = createProductRep();
    // result = prodRepos.get_prod_and_num_purch(data[0]);
    data = orderRepos.get_prod_and_num_purch(orders);
    setTimeout(function(){
      console.log("HEEEEEEEEELP!", data);
     //  res.end(JSON.stringify(data[0]));
   },1950);
    console.log("DATAA", data);
  });

  // orderRepos.get_by_year(year).then((orders) => {   // заказы указанного года и месяца
  //   orderRepos.get_prod_and_num_purch(orders).then((result) => {
  //     console.log("================================= HELLO!", result);
  //   })  // json-строка, хранит "имя_товара": кол-во покупок  (для переданных заказов)
  //   // let prodRepos = createProductRep();
    
  //   // result = prodRepos.get_prod_and_num_purch(data[0]);
  // });


  setTimeout(function(){
     console.log("DATA PROVIDERS!", data);
    //  res.end(JSON.stringify(data[0]));
  },5950);
};


