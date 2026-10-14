export default async function handler(req,res){

res.status(200).json({

status:"API运行正常",

key:
process.env.OPENAI_API_KEY
?
"OPENAI KEY 已连接"
:
"没有找到 KEY"

});

}
