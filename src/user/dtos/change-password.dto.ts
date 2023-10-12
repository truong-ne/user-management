import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class ChangePasswordDto {
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