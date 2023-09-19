import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { nanoid } from "nanoid";
import { User } from "./user.entity";
import { HealthStat } from "./healthStat.entity";

@Entity({ name: 'SubUsers' })
export class SubUser {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @ManyToOne(() => User, user => user.sub_users, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'manager_id' })
    manager: User

    @Column({ name: 'full_name' })
    full_name: string

    @Column({ type: 'timestamp', name: 'date_of_birth' })
    date_of_birth: Date

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}