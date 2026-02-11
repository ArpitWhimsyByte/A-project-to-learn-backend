const asynchandler=(requestHandler)=>{
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((error)=> next(error))
    }
}
// const handler=(func)=>async (req,res,next)=>{
//     try {
//           await func(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             success : false,
//             message: error.message
//         })
//     }
// }

export { asynchandler }

