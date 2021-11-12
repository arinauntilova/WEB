const IRep = require("./IRep");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const { formList } = require("pdfkit");

class IOderRep extends IRep {

}

module.exports = IOderRep;

function firstf(orders, callback){
    let data = {};
    console.log("I ENETER");
    // console.log("ORDERS", orders);
    
    
    orders.forEach((order) => {
        // console.log("HI", title);
        let products = order.products;
        products.forEach((product) => {
            // console.log("TIT", title);
            let title = product.productData.title;
            // console.log("TITLE", title);
            if (title in data) { 
                // console.log("YES");
                data[title] += product.quantity;
            }
            else{
                // console.log("NO");
                data[title] = product.quantity;
            }
            // data.product.productData.title = product.quantity;
        })     
    })
    console.log("DATA BEFORE RETURN", data); 
    setTimeout(function(){
        console.log("HOHOHOHOH");
        callback(data);
     },3000);
}


function secondf(data){
    let result = {};
        let res = [];

        // setTimeout(function(){
        //     console.log("HOHOHOHOH");
        //  },550);
        
        for (let i in str){
            // console.log(i);
            Product.findOne({title: i}).then((prod) => {
                // let prod = Product.find();
                console.log(i);
                // console.log("PRODUCT", prod.title);
                if (i != "try" && i != "aaa") {
                    User.findById(prod.userId).then((user) => {
                        console.log("USER", user.email);
                        // result[user.email] = str[i];

                        let email = user.email;
                        // console.log("TITLE", title);
                        if (email in result) { 
                            // console.log("YES");
                            result[email] += str[i];
                        }
                        else{
                            // console.log("NO");
                            result[email] = str[i];
                        }
                    })
                }
                
            })
            
        }
        setTimeout(function(){
            console.log("HAHAHAHAHA");
            console.log("STR_RES", result);
            res[0] = result;
            console.log("STR_RES", res);
            return res;
         },1550);

}

class OderRep extends IOderRep {
    findById(id){
        return Order.findById(id);
    }

    findByUserId(userid){
        return Order.find({ "user.userId": userid })
    }

    // подсчет среднего чека переданных заказов
    totalPrice(orders){
        let total_sum = 0;
        orders.forEach((order) => {
          let products = order.products;
          products.forEach((product)=> {
            total_sum += product.quantity * product.productData.price;
          })
        });
        return total_sum;
    }

    // подсчет количества заказов
   count_num() {
        return Order.count()
    }

    // получение заказов, оформленных в указанный год и месяц
    get_by_year_month (year, month, skip, limit) {
        var start = new Date(year, month, 0);
        var end = new Date(year, month + 1, 0);
        return Order.find({"date_purch": {$gte: start, $lt: end}});
    }

    // получение заказов, оформленных в указанный год
    get_by_year(year, skip, limit) {
        var start = new Date(year - 1, 11, 0);
        var end = new Date(year, 11, 0);
        return Order.find({"date_purch": {$gte: start, $lt: end}});
    }

    get_num_by_year_month (year, month, skip, limit) {
        var start = new Date(year, month, 0);
        var end = new Date(year, month + 1, 0);
        return Order.count({"date_purch": {$gte: start, $lt: end}});
    }

    // суммарная оптовая стоимость заказов
    trade_price(orders){
        let total = 0;
        orders.forEach((order) => {
            let products = order.products;
            products.forEach((product) => {
                total += product.productData.prime_price * product.quantity;
            })          
        })
        return total;
    }

    
    get_title_and_num_purch(orders){
        let data = {};
        console.log("I ENETER");
        // console.log("ORDERS", orders);
        orders.forEach((order) => {
            // console.log("HI", title);
            let products = order.products;
            products.forEach((product) => {
                // console.log("TIT", title);
                let title = product.productData.title;
                // console.log("TITLE", title);
                if (title in data) { 
                    // console.log("YES");
                    data[title] += product.quantity;
                }
                else{
                    // console.log("NO");
                    data[title] = product.quantity;
                }
                // data.product.productData.title = product.quantity;
            })     
        })
        console.log("DATA BEFORE RETURN", data);  
        let arr = [];
        arr[0] = data;
        // console.log("ARR", arr); 
        return arr;           
    }


    get_prod_and_num_purch(orders){
        // let data = {};
        // console.log("I ENETER");
        // // console.log("ORDERS", orders);
        // firstf(orders, secondf);
        
        // orders.forEach((order) => {
        //     // console.log("HI", title);
        //     let products = order.products;
        //     products.forEach((product) => {
        //         // console.log("TIT", title);
        //         let title = product.productData.title;
        //         // console.log("TITLE", title);
        //         if (title in data) { 
        //             // console.log("YES");
        //             data[title] += product.quantity;
        //         }
        //         else{
        //             // console.log("NO");
        //             data[title] = product.quantity;
        //         }
        //         // data.product.productData.title = product.quantity;
        //     })     
        // })
        // console.log("DATA BEFORE RETURN", data);  
        // let arr = [];
        // arr[0] = data;

        // let str = data;
        // let result = {};
        // let res = [];

        // // setTimeout(function(){
        // //     console.log("HOHOHOHOH");
        // //  },550);
        
        // for (let i in str){
        //     // console.log(i);
        //     Product.findOne({title: i}).then((prod) => {
        //         // let prod = Product.find();
        //         console.log(i);
        //         // console.log("PRODUCT", prod.title);
        //         if (i != "try" && i != "aaa") {
        //             User.findById(prod.userId).then((user) => {
        //                 console.log("USER", user.email);
        //                 // result[user.email] = str[i];

        //                 let email = user.email;
        //                 // console.log("TITLE", title);
        //                 if (email in result) { 
        //                     // console.log("YES");
        //                     result[email] += str[i];
        //                 }
        //                 else{
        //                     // console.log("NO");
        //                     result[email] = str[i];
        //                 }
        //             })
        //         }
                
        //     })
            
        // }
        // setTimeout(function(){
        //     console.log("HAHAHAHAHA");
        //     console.log("STR_RES", result);
        //     res[0] = result;
        //     console.log("STR_RES", res);
        //     return res;
        //  },1550);

        // return arr;           
    }

    

}

module.exports = OderRep;