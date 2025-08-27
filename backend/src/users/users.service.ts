import { ConflictException, Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import type { Repository } from "typeorm";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Attempting to create user with email: ${createUserDto.email}`, "create");
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
      relations: ['subscription'],
    });

    if (existingUser) {
      this.logger.warn(`User creation failed: Email ${createUserDto.email} already exists`, "create");
      throw new ConflictException("Email already exists");
    }

    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
        lastLogin: new Date(),
      });

      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User created successfully with ID: ${savedUser.id}`, "create");
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to create user ${createUserDto.email}: ${error.message}`, "create");
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    this.logger.log("Finding all users", "findAll");
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    this.logger.log(`Finding user with ID: ${id}`, "findOne");
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['subscription'] });

    if (!user) {
      this.logger.warn(`User with ID ${id} not found`, "findOne");
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`Found user with ID: ${id}`, "findOne");
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`, "findByEmail");
    const user = await this.usersRepository.findOne({ where: { email }, relations: ['subscription'] });
    if (user) {
      this.logger.log(`Found user with email: ${email}, ID: ${user.id}`, "findByEmail");
    } else {
      this.logger.log(`User with email ${email} not found`, "findByEmail");
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Attempting to update user with ID: ${id}`, "update");
    const user = await this.findOne(id);

    try {
      if (updateUserDto.password) {
        this.logger.log(`Hashing new password for user ID: ${id}`, "update");
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      const updatedUserData = { ...user, ...updateUserDto };
      const savedUser = await this.usersRepository.save(updatedUserData);
      this.logger.log(`User updated successfully: ${id}`, "update");
      return savedUser;
    } catch (error) {
      this.logger.error(`Failed to update user ${id}: ${error.message}`, "update");
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Attempting to remove user with ID: ${id}`, "remove");
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      this.logger.warn(`User with ID ${id} not found for removal`, "remove");
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.logger.log(`User removed successfully: ${id}`, "remove");
  }

  async findByStoreId(storeId: string): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.storeRoles", "storeRole")
      .leftJoinAndSelect("storeRole.role", "role")
      .where("storeRole.storeId = :storeId", { storeId })
      .getMany();
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await this.usersRepository.update(userId, { stripeCustomerId });
    this.logger.log(`Updated Stripe customer ID for user ${userId}`, "updateStripeCustomerId");
  }
}
