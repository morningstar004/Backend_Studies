import mongoose from "mongoose";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const statusCode = databaseConnected ? 200 : 503;

  return res
    .set("Cache-Control", "no-store")
    .status(statusCode)
    .json(
      new ResponseHandler(
        statusCode,
        databaseConnected ? "Server is running." : "Database is unavailable.",
        {
          status: databaseConnected ? "OK" : "DEGRADED",
          database: databaseConnected ? "connected" : "disconnected",
        },
      ),
    );
});

export { healthcheck };
