import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://ai.evanovation.com/v1"
});

function normalizeType(type) {
  const t = String(type || "").toLowerCase();
  if (t.includes("person") || t.includes("human")) return "person";
  if (t.includes("building") || t.includes("architecture")) return "building";
  if (t.includes("product") || t.includes("goods") || t.includes("item_product")) return "product";
  return "object";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ error: "missing image" });
    }

    const response = await client.chat.completions.create({
      model: "gpt-6-sol",
      temperature: 0,
      max_tokens: 60,
      messages: [
        {
          role: "system",
          content: `
你是图片主体识别助手。
请识别图片的主要主体，并分类为以下之一：
person / building / product / object

只输出 JSON：
{
  "subject": "",
  "type": ""
}
不要解释，不要 Markdown。
`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "快速识别图片主体并分类。" },
            { type: "image_url", image_url: { url: image, detail: "low" } }
          ]
        }
      ]
    });

    let text = response.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let data = { subject: "未知主体", type: "object" };
    try { data = JSON.parse(text); } catch {}
    data.type = normalizeType(data.type);

    return res.status(200).json(data);
  } catch (e) {
    return res.status(200).json({ subject: "未知主体", type: "object" });
  }
}
