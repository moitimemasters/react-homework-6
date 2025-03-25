import "reflect-metadata";
import { inject, singleton } from "tsyringe";
import { Category } from "../models/category";
import { Collection, ObjectId } from "mongodb";
import { MongoWrapper } from "../lifespan";
import { Product, UpdateProduct } from "../models/product";
import { ValidationError } from "../errors/errors";
import { User, UserPublic } from "../models/user";
import { RefreshToken } from "../models/refresh-token";

/**
* An `injectable`, `singleton` class wich encapsulates all the work with database.
Currently is is implementing interfacing with mongo
*/
@singleton()
export class Repository {
  private categoryCollection: Collection<Category>;
  private productCollection: Collection<Product>;
  private userCollection: Collection<User & { _id?: ObjectId }>;
  private refreshTokenCollection: Collection<RefreshToken & { _id?: ObjectId }>;

  constructor(@inject(MongoWrapper) private mongoWrapper: MongoWrapper) {
    const db = this.mongoWrapper.getMongoClient().db("warehouse-app");
    this.categoryCollection = db.collection("category");
    this.productCollection = db.collection("product");
    this.userCollection = db.collection("user");
    this.refreshTokenCollection = db.collection("refresh_token");
  }

  private makeIdFilter(id: string): { _id: ObjectId } {
    try {
      return { _id: new ObjectId(id) };
    } catch (_) {
      throw new ValidationError("Validation Error", {
        context: `Cannot interpret id=${id} as an id of object in Mongo`,
      });
    }
  }

  // ---------- User operations ----------

  async createUser(user: User): Promise<string> {
    // Проверяем, существует ли пользователь с таким именем
    const existingUser = await this.userCollection.findOne({ username: user.username });
    if (existingUser) {
      throw new ValidationError("Validation Error", {
        violations: [`User with username '${user.username}' already exists`],
      });
    }

    // Проверяем, существует ли пользователь с таким email
    const existingEmail = await this.userCollection.findOne({ email: user.email });
    if (existingEmail) {
      throw new ValidationError("Validation Error", {
        violations: [`User with email '${user.email}' already exists`],
      });
    }

    return (await this.userCollection.insertOne(user)).insertedId.toHexString();
  }

  async getAllUsers(): Promise<Array<UserPublic>> {
    const users = await this.userCollection.find().toArray();
    return users.map(user => ({
      id: user._id!.toHexString(),
      username: user.username,
      email: user.email,
      group: user.group,
      avatarUrl: user.avatarUrl
    }));
  }

  async updateUser(id: string, updatedUser: Partial<User>): Promise<boolean> {
    // Если обновляем username, проверяем его уникальность
    if (updatedUser.username) {
      const existingUser = await this.userCollection.findOne({
        username: updatedUser.username,
        _id: { $ne: new ObjectId(id) }
      });

      if (existingUser) {
        throw new ValidationError("Validation Error", {
          violations: [`User with username '${updatedUser.username}' already exists`],
        });
      }
    }

    // Если обновляем email, проверяем его уникальность
    if (updatedUser.email) {
      const existingEmail = await this.userCollection.findOne({
        email: updatedUser.email,
        _id: { $ne: new ObjectId(id) }
      });

      if (existingEmail) {
        throw new ValidationError("Validation Error", {
          violations: [`User with email '${updatedUser.email}' already exists`],
        });
      }
    }

    const result = await this.userCollection.updateOne(
      this.makeIdFilter(id),
      { $set: updatedUser }
    );

    return result.matchedCount > 0;
  }

  async getUserById(id: string): Promise<(User & { id: string }) | null> {
    const user = await this.userCollection.findOne(this.makeIdFilter(id));
    if (!user) return null;
    return {
      ...user,
      id: user._id!.toHexString()
    };
  }

  async getUserByUsername(username: string): Promise<(User & { id: string }) | null> {
    const user = await this.userCollection.findOne({ username });
    if (!user) return null;
    return {
      ...user,
      id: user._id!.toHexString()
    };
  }

  // ---------- Refresh Token operations ----------

  async saveRefreshToken(refreshToken: RefreshToken): Promise<string> {
    // Удаляем старые токены для этого пользователя
    await this.refreshTokenCollection.deleteMany({ userId: refreshToken.userId });

    // Сохраняем новый токен
    return (await this.refreshTokenCollection.insertOne(refreshToken)).insertedId.toHexString();
  }

  async findRefreshToken(userId: string, token: string): Promise<RefreshToken | null> {
    return await this.refreshTokenCollection.findOne({ userId, token });
  }

  async deleteRefreshToken(userId: string, token: string): Promise<boolean> {
    const result = await this.refreshTokenCollection.deleteOne({ userId, token });
    return result.deletedCount > 0;
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<boolean> {
    const result = await this.refreshTokenCollection.deleteMany({ userId });
    return result.deletedCount > 0;
  }

  // ---------- Category operations ----------

  async getCategories(): Promise<Array<Category & { id: string }>> {
    const categories = await this.categoryCollection.find().toArray();
    return categories.map(category => ({
      ...category,
      id: category._id!.toHexString()
    }));
  }

  async getCategory(id: string): Promise<(Category & { id: string }) | null> {
    const category = await this.categoryCollection.findOne(this.makeIdFilter(id));
    if (!category) return null;
    return {
      ...category,
      id: category._id!.toHexString()
    };
  }

  async updateCategory(id: string, updatedCategory: Partial<Category>): Promise<Boolean> {
    return (
      (
        await this.categoryCollection.updateOne(this.makeIdFilter(id), {
          $set: updatedCategory,
        })
      ).matchedCount > 0
    );
  }

  async insertCategory(category: Category): Promise<string> {
    return (
      await this.categoryCollection.insertOne(category)
    ).insertedId.toHexString();
  }

  async deleteCategory(id: string): Promise<Boolean> {
    return (
      (await this.categoryCollection.deleteOne(this.makeIdFilter(id)))
        .deletedCount > 0
    );
  }

  // ---------- Product operations ----------

  async getProducts(
    limit: number | null | undefined,
    offset: number | null | undefined,
  ): Promise<Array<Product & { id: string }>> {
    let findExpression = this.productCollection.find({});
    if (typeof offset === "number" && offset >= 0) {
      findExpression = findExpression.skip(offset);
    }
    if (typeof limit === "number" && limit > 0) {
      findExpression = findExpression.limit(limit);
    }

    const products = await findExpression.toArray();
    return products.map(product => ({
      ...product,
      id: product._id!.toHexString()
    }));
  }

  async insertProduct(product: Product): Promise<string> {
    return (
      await this.productCollection.insertOne(product)
    ).insertedId.toHexString();
  }

  async updateProduct(id: string, updates: UpdateProduct): Promise<Boolean> {
    let updateFilter = { $set: updates };
    return (
      (
        await this.productCollection.updateOne(
          this.makeIdFilter(id),
          updateFilter,
        )
      ).matchedCount > 0
    );
  }

  async getProduct(id: string): Promise<(Product & { id: string }) | null> {
    const product = await this.productCollection.findOne(this.makeIdFilter(id));
    if (!product) return null;
    return {
      ...product,
      id: product._id!.toHexString()
    };
  }

  async deleteProduct(id: string): Promise<Boolean> {
    return (
      (await this.productCollection.deleteOne(this.makeIdFilter(id)))
        .deletedCount > 0
    );
  }
}
