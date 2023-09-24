import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { nanoid } from "nanoid";
import { SubUser } from "./subUser.entity";

@Entity({ name: 'Users' })
export class User {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @Column()
    phone: string

    @Column({ nullable: true })
    email: string

    @Column()
    password: string

    @Column()
    full_name: string

    @Column({ nullable: true })
    address: string

    @Column({ nullable: true })
    avatar: string
    
    @Column({ name: 'email_notification', default: false })
    email_notification: boolean

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @OneToMany(() => SubUser, subUser => subUser.manager, { onDelete: 'CASCADE' })
    sub_users: SubUser[]
}