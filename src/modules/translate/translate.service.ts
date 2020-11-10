import { User } from './../user/models/user.entity';
import { UserService } from './../user/user.service';
import { Request } from './models/request.entity';
import { Translation } from './models/translation.entity';
import { getRepository, Like } from 'typeorm';
import { cwd, stdout } from 'process';
import { Console } from 'console';
import { request } from 'express';
export class TranslateService {
    private user_service: UserService;

    constructor(user_service: UserService) {
        this.user_service = user_service;
    }

    public async getTranslations(limit, offset, query): Promise<any> {
        if (limit == undefined || offset == undefined)
            return { error: "Invalid args" };
        query = (query)?query:"";
        let translations = await getRepository(Translation).find({
            skip: offset,
            take: limit,
            where: {
                final: false,
                text_id: Like(`%${query}%`)
            }
        });
        for (let t of translations){
            t.current_user = (await this.user_service.getUserFromID(t.current_user_id)).username;
            t.free = await this.isTranslationFree(t.id);
        }
        return translations;
    }

    public async getTranslationRequests(limit, offset): Promise<any> {
        if (limit == undefined || offset == undefined)
            return { error: "Invalid args" };
        let requests = await getRepository(Request).find({
            skip: offset,
            take: limit
        })
        for (let r of requests) {
            await r.translation;
            r.user = (await this.user_service.getUserFromID(r.user_id)).username
        }
        return requests;
        // console.log(request)
    }

    public async finaliseTranslation(token, translation_id) {
        if (!translation_id || !token)
            return { error: "Invalid args" }
        let user = await this.user_service.getUserFromToken(token);
        if (!user.moderator)
            return { error: "User is not a moderator" };
        let res = await getRepository(Translation).update({id: translation_id}, {final: true});
        if (res.affected == 0)
            return {error: "Translation not found"}
        console.log(user);
        await getRepository(User).update({id: user.id}, {approved_counter: user.approved_counter + 1})
        return {message: "Translation finalised"}
    }

    public async requestTranslation(token, translationID, newContent): Promise<any> {
        if (token == undefined || translationID == undefined || newContent == undefined)
            return { error: "Invalid args" }
        let user = await this.user_service.getUserFromToken(token);
        if (!user)
            return {error: "User not logged in"};
        try {
            let translation = await getRepository(Translation).findOne({id: translationID});
            if(!translation)
                return {error: "Cannot find translation"}
            if(translation.final)
                return {error: "Translation cannot be changed anymore"}
            if(!await this.isTranslationFree(translation.id)){
                return {error: "Translation undergoing review"}
            }
            await getRepository(Request).insert({
                translation_id: translationID,
                new_content: newContent,
                user_id: user.id
            });
        }
        catch (err) {
            console.log(err);
            return { error: "An error occured when making the request" }
        }

        return { message: "Request made" }
    }


    public async approveRequest(token, requestID): Promise<any> {
        if (token === undefined || requestID === undefined)
            return { error: "Invalid args" }
        let user = await this.user_service.getUserFromToken(token)
        if (user.error)
            return user
        if (!user.moderator)
            return { error: "Invalid priviledges" }
        let request = await getRepository(Request).findOne({ id: requestID })
        if (!request)
            return { error: "Request not found" }
        await getRepository(Translation).update({ id: request.translation_id }, { current: request.new_content, current_user_id: request.user_id });
        await getRepository(Request).delete({ id: requestID });
    }

    public async getFinalCount(): Promise<any> {
        let finalCount = await getRepository(Translation).count({ final: true })
        return { finalCount: finalCount };
    }

    public async denyRequest(token, requestID): Promise<any> {
        if (token === undefined || requestID === undefined)
            return { error: "Invalid args" }
        let user = await this.user_service.getUserFromToken(token)
        if (user.error)
            return user
        if (!user.moderator)
            return { error: "Invalid priviledges" }
        let res = await getRepository(Request).delete({ id: requestID });
        if (res.affected == 0)
            return { error: "Request not found" }
        return { message: "Request deleted" }
    }

    private async isTranslationFree(translation_id): Promise<boolean>{
        let request = await getRepository(Request).findOne({translation_id: translation_id});
        if(!request)
            return true;
        return false;
    }
}