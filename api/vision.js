import OpenAI from "openai";


const client = new OpenAI({

apiKey:
process.env.OPENAI_API_KEY,

baseURL:
"https://ai.evanovation.com/v1"

});



// 汇率缓存

const rateCache={};



// 货币名称转换

const currencyMap={


"人民币":"CNY",
"yuan":"CNY",
"Chinese yuan":"CNY",

"美元":"USD",
"dollar":"USD",
"US dollar":"USD",

"欧元":"EUR",
"Euro":"EUR",

"日元":"JPY",
"Japanese yen":"JPY",

"韩元":"KRW",
"Korean won":"KRW",

"印尼盾":"IDR",
"rupiah":"IDR",
"Indonesian rupiah":"IDR",

"泰铢":"THB",
"Thai baht":"THB",

"新加坡元":"SGD",
"Singapore dollar":"SGD",

"港币":"HKD",
"Hong Kong dollar":"HKD",

"澳元":"AUD",
"Australian dollar":"AUD",

"英镑":"GBP",
"British pound":"GBP"

};





function normalizeCurrency(name){


if(!name)
return null;



if(name.length===3)
return name.toUpperCase();



for(
let key in currencyMap
){

if(
name
.toLowerCase()
.includes(
key.toLowerCase()
)
){

return currencyMap[key];

}

}



return null;


}





async function exchange(currency){



if(rateCache[currency]){

return rateCache[currency];

}



try{


let r=
await fetch(

`https://open.er-api.com/v6/latest/${currency}`

);



let d=
await r.json();



let rate=
d.rates.CNY;



rateCache[currency]=rate;



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


const {

image,

mode="price",

ocr

}=req.body;






let prompt;



if(mode==="receipt"){


prompt=`

你是旅行小票AI。

识别图片里的所有商品。

返回JSON:

{
country:"",
currency:"",
items:[
{
name:"",
price:""
}
],
total:""
}

currency返回英文名称。

只输出JSON。

`;


}else{


prompt=`

你是旅行价格识别AI。

识别图片。

返回JSON:

{
country:"",
currency:"",
symbol:"",
amount:""
}

currency返回英文名称。

只输出JSON。

`;

}




const response=

await client.chat.completions.create({



model:"gpt-6-luna",


temperature:0,


max_tokens:500,



messages:[


{

role:"system",

content:prompt


},


{


role:"user",

content:[


{

type:"text",

text:
`
识别图片。

OCR预扫描结果:
${JSON.stringify(ocr||{})}

`

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
response
.choices[0]
.message
.content;



text=
text
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



let data=
JSON.parse(text);





let code=
normalizeCurrency(
data.currency
);




data.currencyCode=
code;



// 普通价格


if(
mode==="price"
&&
code
&&
data.amount
){



let rate=
await exchange(code);



if(rate){


data.cny=

(
Number(data.amount)
*
rate

).toFixed(2);


}



}






// 小票模式


if(
mode==="receipt"
&&
code
&&
data.items
){



let total=0;



data.items=
data.items.map(item=>{


let price=
Number(item.price)||0;


total+=price;



return item;


});



data.total=total;



let rate=
await exchange(code);



if(rate){


data.cny=

(
total*
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
