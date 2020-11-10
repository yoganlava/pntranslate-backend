import { User } from './../../user/models/user.entity';
import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, Timestamp, OneToOne, JoinColumn } from 'typeorm';
@Entity({name: 'translations'})
export class Translation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    text_id: string;

    @Column()
    source: string;

    @Column()
    current: string;

    @Column()
    current_user_id: number;

    free: boolean;

    current_user: string;

    @Column()
    final: boolean;

    @Column()
    updated_at: Date
}