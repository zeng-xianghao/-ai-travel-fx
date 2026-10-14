import OpenAI from "openai";


const client = new OpenAI({

apiKey: process.env.OPENAI_API_KEY,

baseURL:"https://ai.evanovation.com/v1"

});



// 汇率缓存
let rateCache={};



const currencyMap={

"Indonesian rupiah":"IDR",
"rupiah":"IDR",

"US dollar":"USD",
"dollar":"USD",

"Japanese yen":"JPY",
"yen":"JPY",

"Euro":"EUR",

"British pound":"GBP",

"Korean won":"KRW",

"Chinese yuan":"CNY",

"Thai baht":"THB"

};



function normalizeCurrency(name){


if(!name)
return null;


if(name.length===3)
return name.toUpperCase();


for(let k in currencyMap){

if(
name.toLowerCase()
.includes(k.toLowerCase())
){

return currencyMap[k];

}

}


return null;

}




async function getRate(code){


if(rateCache[code]){

return rateCache[code];

}


try{


let r=
await fetch(
`https://open.er-api.com/v6/latest/${code}`
);


let d=
await r.json();



let rate=d.rates.CNY;


rateCache[code]=rate;


return rate;


}catch{

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

error:"missing image"

});

}



const ai =
await client.chat.completions.create({



// 保持视觉模型

model:"gpt-6-luna",



// 降低等待

temperature:0,



max_tokens:120,



messages:[


{


role:"system",

content:
`
你是极速旅行货币识别AI。

任务：
识别图片中的国家、货币、金额。

只返回JSON。

格式：

{
country:"",
currency:"",
symbol:"",
amount:""
}

不要解释。
不要Markdown。
`

},


{


role:"user",

content:[


{

type:"text",

text:
"快速识别价格"

},


{

type:"image_url",

image_url:{

url:image,

detail:"low"

}

}


]

}


]


});




let text=
ai.choices[0]
.message
.content;



text=
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



let data=
JSON.parse(text);




//货币标准化

let code=
normalizeCurrency(
data.currency
);



data.currencyCode=code;



//人民币换算


if(
code &&
data.amount
){


let rate=
await getRate(code);



if(rate){


data.cny=

(
Number(data.amount)
*
rate

).toFixed(2);


}


}



return res.json(data);



}catch(e){



console.log(e);


return res.status(500).json({

error:e.message

});


}


}
