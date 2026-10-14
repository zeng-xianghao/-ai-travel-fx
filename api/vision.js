import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://ai.evanovation.com/v1"
});

const rateCache = {};
const currencyMap = {
  "人民币":"CNY","yuan":"CNY","Chinese yuan":"CNY",
  "美元":"USD","dollar":"USD","US dollar":"USD",
  "欧元":"EUR","Euro":"EUR",
  "日元":"JPY","Japanese yen":"JPY",
  "韩元":"KRW","Korean won":"KRW",
  "印尼盾":"IDR","rupiah":"IDR","Indonesian rupiah":"IDR",
  "泰铢":"THB","Thai baht":"THB",
  "新加坡元":"SGD","Singapore dollar":"SGD",
  "港币":"HKD","Hong Kong dollar":"HKD",
  "澳元":"AUD","Australian dollar":"AUD",
  "英镑":"GBP","British pound":"GBP"
};

function normalizeCurrency(name){
  if(!name) return null;
  if(name.length === 3) return name.toUpperCase();
  for(const key in currencyMap){
    if(String(name).toLowerCase().includes(key.toLowerCase())) return currencyMap[key];
  }
  return null;
}

async function exchange(currency){
  if(rateCache[currency]) return rateCache[currency];
  const r = await fetch(`https://open.er-api.com/v6/latest/${currency}`);
  const d = await r.json();
  const rate = d?.rates?.CNY || null;
  rateCache[currency] = rate;
  return rate;
}

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try{
    const { image, mode = "deep", ocr = null } = req.body || {};
    if(!image) return res.status(400).json({ error: "missing image" });

    const model = mode === "fast" ? "gpt-6-sol" : "gpt-6-luna";

    const response = await client.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 180,
      messages: [
        {
          role: "system",
          content: `
你是旅行价格识别AI。
识别图片中的国家、货币、货币符号、金额。
只输出 JSON，不要解释，不要 Markdown。

格式：
{
  "country":"",
  "currency":"",
  "symbol":"",
  "amount":""
}
`
        },
        {
          role: "user",
          content: [
            { type: "text", text: `请快速识别货币金额。OCR预扫描结果：${JSON.stringify(ocr || {})}` },
            { type: "image_url", image_url: { url: image, detail: mode === "fast" ? "low" : "high" } }
          ]
        }
      ]
    });

    let text = response.choices?.[0]?.message?.content || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let data = {};
    try{ data = JSON.parse(text); } catch { data = { raw: text }; }

    const code = normalizeCurrency(data.currency || "");
    data.currencyCode = code;

    if(code && data.amount){
      const rate = await exchange(code);
      if(rate) data.cny = (Number(data.amount) * rate).toFixed(2);
    }

    return res.status(200).json(data);
  }catch(e){
    return res.status(500).json({ error: e.message });
  }
}
