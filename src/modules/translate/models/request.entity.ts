import { Translation } from './translation.entity';
import { BaseEntity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Entity } from "typeorm";
@Entity({name: "request"})
export class Request extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    translation_id: number;

    @OneToOne(type => Translation, translation => translation.id)
    @JoinColumn({name: "translation_id"})
    translation: Promise<Translation>;

    @Column()
    user_id: number;

    user: string;

    @Column()
    new_content: string;
}