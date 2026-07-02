import mongoose from "mongoose";

/*NOTE: If you Import mongoose, {Schema} together from mongoose the you can start with the Schema constructor directly no need write new mongoose.Schema write new Schema.
                    if import mongoose,{Schema} from "mongoose";
                    then new mongoose.Schema will be new Schema
*/

const userSchema = new mongoose.Schema(
  {
    watchhistory: [
      {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Video",
      },
    ],
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true, // to remove the extra spaces
      index: true, // for faster search
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avtar: {
      type: String, // Cloudinary URL of the image
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    coverimage: {
      type: String, // Cloudinary URL of the image
      default:
        "https://images.unsplash.com/photo-1503264116251-35a269479413?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y292ZXJ8ZW58MHx8MHx8&w=1000&q=80",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshtoken: {
      type: String,
      
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("User", userSchema);
