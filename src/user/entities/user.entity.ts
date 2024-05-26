import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { nanoid } from "nanoid";
import { MedicalRecord } from "./medical-record.entity";
import { Transaction } from "../../transaction/entities/transaction.entity";

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

    @Column({ name: 'account_balance', default: 0 })
    account_balance: number

    @Column({ name: 'point', default: 0 })
    point: number

    @Column("text", { name: "wish_list", array: true, default: [] })
    wish_list: string[]

    @Column({ name: 'email_notification', default: false })
    email_notification: boolean

    @Column({ default: true })
    isActive: boolean

    @Column({ default: false })
    isGoogle: boolean

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date

    @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.manager, { onDelete: 'CASCADE' })
    medicalRecords: MedicalRecord[]

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions: Transaction[]
}