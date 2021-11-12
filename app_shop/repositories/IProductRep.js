const IRep = require("./IRep");
const Product = require("../models/product");
const User = require("../models/user");
const fileHelper = require("../util/file");

class IProductRep extends IRep {

}

module.exports = IProductRep;

class ProductRep extends IProductRep {
    get(skip, limit) {
        return Product.find()
        .skip(skip)
        .limit(limit);
    }

    count() {
        return Product.find().count()
    }

    findById(id){
        return Product.findById(id);
    }

    // подсчет стоимости товаров в корзине
    totalPrice(products){
        let total = 0;
        products.forEach((p) => {
          total += p.quantity * p.productId.price;
        });
        return total;
    }

    findByAdmin(userId) {
        return Product.find({ userId: userId }).populate("userId")
    }

    // вроде работает
    deleteOne(userId, prodId){
        return Product.deleteOne({ userId: userId, _id: prodId })
    }

    update_num_deletions(product){
        product.num_deletions += 1;
        return product.save()
    }

    update(product, updatedTitle, updatedPrice, updatedPrimePrice, updatedDescription, updatedImage, updatedGenre){
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.genre = updatedGenre;
        console.log("I UPDATED", updatedGenre);
        product.prime_price = updatedPrimePrice;
        product.description = updatedDescription;
        if (updatedImage) {
          fileHelper.deleteFile("public" + product.imageUrl);
          product.imageUrl = updatedImage.path.replace("public", "");
        }
        return product.save()
    }

    update_purch(product, updatedTime, updatedNum){
        product.date_purch = updatedTime.toISOString();
        product.num_purch += updatedNum;
        console.log(product.date_purch);
        return product.save()
    }

    // crit = 1 - по возрастанию; -1 - по убыванию
    // сортировка по кол-ву купленных
    sort_by_num_purch(crit){
        let json_ar = {};
        Product.find().sort({num_purch: crit}).then((sort_prod) =>{  
            sort_prod.forEach((product) => {                
                json_ar[product.genre] = product.num_purch;
                console.log(json_ar);
            })
        })
        
        return json_ar;
    }

    // crit = 1 - по возрастанию; -1 - по убыванию
    // сортировка по кол-ву возвращенных
    sort_by_num_del(crit){
        let json_ar = {};
        Product.find().sort({num_del: crit}).then((sort_prod) =>{  
            sort_prod.forEach((product) => {                
                json_ar[product.genre] = product.num_deletions;
                console.log(json_ar);
            })
        })
        
        return json_ar;
    }

    get_prod_and_num_purch(str){
        // let arr = get_title_and_num_purch(orders);
        // let str = arr[0];
        let result = {};
        let res = [];
        console.log("STR", str);
        for (let i in str){
            // console.log(i);
            Product.findOne({title: i}).then((prod) => {
                // let prod = Product.find();
                console.log(i);
                // console.log("PRODUCT", prod.title);
                if (typeof prod != "undefined") {
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
         },550);
        
    }
}

module.exports = ProductRep;