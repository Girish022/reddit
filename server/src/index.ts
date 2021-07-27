import { _prod_ } from './constants';
import { UserResolver } from './resolvers/user';
import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import microConfig from "./mikro-orm.config";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from "./resolvers/post";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';

declare module 'express-session' {
  export interface SessionData {
    userId: number
  }
}


const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const RedisStore=connectRedis(session);
const redisClient=redis.createClient();
const app = await express();


  app.use(
    session({
      name:'qid',
      store: new RedisStore({ client: redisClient , disableTouch:true}),
      saveUninitialized: false,
      cookie:{
        maxAge:1000*60*60*24*365,
        httpOnly:true,
        secure:_prod_,
        sameSite:'lax',
      },
      secret: 'keyboard cat',
      resave: false,
    })
  )



  const apolloServer = await new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver,PostResolver,UserResolver],
      validate:false
    }),
    context:({req, res}):MyContext=>({em:orm.em, req, res})
  });
  
  await apolloServer.applyMiddleware({app});

  app.get("/", (_, res) => {
    res.send("hello World3");
  });
  app.listen(4000, () => {
    console.log("server started");
  });
};

main();
