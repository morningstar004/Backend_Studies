import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    complete: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectID,
        ref: "SubTodo",
      },
    ], // Array of SubTodoes Exported from Sub-todo model.
  },
  {
    timestamps: true,
  },
);

export const Todo = mongoose.model(
  //name of the collection
  "Todo",
  //collection schema
  todoSchema,
);
