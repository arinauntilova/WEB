const path = require("path");
const fs = require("fs");

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const cors = require('cors'); 

var swaggerJsDoc = require('swagger-jsdoc');

const swaggerUi = require("swagger-ui-express"), 
 swaggerDocument = require("./swagger.json");

const errorController = require("./controllers/error");

// создаем объект приложения
const app = express();


// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Customer API",
      description: "Customer API Information",
      contact: {
        name: "Amazing Developer"
      },
      servers: ["http://localhost:5000"]
    }
  },
  apis: ['./routes/*.js']
  // apis: ["app.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());

// ============= ДАЛЬШЕ
const store = new MongodbStore({
  // адрес сервера и номер порта
  uri: "mongodb://127.0.0.1:27017/shop_art",
  collection: "sessions",
});
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const mimeWhitelist = ["image/png", "image/jpg", "image/jpeg"];

const fileFilter = (req, file, cb) => {
  if (mimeWhitelist.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// используемый шаблонизатор
// не нужно загружать модуль шаблонизатора в приложение; Express загружает модуль внутренними средствами
app.set("view engine", "pug");
// каталог, в котором находятся файлы шаблонов
app.set("views", "views");

// при обращении к localhost:5000 будет вызывать экспортируемую функцию из ‘./routes/admin’.
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

// app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
// Для работы со статическими файлами в Express определен 
// специальный компонент express.static(), который указывает на каталог с файлами.
// __dirname позволяет получить полный путь к папке.
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: "mysecretflexing", resave: false, saveUninitialized: false, store: store })
);

app.use(csrfProtection);

app.use(flash());

// объект запроса; объект ответа; следующая функция обработки.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isSignedIn;
  if (req.session.isSignedIn){
    res.locals.isAdmin = req.session.user.role == 'admin';
    res.locals.isAnalyst = req.session.user.role == 'analyst';
  }
  else{
    res.locals.isAdmin = false;
    res.locals.isAnalyst = false;
  }
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);


// =====
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});



// методы get(), post() также являются функциями промежуточной обработки, которые не передают вызов дальше
// Метод get() принимает аргументами URL, к которому необходимо выполнить запрос, и callback-функцию.
// определяем обработчик для маршрута "/500"
// обрабатывает GET-запросы протокола HTTP и позволяет связать маршруты с определенными обработчиками. 
// первым параметром передается маршрут, а вторым - обработчик, который будет вызываться,

/**
 * @swagger
 * /customers:
 *    get:
 *      description: Use to return all customers
 *    parameters:
 *      - name: customer
 *        in: query
 *        description: Name of our customer
 *        required: false
 *        schema:
 *          type: string
 *          format: string
 *    responses:
 *      '201':
 *        description: Successfully created user
 */
app.get("/500", errorController.get500);

app.use(errorController.get404);



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use('/apo-docs')




app.use((error, req, res, next) => {
  console.log(error);
  // Для переадресации применяется метод redirect():
  res.redirect("/500");
});

// Для подключения к базе данных применяется метод mongoose.connect(), в который передается адрес базы данных на сервере mongo:
// С помощью метода then мы можем получить данные, которые возвратил нам сервер и выполнить обработку результата.
mongoose.connect("mongodb://127.0.0.1:27017/shop_art").then(() => {
  //PORT — берется из переменной окружения, а если ее нет, то ставится 5000
  // начинаем прослушивать подключения на 5000 порту
  app.listen(process.env.PORT || 5000);
})

