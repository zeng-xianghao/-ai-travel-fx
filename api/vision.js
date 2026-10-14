import OpenAI from 'openai';
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,baseURL:'https://ai.evanovation.com/v1'});
export default async function handler(req,res){
try{
const model=req.body.mode==='fast'?'gpt-6-sol':'gpt-6-luna';
const r=await client.chat.completions.create({model,temperature:0,max_tokens:120,messages:[{role:'system',content:'识别图片货币金额，只返回JSON {country,currency,symbol,amount}'},{role:'user',content:[{type:'text',text:'识别价格'},{type:'image_url',image_url:{url:req.body.image,detail:'low'}}]}]});
let d=JSON.parse(r.choices[0].message.content.replace(/```json|```/g,'').trim());res.json(d)
}catch(e){res.status(500).json({error:e.message})}}
