import OpenAI from "openai";


const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

  baseURL: "https://ai.evanovation.com/v1"

});



export default async function handler(req, res) {


  if (req.method !== "POST") {

    return res.status(405).json({

      error: "只支持POST请求"

    });

  }



  try {


    const { image } = req.body;



    if (!image) {

      return res.status(400).json({

        error: "没有收到图片"

      });

    }



    const response = await client.chat.completions.create({


      model: "gpt-6-luna",


      messages: [

        {

          role: "system",

          content:
          `
你是一个旅行汇率AI助手。

分析用户上传图片。

必须返回JSON格式：

{
 "country":"",
 "currency":"",
 "symbol":"",
 "amount":"",
 "items":[]
}

规则：

1. 判断国家
2. 判断货币
3. 提取价格
4. 菜单列出商品
5. 小票列出商品和总价

不要输出解释。
`

        },


        {

          role: "user",

          content: [

            {

              type:"text",

              text:"请识别图片中的价格信息"

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



    return res.status(200).json({

      result:
      response.choices[0].message.content

    });



  } catch(error) {


    console.error(error);


    return res.status(500).json({

      error:error.message

    });


  }


}
