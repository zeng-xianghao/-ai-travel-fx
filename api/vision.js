import OpenAI from 'openai';

const client=new OpenAI({
apiKey:process.env.OPENAI_API_KEY,
baseURL:'https://ai.evanovation.com/v1'
});

const cache={};

async function handler(req,res){
try{
const {image,mode='deep'}=req.body;
const model=mode==='fast'?'gpt-6-sol':'gpt-6-luna';

const r=await client.chat.completions.create({
model,
temperature:0,
max_tokens:120,
messages:[
{role:'system',content:'识别图片货币和价格，只返回JSON {country,currency,symbol,amount}'},
{role:'user',content:[{type:'text',text:'识别价格'},{type:'image_url',image_url:{url:image,detail:'low'}}]}
]});

let d=JSON.parse(r.choices[0].message.content.replace(/```json|```/g,'').trim());

let code=d.currency;
if(code&&code.length>3) code=code.includes('rupiah')?'IDR':code.includes('dollar')?'USD':code;

if(code){
if(!cache[code]){
let x=await fetch(`https://open.er-api.com/v6/latest/${code}`);
let j=await x.json();cache[code]=j.rates.CNY;
}
if(d.amount)d.cny=(Number(d.amount)*cache[code]).toFixed(2);
}
res.json(d);
}catch(e){res.status(500).json({error:e.message})}
}

export default handler;