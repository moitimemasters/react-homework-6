import { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { log } from "node:console";
import { env } from "node:process";
import { singleton } from "tsyringe";

/**
* An `injectable`, `singleton` class wich wraps the `MongoClient`, to be able
to inject later using DI system `tsyringe`.
It is automatically connecting to mongo, giving the user only to public methods:
+ `getMongoClient` - to get actual instance of mongo client **with established connection**, once it is injected
+ `closeMongoClient` - to close mongo client connection
*/
@singleton()
export class MongoWrapper {
  private mongoClient: MongoClient;

  constructor() {
    this.mongoClient = new MongoClient(
      env.MONGO_URL || "mongodb://localhost:27017/",
    );
    this.mongoClient
      .connect()
      .then(() => {
        log("success");
      })
      .catch(() => {
        throw "Error connecting to DB";
      });
  }

  getMongoClient(): MongoClient {
    return this.mongoClient;
  }

  async closeMongoClient() {
    await this.mongoClient.close();
  }
}

export const handleErrorAsync =
  (func: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    func(req, res).catch((error) => next(error));
  };
