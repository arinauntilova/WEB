// Mongoose представляет специальную ODM-библиотеку (Object Data Modelling) 
// Mongoose позволяет вам определять объекты со строго-типизированной схемой, 
// соответствующей документу MongoDB.

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// установка схемы
// Схема содержит метаданные объектов. В частности, здесь устанавливаем, какие свойства 
// будет иметь объект и какой у них будет тип данных.
const orderSchema = new Schema({
  products: [
    {
      productData: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  date_purch: {
    type: Date,
    required: false,
  },
});

// Модели создаются из схем с использованием mongoose.model()
// Первый аргумент - это единственное имя коллекции, которая будет создана для вашей модели
// второй аргумент - это схема, которую вы хотите использовать при создании модели.
module.exports = mongoose.model("Order", orderSchema);
