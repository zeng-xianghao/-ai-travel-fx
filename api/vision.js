export default async function handler(req,res){

res.json({
 status:"API works",
 key:process.env.OPENAI_API_KEY ? "FOUND":"MISSING"
})

}
