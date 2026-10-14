import OpenAI from "openai";


const client = new OpenAI({

  apiKey: process.env.OPENAI_API_KEY,

  baseURL: "https://ai.evanovation.com/v1"

});


export default async function handler(req,res){


  if(req.method !== "POST"){

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



    const response = await client.chat.completions.create({


      model:"gpt-6-luna",


      messages:[


        {

          role:"system",

          content:
`
你是旅行AI识别助手。

分析图片中的价格。

必须返回JSON:

{
country:"",
currency:"",
symbol:"",
amount:"",
items:[]
}

识别：
- 国家
- 货币
- 价格
- 商品

只返回JSON。
`

        },


        {

          role:"user",

          content:[

            {

              type:"text",

              text:"分析这张图片"

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



  }catch(error){


    console.log(error);


    return res.status(500).json({

      error:error.message

    });


  }


}
