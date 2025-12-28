export type Block = {
  id: string;
  type: "question" | "option" | "input";
  question: string;
  children: Block[];
};
