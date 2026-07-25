import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ResponseHandler(200, "Server is Running.👌", {
      status: "OK",
    }),
  );
});

export { healthcheck };
