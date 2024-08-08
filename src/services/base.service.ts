import { Document, Model } from "mongoose";
import ApplicationError from "../utils/application-errors-handler.js";
import QueryBuilder from "../utils/query-builder.js";

class BaseService {
  public async createOne<T extends Document>(Model: Model<T>, data: any) {
    const document = await Model.create(data);

    if (!document) {
      throw new ApplicationError("Failed to create document", 400);
    }

    return document;
  }

  public async updateOne<T extends Document>(
    Model: Model<T>,
    id: string,
    data: any
  ) {
    const document = await Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      throw new ApplicationError("No document has been found", 400);
    }

    return document;
  }

  public async deleteOne<T extends Document>(Model: Model<T>, id: string) {
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      throw new ApplicationError("No related document has been found", 404);
    }

    return document;
  }

  public async getOne<T extends Document>(
    Model: Model<T>,
    id: string,
    populateOptions?: any
  ) {
    let query = Model.findById(id);
    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    if (!document) {
      throw new ApplicationError("No related document has been found", 404);
    }

    return document;
  }

  public async getAll<T extends Document>(Model: Model<T>, queryOptions: any) {
    const features = new QueryBuilder(Model.find(), queryOptions)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const document = await features.query.explain();

    return document;
  }
}

export default new BaseService();
