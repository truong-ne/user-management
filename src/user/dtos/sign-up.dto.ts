import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @IsMobilePhone()
    @ApiProperty({ example: '0917068366' })
    phone: string

    @IsNotEmpty()
    @IsString()
    @Length(30)
    @MinLength(8)
    @ApiProperty({ example: '12345678' })
    password: string

    @IsNotEmpty()
    @IsString()
    @Length(30)
    @ApiProperty({ example: 'Customer Name' })
    full_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '09/20/2023' })
    date_of_birth: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Nam' })
    gender: string

    @IsNotEmpty()
    @IsString()
    @Length(50)
    @ApiProperty({ example: 'HCM' })
    address: string
}