import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsOptional()
	@IsString()
	name: string

	@IsString({ message: 'Email is required' })
	@IsEmail()
	email: string

	@MinLength(6, { message: 'Password must contain at least 6 characters' })
	@IsString({ message: 'Password is required' })
	password: string
}
