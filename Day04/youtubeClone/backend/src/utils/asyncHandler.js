// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// }

//OR 

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
    }
}// asyncHandler: This is a higher-order function that takes a request handler function (requestHandler) as an argument and returns a new function. The returned function is an asynchronous middleware that wraps the original request handler in a Promise. If the request handler throws an error, it will be caught and passed to the next middleware (next) for error handling. This allows for cleaner error handling in asynchronous route handlers without the need for try-catch blocks in each handler.

//Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));: This line ensures that the request handler is executed as a Promise. If the request handler resolves successfully, it proceeds normally. If it rejects (throws an error), the error is caught and passed to the next middleware function (next) for centralized error handling. This pattern helps manage errors in asynchronous code more effectively.



export {asyncHandler}