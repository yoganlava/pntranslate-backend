import { User } from './models/user.entity';
import { getRepository } from 'typeorm';
import crypto from 'crypto';
require('dotenv').config()
export class UserService {
    // private current_logged_in_users = {};

    public async register(username: string, password: string){
        try {
            if(username.length < 4 || username.length > 16)
                return {error: "Invalid username length"}
            if(password.length < 4)
                return {error: "Invalid password length"}
            await getRepository(User).insert({
                username: username,
                password: crypto.scryptSync(password, process.env.HASH_SECRET, 64).toString('hex')
            });
            return this.login(username, password);
        }catch (err) {
            console.log(err);
            return {error: "Try another username"};
        }
    }

    public async login(username: string, password: string){
        if(username === undefined || password === undefined)
            return { error: "Invalid args" }

        let user = await getRepository(User).findOne({username: username});
        if(!user)
            return {error: "Cannot find user"};
        if(user.password === crypto.scryptSync(password, process.env.HASH_SECRET, 64).toString('hex')){
            let token = this.generateAuthToken();
            await getRepository(User).update({id: user.id}, {token: token});
            return {token: token}
        }
        return {error: "Wrong password"};
    }

    private generateAuthToken(): string {
        return crypto.randomBytes(30).toString('hex');
    }

    public async getUserFromToken(token): Promise<any> {
        let user = await getRepository(User).findOne({token: token});
        if (token === undefined || user === undefined)
            return {error: "Invalid token"}
        return user;
    }

    public async getUserFromID(id): Promise<any> {
        if(!id)
            return {error: "Invalid args"}
        let user = await getRepository(User).findOne({id: id});
        if(!user)
            return {error: "Cannot find user"};
        return {
            username: user.username,
            approved_counter: user.approved_counter,
            moderator: user.moderator
        };
    }

    public async isUserModerator(userID): Promise<boolean>{
        if(!userID)
            return false
        let user = await this.getUserFromID(userID);
        if(!user)
            return false
        return user.moderator;
    }

    public async logout(token): Promise<any> {
        if(!token)
            return {error: "Invalid args"}
        let user = await this.getUserFromToken(token);
        if(!user)
            return {error: "User not logged in"}
        await getRepository(User).update({id: user.id}, {token: null});
        return {message: "User logged out"}
    }
}