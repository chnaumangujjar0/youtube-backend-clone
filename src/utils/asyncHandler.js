// =========== PRomise Method =======================
const asyncHandler = (fn) =>{
    return (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch((err)=> next(err))
    }
}


export {asyncHandler}
// ============= async await method =========================
// const asyncHandler = (fn) = async (req,res,next) => { // it is syntax of function in a function 
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success : false,
//             error : error.message
//         })
//     }
// }