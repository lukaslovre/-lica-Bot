import type { ChatModel } from "openai/src/resources/index.js";

export function tokensToDollars(
  tokens: {
    input: number;
    output: number;
  },
  model: ChatModel
) {
  const pricePerThousandTokens: {
    [key in ChatModel]: {
      input: number;
      output: number;
    };
  } = {
    "gpt-4o": {
      input: 0.005,
      output: 0.015,
    },
    "gpt-4o-2024-08-06": {
      input: 0.0025,
      output: 0.01,
    },
    "gpt-4o-2024-05-13": {
      input: 0.005,
      output: 0.015,
    },
  };

  const price = pricePerThousandTokens[model];

  return (tokens.input / 1000) * price.input + (tokens.output / 1000) * price.output;
}
