import { UserService } from './user.service';
import express from 'express';
export class UserController{
    private userService: UserService;
    public path = "/user";
    public router = express.Router();
    constructor(userService: UserService){
        this.userService = userService;
        this.initialiseRoutes();
    }

    private initialiseRoutes() {
        this.router.get('/getuser', async (req, res) => {
            console.log(req.query);
            return res.send(await this.userService.getUserFromToken(req.query.token));
        });
        this.router.post('/login', async (req, res) => {
            console.log(req.body);
            return res.send(await this.userService.login(req.body.username, req.body.password));
        });
        this.router.post('/register', async (req, res) => {
            console.log(req.body);
            return res.send(await this.userService.register(req.body.username, req.body.password));
        });
        this.router.post('/logout', async (req, res) => {
            console.log(req.body);
            return res.send(await this.userService.logout(req.body.access_token))
        });
    }
}