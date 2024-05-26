import { nanoid } from "nanoid";
import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity({ name: 'Transactions' })
export class Transaction {
    constructor() {
        this.id = nanoid()
    }

    @PrimaryColumn()
    id: string

    @Column()
    requestId: string

    @Column()
    orderId: string

    @Column({ default: false })
    isPaid: boolean

    @Column()
    amount: number

    @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date

    @Column({ type: 'timestamp', name: 'update_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date

    @ManyToOne(() => User, user => user.transactions, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user' })
    user: User
}