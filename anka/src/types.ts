export interface CustomerDetails {
  name: string;
  phone: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface PricingItem {
  item: string;
  priceRange: string;
  timeEstimate: string;
}