import { UserController } from './modules/user/user.controller';
import { UserService } from './modules/user/user.service';
import { TranslateController } from './modules/translate/translate.controller';
import express from 'express';
import { createConnection } from 'typeorm';
import bodyparser from 'body-parser';
const app = express();

var user_service = new UserService();

const controllers = [
    new UserController(user_service),
    new TranslateController(user_service)
]

app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

app.use(bodyparser.json()); 

app.use(bodyparser.urlencoded({ extended: true })); 

controllers.forEach((controller) => {
    app.use(controller.path, controller.router);
});

createConnection();

app.listen(3000, "0.0.0.0" , () => console.log("Server started"));