import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { SignUpDto } from "./sign-up.dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProfile {
    @IsNotEmpty()
    @IsString()
    avatar: string

    @IsNotEmpty()
    @IsString()
    @Length(30)
    full_name: string

    @IsNotEmpty()
    @IsString()
    date_of_birth: string

    @IsNotEmpty()
    @IsString()
    gender: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsString()
    @Length(50)
    address: string
}