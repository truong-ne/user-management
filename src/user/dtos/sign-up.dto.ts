import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength, MaxLength, Matches } from "class-validator";

export class SignUpDto {
    @IsNotEmpty()
    @IsMobilePhone()
    @ApiProperty({ example: '0917068366' })
    phone: string

    @IsNotEmpty()
    @IsString()
    @Length(8, 30)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    @ApiProperty({ example: '12345678' })
    password: string

    @IsString()
    @Length(8, 30)
    @Matches('password')
    @ApiProperty({ example: '12345678' })
    passwordConfirm: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 30)
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

    @IsString()
    @MaxLength(50)
    @ApiProperty({ example: 'HCM' })
    address: string
}