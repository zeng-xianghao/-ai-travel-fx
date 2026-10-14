import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export default async function handler(req, res) {

  if(req.method !== "POST"){
    return res.status(405).json({
      error:"Only POST allowed"
    });
  }


  try {

    const { image } = req.body;


    const response = await client.responses.create({

      model: "gpt-6-luna",

      input: [
        {
          role:"user",

          content:[

            {
              type:"input_text",
              text:`
你是一个AI旅行汇率助手。

分析图片。

返回纯JSON：

{
 "country":"",
 "currency":"",
 "symbol":"",
 "amount":"",
 "items":[]
}


要求：

1. 判断图片所在国家
2. 判断货币类型
3. 找出价格
4. 如果是菜单，列出商品
5. 如果是小票，计算总金额

不要输出解释文字。
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
