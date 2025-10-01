import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { hash } from 'argon2'

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				id
			},
			include: {
				stores: true,
				favorites: true,
				orders: true
			}
		})

		if (!user) throw new NotFoundException(`User with ID ${id} not found`)

		return user
	}

	async getByEmail(email: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: {
				email
			},
			include: {
				stores: true,
				favorites: true,
				orders: true
			}
		})

		if (!user) throw new NotFoundException(`User with email ${email} not found`)

		return user
	}

	async create(dto: AuthDto): Promise<User> {
		const { name, email, password } = dto
		const hashedPassword = await hash(password)
		return this.prisma.user.create({
			data: {
				name,
				email,
				hashedPassword
			}
		})
	}
}
