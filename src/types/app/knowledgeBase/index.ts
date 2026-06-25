export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type ModalMode = "create" | "edit" | "view";

export interface KnowledgeBaseFormValues {
  title: string;
  category: string;
  content: string;
}
