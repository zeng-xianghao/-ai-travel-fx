import OpenAI from "openai";


const client = new OpenAI({

apiKey:
process.env.OPENAI_API_KEY,

baseURL:
"https://ai.evanovation.com/v1"

});



async function getRate(currency){


try{


let r=
await fetch(
`https://open.er-api.com/v6/latest/${currency}`
);


let d=
await r.json();


return d.rates.CNY;


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



const response =

await client.chat.completions.create({



model:"gpt-6-luna",



temperature:0,



max_tokens:200,



messages:[

{


role:"system",

content:
`
你是旅行价格识别AI。

识别图片。

只输出JSON:

{
country:"",
currency:"",
symbol:"",
amount:""
}

不要解释。
`

},


{


role:"user",

content:[

{

type:"text",

text:"识别图片里的货币和金额"

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



let content=
response.choices[0].message.content;



content=
content
.replace(/```json/g,"")
.replace(/```/g,"")
.trim();



let data;


try{

data=JSON.parse(content);

}catch{

data={
raw:content
};

}




if(
data.currency &&
data.amount
){


let rate=
await getRate(data.currency);


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
