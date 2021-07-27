import { User } from "./../entities/User";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
} from "type-graphql";
import { Resolver } from "type-graphql";
import { MyContext } from "src/types";
import argon2 from "argon2";

@InputType()
class UserNamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldErrors {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponce {
  @Field(() => [FieldErrors], { nullable: true })
  errors?: FieldErrors[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponce)
  async registerUser(
    @Arg("option") option: UserNamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponce> {
    if (option.username.length <= 2) {
      return {
        errors: [
          {
            field: option.username,
            message: "the username is too short",
          },
        ],
      };
    }
    if (option.password.length <= 2) {
      return {
        errors: [
          {
            field: option.password,
            message: "the password is too short",
          },
        ],
      };
    }
    const hashedpassword = await argon2.hash(option.password);
    const user = em.create(User, {
      username: option.username,
      password: hashedpassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: option.username,
              message: "user already exists",
            },
          ],
        };
      }
    }

    return {
      user,
    };
  }
  @Mutation(() => UserResponce)
  async login(
    @Arg("option") option: UserNamePasswordInput,
    @Ctx() { em , req}: MyContext
  ): Promise<UserResponce> {
    const user = await em.findOne(User, { username: option.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "the user not exits",
          },
        ],
      };
    }
    const comparePassword = await argon2.verify(user.password, option.password);
    if (!comparePassword) {
      return {
        errors: [
          {
            field: "password",
            message: "the password is not valid",
          },
        ],
      };
    }
    req.session.userId= user.id;
    return {
      user,
    };
  }
  @Query(()=>User, {nullable:true})
  async me (@Ctx() { em ,req}: MyContext){
     if(!req.session.userId) {
        return null;
     }
     const user = await em.findOne(User, {id:req.session.userId});
     return user;
  }

  @Query(() => [User])
  async getUsers(@Ctx() { em }: MyContext): Promise<User[]> {
    const users = await em.find(User, {});
    return users;
  }
  @Mutation(() => User, { nullable: true })
  async updateUser(
    @Arg("id") id: number,
    @Arg("username") username: string,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    const user = await em.findOne(User, { id });
    if (!user) {
      return null;
    } else {
      user.username = username;
      await em.persistAndFlush(user);
    }
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(User, { id });
    return true;
  }
}
 