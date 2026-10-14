import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export default async function handler(req,res){

if(req.method !== "POST"){
 return res.status(405).json({
  error:"Only POST allowed"
 });
}


try{

const {image}=req.body;


const response = await client.responses.create({

model:"gpt-6-luna",

input:[

{
role:"user",

content:[

{
type:"input_text",

text:`
你是一个旅行汇率AI。

分析图片。

只返回JSON：

{
country:"",
currency:"",
symbol:"",
amount:"",
items:[]
}

识别：
1. 国家
2. 货币
3. 金额
4. 商品列表
5. 小票总额

不要解释。
`
},

{
type:"input_image",
image_url:image
}

]

}

]

});


return res.status(200).json({

result:response.output_text

});


}catch(error){

return res.status(500).json({

error:error.message

});

}

}
