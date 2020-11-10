import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from 'typeorm';
@Entity({name: 'user'})
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    approved_counter: number;

    @Column()
    token: string;

    @Column()
    moderator: boolean;
}