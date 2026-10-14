import OpenAI from "openai";


const client = new OpenAI({

apiKey:
process.env.OPENAI_API_KEY

});



export default async function handler(req,res){



if(req.method !== "POST"){

return res.status(405).json({

error:"只支持POST"

});

}



try{


const {image}=req.body;



if(!image){

return res.status(400).json({

error:"没有收到图片"

});

}




// 防止超大图片

if(image.length > 2000000){

return res.status(413).json({

error:"图片太大，请重新拍摄"

});

}




const response =

await client.responses.create({



model:"gpt-6-luna",



input:[


{

role:"user",



content:[


{

type:"input_text",


text:`

你是旅行汇率AI助手。

分析图片。

只返回JSON:

{

"country":"",

"currency":"",

"symbol":"",

"amount":"",

"items":[]

}


要求:

1. 判断国家
2. 判断货币
3. 识别价格
4. 识别菜单和小票商品
5. 不要解释

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


result:

response.output_text


});



}

catch(error){



console.error(error);



return res.status(500).json({

error:error.message

});


}



}
