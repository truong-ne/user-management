import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { SubUser } from "./subUser.entity";
import { HealthStats } from "../../config/enum.constants";

@Entity({ name: 'HealthStats' })
export class HealthStat {
    constructor() {
    }

    @PrimaryColumn()
    @OneToOne(() => SubUser, subUser => subUser.id)
    @JoinColumn({ name: 'sub_user_id' })
    sub_user_id: string

    @Column({ type: 'enum', enum: HealthStats, name: 'health_stat_type' })
    health_stat_type: HealthStats

    @Column()
    value: number

    @Column()
    unit: string

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}