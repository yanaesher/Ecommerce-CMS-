import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/client'

interface JwtPayload {
	id: string
}

interface OAuthUser {
	email: string
	name: string
	picture?: string
}

interface AuthenticatedRequest {
	user: OAuthUser
}

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1
	REFRESH_TOKEN_NAME = 'refreshToken'
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private userService: UserService,
		private configService: ConfigService
	) {}

	async login(
		dto: AuthDto
	): Promise<{ user: User; accessToken: string; refreshToken: string }> {
		const user = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)

		return { user, ...tokens }
	}

	async register(
		dto: AuthDto
	): Promise<{ user: User; accessToken: string; refreshToken: string }> {
		const { email } = dto
		const oldUser = await this.userService.getByEmail(email)

		if (oldUser) throw new BadRequestException('User exists')

		const user = await this.userService.create(dto)
		const tokens = this.issueTokens(user.id)
		return { user, ...tokens }
	}

	async getNewTokens(
		refreshToken: string
	): Promise<{ user: User; accessToken: string; refreshToken: string }> {
		const result = await this.jwt.verifyAsync<JwtPayload>(refreshToken)

		if (!result) throw new UnauthorizedException('Invalid refresh Token')

		const user = await this.userService.getById(result.id)
		const tokens = this.issueTokens(user.id)
		return { user, ...tokens }
	}

	issueTokens(userId: string): { accessToken: string; refreshToken: string } {
		const payload = { id: userId }

		const accessToken = this.jwt.sign(payload, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(payload, {
			expiresIn: '7d'
		})
		return { accessToken, refreshToken }
	}

	async validateUser(dto: AuthDto): Promise<User> {
		const { email } = dto
		const user = await this.userService.getByEmail(email)
		if (!user) throw new NotFoundException(`User not found`)

		return user
	}

	async validateOAuthLogin(req: AuthenticatedRequest): Promise<User> {
		let user = await this.userService.getByEmail(req.user.email)

		if (!user) {
			user = await this.prisma.user.create({
				data: {
					email: req.user.email,
					name: req.user.name,
					picture: req.user.picture || '/uploads/no-user-image.png'
				},
				include: {
					stores: true,
					favorites: true,
					orders: true
				}
			})
		}

		return user
	}

	addRefreshTokenFromResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			domain: this.configService.get('SERVER_DOMAIN'),
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		})
	}
}
