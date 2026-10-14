import OpenAI from "openai";


const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

  baseURL:"https://ai.evanovation.com/v1"

});


// 汇率接口
async function getRate(currency){


try{


const url =
`https://open.er-api.com/v6/latest/${currency}`;


const res =
await fetch(url);


const data =
await res.json();



return data.rates.CNY || null;


}catch(e){

return null;

}


}



export default async function handler(req,res){



if(req.method!=="POST"){

return res.status(405).json({

error:"POST only"

});

}



try{


const {image}=req.body;



if(!image){

return res.status(400).json({

error:"没有图片"

});

}




const ai =
await client.chat.completions.create({



model:"gpt-6-luna",



max_tokens:300,



messages:[


{


role:"system",


content:
`
你是旅行汇率AI。

识别图片价格。

只返回JSON:

{
country:"",
currency:"",
symbol:"",
amount:"",
items:[]
}

不要解释。
`

},



{


role:"user",


content:[


{

type:"text",

text:"识别价格"

},


{

type:"image_url",

image_url:{

url:image

}

}


]

}


]



});



let text =
ai.choices[0].message.content;


// 清理JSON
text=text.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



let result;


try{

result=JSON.parse(text);

}catch{

result={

raw:text

};

}




// 自动人民币换算

if(
result.currency &&
result.amount
){


let rate =
await getRate(result.currency);



if(rate){

result.cny =
(
Number(result.amount)
*
rate
).toFixed(2);

}

}




return res.json(result);



}catch(error){


console.log(error);


return res.status(500).json({

error:error.message

});


}


}
