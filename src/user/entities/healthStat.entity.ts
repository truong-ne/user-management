import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'HealthStats' })
export class HealthStat {
    constructor() {
    }

    @PrimaryColumn()
    @OneToOne(() => User, user => user.id)
    @JoinColumn({ name: 'user_id' })
    user_id: string

    @Column({ name: 'health_stat_type' })
    health_stat_type: string

    @Column({ name: 'value' })
    value: number

    @Column({ name: 'unit' })
    unit: string

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}