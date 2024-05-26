import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsNumber } from "class-validator"

export class TransactionDto {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: 200000 })
    amount: number
}