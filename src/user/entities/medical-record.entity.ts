import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { nanoid } from "nanoid";
import { User } from "./user.entity";
import { Gender, Relationship } from "../../config/enum.constants";

@Entity({ name: 'MedicalRecords' })
export class MedicalRecord {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @ManyToOne(() => User, user => user.medicalRecords, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'manager_id' })
    manager: User

    @Column({ name: 'full_name' })
    full_name: string

    @Column({ type: 'timestamp', name: 'date_of_birth', nullable: true })
    date_of_birth: Date

    @Column({ name: 'gender', type: 'enum', enum: Gender, nullable: true })
    gender: string

    @Column({ name: 'relationship', type: 'enum', enum: Relationship, nullable: true })
    relationship: string

    @Column({ nullable: true })
    avatar: string

    @Column({ nullable: true })
    address: string

    @Column({ name: 'is_main_profile', default: false })
    isMainProfile: boolean

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}