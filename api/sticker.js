import OpenAI from "openai";

const client = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY,
 baseURL:"https://ai.evanovation.com/v1"
});

export default async function handler(req,res){
try{
 const r=await client.chat.completions.create({
  model:"gpt-6-luna",
  temperature:0,
  max_tokens:120,
  messages:[
   {
    role:"system",
    content:"识别图片主体。分类人物、建筑、商品、动物、食物、物品。只返回JSON {subject,type}"
   },
   {
    role:"user",
    content:[
     {type:"text",text:"分析图片主体"},
     {type:"image_url",image_url:{url:req.body.image,detail:"high"}}
    ]
   }
  ]
 });
 let t=r.choices[0].message.content.replace(/```json|```/g,"").trim();
 res.json(JSON.parse(t));
}catch(e){
 res.json({subject:"unknown",type:"object"});
}
}
