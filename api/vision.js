import OpenAI from "openai";


const client = new OpenAI({

apiKey:
process.env.OPENAI_API_KEY,

baseURL:
"https://ai.evanovation.com/v1"

});



// 汇率缓存
let rateCache={};



const currencyMap={


"Indonesian rupiah":"IDR",
"rupiah":"IDR",
"印尼盾":"IDR",

"US dollar":"USD",
"dollar":"USD",
"美元":"USD",

"Japanese yen":"JPY",
"yen":"JPY",
"日元":"JPY",

"Chinese yuan":"CNY",
"人民币":"CNY",

"Euro":"EUR",
"欧元":"EUR",

"British pound":"GBP",
"英镑":"GBP",

"Korean won":"KRW",
"韩元":"KRW"

};





async function normalizeCurrency(name){


if(!name)return null;


if(name.length===3){

return name.toUpperCase();

}


for(let key in currencyMap){

if(
name.toLowerCase()
.includes(
key.toLowerCase()
)
){

return currencyMap[key];

}

}


return name;

}





async function getRate(code){


if(rateCache[code]){

return rateCache[code];

}


try{


let res=
await fetch(
`https://open.er-api.com/v6/latest/${code}`
);



let data=
await res.json();



let rate=
data.rates.CNY;



rateCache[code]=rate;



return rate;



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



const ai=
await client.chat.completions.create({



model:"gpt-6-luna",



max_tokens:200,



temperature:0,



messages:[

{


role:"system",

content:
`
你是旅行价格识别AI。

识别图片。

返回JSON:

{
country:"",
currency:"",
symbol:"",
amount:""
}

currency必须返回英文货币名称。

例如：
Indonesian rupiah
US dollar
Japanese yen

只返回JSON。
`

},


{


role:"user",

content:[

{

type:"text",

text:"识别图片价格"

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




let text=
ai.choices[0].message.content;



text=
text.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



let data=
JSON.parse(text);




//标准化货币


let code=
await normalizeCurrency(
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



return res.status(500).json({

error:e.message

});


}


}
