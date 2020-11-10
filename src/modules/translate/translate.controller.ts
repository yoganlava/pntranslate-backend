import { off } from 'process';
import { TranslateService } from './translate.service';
import express from 'express';
import { UserService } from '../user/user.service';

export class TranslateController {
    public path = "/translate";
    public router = express.Router();
    private translate_service: TranslateService;

    constructor(user_service: UserService) {
        this.initialiseRoutes();
        this.translate_service = new TranslateService(user_service);
    }

    private initialiseRoutes() {
        this.router.get('/getallrequests', async (req, res) => {
            console.log(req.query);
            return res.send(await this.translate_service.getTranslationRequests(req.query.limit, req.query.offset));
        });
        
        this.router.get('/getall', async (req, res) => {
            console.log(req.query);
            return res.send(await this.translate_service.getTranslations(req.query.limit, req.query.offset, req.query.query));
        });

        this.router.post('/request', async (req, res) => {
            console.log(req.body);
            return res.send(await this.translate_service.requestTranslation(req.body.token, req.body.translation_id, req.body.new_content));
        });

        this.router.post('/approverequest', async (req, res) => {
            console.log(req.body);
            return res.send(await this.translate_service.approveRequest(req.body.token, req.body.requestID));
        });

        this.router.post('/denyrequest', async (req, res) => {
            console.log(req.body);
            return res.send(await this.translate_service.denyRequest(req.body.token, req.body.requestID));
        });

        this.router.get('/getprogress', async (req, res) => {
            return res.send(await this.translate_service.getFinalCount());
        })

        this.router.post('/finalise', async (req, res) => {
            return res.send(await this.translate_service.finaliseTranslation(req.body.access_token, req.body.translation_id))
        })
    }
}