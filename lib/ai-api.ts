import api from "./axios"

// Types
export interface AIConversation {
  id: string
  user_id: string
  form_id?: string
  title: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface FormBlock {
  id: string
  type: "question" | "option"
  question: string
  children: FormBlock[] | null
}

export interface GeneratedForm {
  title: string
  description: string
  blocks: FormBlock[]
}

export interface CreateConversationResponse {
  conversation_id: string
  message: string
  form: GeneratedForm
}

export interface SendMessageResponse {
  message: string
  form: GeneratedForm
}

export interface GetConversationResponse {
  conversation: AIConversation
  messages: AIMessage[]
}

export interface CreateFormResponse {
  message: string
  form_id: string
  form: {
    id: string
    title: string
    description: string
    status: string
    created_at: string
  }
}

// API functions
export const aiApi = {
  // Create a new conversation
  createConversation: async (message: string): Promise<CreateConversationResponse> => {
    const response = await api.post("/admin/ai/conversations", { message })
    return response.data
  },

  // Send a message to an existing conversation
  sendMessage: async (conversationId: string, message: string): Promise<SendMessageResponse> => {
    const response = await api.post(`/admin/ai/conversations/${conversationId}/messages`, { message })
    return response.data
  },

  // Get conversation with all messages
  getConversation: async (conversationId: string): Promise<GetConversationResponse> => {
    const response = await api.get(`/admin/ai/conversations/${conversationId}`)
    return response.data
  },

  // Create form from conversation
  createForm: async (conversationId: string): Promise<CreateFormResponse> => {
    const response = await api.post(`/admin/ai/conversations/${conversationId}/create-form`)
    return response.data
  },

  // List all conversations (if endpoint exists, otherwise we'll add it)
  listConversations: async (): Promise<{ conversations: AIConversation[] }> => {
    const response = await api.get("/admin/ai/conversations")
    return response.data
  },
}
