import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  try {

    const { image } = req.body;


    const response = await client.responses.create({

      model: "gpt-6.1-sol",

      input: [
        {
          role: "user",

          content: [

            {
              type: "input_text",

              text: `
你是一个AI旅行汇率助手。

分析图片中的价格。

返回JSON，不要解释：

{
 "country":"",
 "currency":"",
 "symbol":"",
 "amount":"",
 "items":[]
}

要求：

1. 判断图片所在国家
2. 判断货币
3. 提取价格
4. 如果是菜单或小票，列出商品
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


    res.status(200).json({

      result: response.output_text

    });


  } catch(error){

    res.status(500).json({

      error:error.message

    });

  }

}
