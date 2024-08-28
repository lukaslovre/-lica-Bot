// import { config } from "dotenv";
import OpenAI from "openai";

// config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

const systemPromptText = `You are an AI assistant that extracts text from images. You are given an image as input, which is either a receipt or not a receipt.

You are helping with a project where people take pictures of their receipts, where they bought items for a group of people.
The goal is to extract the data from the receipts, so the items can be assigned to the people who bought them.
Most of the time, the receipts are from restaurants, fast food places, or grocery stores.

**If the image is not of a receipt:**

Your job is to respond with a sarcastic/smirky/funny comment about the image not being a receipt, including the content of the image in the response. Respond in the following JSON format:

  {
      "error": string
  }

**If the image is of a receipt:**

Your job is to:
- extract the following text from the image of the receipt:
  - the items that were purchased. Each item should have the following information: item name, quantity, and price per item (NOT quantity * price, just price). in other words, everything that has a price on the receipt should be extracted as an item.
  - the total price of the receipt.
  - create a title for the receipt, something containing the store name or maybe a unique/interesting item from the receipt. The style of the title should be like a news headline, in a funny way.
- output the extracted data in the following JSON format:


{
    "title": string,
    "items": [
        {
            "name": string,
            "quantity": number,
            "price": number,
        }
    ],
    "total": number
}
`;

const promptText = "Here is an image! Please extract the neccessary information from it.";

export async function describeImage(fileUrl: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPromptText,
      },
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          {
            type: "image_url",
            image_url: { url: fileUrl },
          },
        ],
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  const text = response.choices[0]?.message.content;

  if (!text) {
    return {
      error: "No response from the AI model.",
    };
  }

  const json = JSON.parse(text);

  //   tu ako je error onda neki error protokol

  console.log(json);

  return json as
    | {
        title: string;
        items: Array<{
          name: string;
          quantity: number;
          price: number;
        }>;
        total: number;
      }
    | { error: string };
}

function parseImageDescriptionJsonResponse(jsonResponse: string) {
  try {
    const parsedResponse = JSON.parse(jsonResponse) as {
      title: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
        total_price: number;
      }>;
      total: number;
      error?: string;
    };

    if (parsedResponse.error) {
      return `Greška: ${parsedResponse.error}`;
    } else {
      return `<strong>${parsedResponse.title}</strong>
            
            ${parsedResponse.items
              .map((item) => {
                return `<strong>${item.name}</strong>
                Količina: ${item.quantity}
                Cijena: ${item.price}
                Ukupna cijena: ${item.total_price}`;
              })
              .join("\n")}
    
            Ukupno: ${parsedResponse.total}`;
    }
  } catch (err) {
    return `Error (error parsing json): ${err.message}`;
  }

  return jsonResponse;
}

// divider

export async function getUsersFromText(text: string) {
  if (!text) throw new Error("Nema teksta ili undefined");
  if (text.length < 5) throw new Error("Sumnjam...");
  if (text.length > 1024) throw new Error(`Previše teksta. ${text.length}/1024 znakova.`);

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Please extract all mentioned people's names from the following text. Also, extract what items 'belong' to each person.
        Output the data in the following JSON format:
        {
          "users": {
              "name": string,
              "consumedItemsIds": string[],
              "payed": number
            }[]
        }`,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  // validate response

  const data = response.choices[0]?.message.content;

  console.log("Direct answer from the AI model: ", data);

  if (!data) {
    throw new Error("No data from the AI model.");
  }

  const parsed = JSON.parse(data) as {
    users: {
      name: string;
      consumedItemsIds: string[];
      payed: number;
    }[];
  };

  if (!parsed.users || !parsed.users.length) {
    throw new Error("No users found in the text or invalid json format");
  }

  return parsed.users;
}
