import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsMobilePhone, IsDate, Length, MinLength, MaxLength, Matches, IsEmail, IsEnum } from "class-validator";
import { Gender, Relationship } from "../../config/enum.constants";

export class AddMedicalRecordDto {
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
    @IsEnum(Gender, { message: "Sai cú pháp" })
    @ApiProperty({ example: 'Male' })
    gender: string

    @IsNotEmpty()
    @IsEnum(Relationship, { message: "Sai cú pháp" })
    @ApiProperty({ example: 'Other' })
    relationship: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: 'anh dai dien' })
    avatar: string

    @IsString()
    @MaxLength(50)
    @ApiProperty({ example: 'HCM' })
    address: string
}