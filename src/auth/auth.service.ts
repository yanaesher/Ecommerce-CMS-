import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { UserService } from 'src/user/user.service'
import { AuthDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private userService: UserService
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)

		return { user, ...tokens }
	}

	async register(dto: AuthDto) {
		const { email } = dto
		const oldUser = await this.userService.getByEmail(email)

		if (oldUser) throw new BadRequestException('User exists')

		const user = await this.userService.create(dto)
		const tokens = this.issueTokens(user.id)
		return { user, ...tokens }
	}

	issueTokens(userId: string) {
		const payload = { id: userId }

		const accessToken = this.jwt.sign(payload, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(payload, {
			expiresIn: '7d'
		})
		return { accessToken, refreshToken }
	}

	private async validateUser(dto: AuthDto) {
		const { email } = dto
		const user = await this.userService.getByEmail(email)
		if (!user) throw new NotFoundException(`User not found`)

		return user
	}
}
