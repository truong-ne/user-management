import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @Length(8, 30)
    @ApiProperty({ example: '12345678' })
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    @ApiProperty({ example: '12345678' })
    password: string

    @IsString()
    @Length(8, 30)
    @ApiProperty({ example: '12345678' })
    passwordConfirm: string;
}

export class ChangePasswordForgotDto {
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty({ example: 'customer@gmail.com' })
    email: string

    @IsString()
    @ApiProperty({ example: '12345678' })
    otp: string;

    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    @ApiProperty({ example: '12345678' })
    password: string

    @IsString()
    @Length(8, 30)
    @ApiProperty({ example: '12345678' })
    passwordConfirm: string;
}