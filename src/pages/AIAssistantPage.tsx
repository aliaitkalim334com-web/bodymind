import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Привет! 👋 Я AI-помощник BodyMind AI. Я могу помочь тебе с тренировками, питанием, режимом сна, восстановлением и мотивацией. Напиши, какая у тебя цель.",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildSystemPrompt = (userInput: string) => {
    return `
Ты — AI-помощник фитнес-стартапа BodyMind AI.

Твоя роль:
- помогать по тренировкам
- помогать по питанию
- помогать по режиму сна
- помогать по восстановлению
- помогать по мотивации
- отвечать как грамотный фитнес-консультант, без воды
- отвечать понятно, по-человечески, без сложного медицинского жаргона
- если вопрос про набор массы, учитывай профицит калорий
- если вопрос про похудение, учитывай дефицит калорий
- если вопрос про поддержание формы, учитывай баланс калорий
- если вопрос про сон, учитывай режим дня, нагрузку и восстановление
- если пользователь не дал достаточно данных, сначала кратко скажи, чего не хватает
- не придумывай опасные советы
- не советуй запрещённые вещества
- не пиши огромные полотна текста, если пользователь не просит

Контекст приложения BodyMind AI:
- в приложении есть разделы: тренировки, питание, сон, AI-помощник
- пользователь может выбирать цель: набор массы, похудение, поддержание формы
- пользователь может спрашивать про план тренировок, еду, БЖУ, добавки, сон и режим

Сообщение пользователя:
${userInput}
`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    const currentInput = input.trim();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const prompt = buildSystemPrompt(currentInput);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const assistantMessage: Message = {
        role: "assistant",
        content:
          text ||
          "Я не смог сформировать ответ. Попробуй переформулировать вопрос.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Произошла ошибка при ответе AI. Проверь API-ключ Gemini и попробуй ещё раз.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl">
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold">AI Помощник</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ваш персональный фитнес-консультант BodyMind AI
        </p>
      </div>

      <div className="flex-1 glass-card p-4 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "assistant" ? "bg-primary/20" : "bg-secondary"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>

            <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-secondary-foreground">
                AI думает...
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Спросите про тренировки, питание, сон..."
          className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />

        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}