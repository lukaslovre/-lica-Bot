// type Receipt = {
//   id: string;
//   title: string;
//   items: ReceiptItem[];
//   created_at: Date;
//   updated_at?: Date;
//   status: "incomplete" | "payedOff";
//   users?: UserData[];
// };

type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

type UserData = {
  name: string;
  consumedItemsIds: ReceiptItem["id"][];
  payed: number;
};

// type ChatState = {
//   receipt?: Receipt;
// };
