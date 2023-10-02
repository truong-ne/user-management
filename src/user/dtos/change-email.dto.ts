import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ChangeEmailDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: 'customer@gmail.com' })
    email: string
}