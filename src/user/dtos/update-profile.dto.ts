import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { SignUpDto } from "./sign-up.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfile {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'anh dai dien' })
    avatar: string

    @IsNotEmpty()
    @IsString()
    @Length(2, 30)
    @ApiProperty({ example: 'New Customer Name' })
    full_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: '09/20/2023' })
    date_of_birth: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'Male' })
    gender: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty({ example: 'minh@email.com' })
    email: string

    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    @ApiProperty({ example: 'HCM' })
    address: string
}