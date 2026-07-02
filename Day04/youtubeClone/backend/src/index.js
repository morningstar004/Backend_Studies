import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "./db/index.js";
import app from "./app.js";


connectDB()
.then(()=> {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
})
.catch((error)=> {
    console.error(`Error: ${error.message}`);
    // process.exit(1) mean that the process will exit with a failure code. In Node.js, an exit code of 0 indicates success, while any non-zero value indicates an error or abnormal termination. By calling `process.exit(1)`, you are signaling that the application encountered an error and is terminating as a result. This can be useful for logging and monitoring purposes, as it allows other systems to detect that the application did not complete successfully.
    process.exit(1);
})
// const app = express();
// (async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       dbName: process.env.DB_Name,
//     });
//     app.on("error", (error) => {
//       console.log("ERROR: ", error.message);
//       throw error;
//     });
//     console.log("MongoDB Connected");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//   }
// })();

// ANOTHER WAY TO CONNECT TO MONGODB


// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//         dbName: process.env.DB_Name
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// }

// connnectDB();
