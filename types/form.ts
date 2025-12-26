export type Block = {
  id: string;
  type: "question" | "option";
  question: string;
  children: Block[];
};
