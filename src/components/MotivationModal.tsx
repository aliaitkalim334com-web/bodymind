import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";

const quotes = [
  { text: "Твоё тело может выдержать почти всё. Убеди свой разум.", author: "Неизвестный" },
  { text: "Не останавливайся, когда устал. Остановись, когда закончил.", author: "Неизвестный" },
  { text: "Успех — это сумма маленьких усилий, повторяемых изо дня в день.", author: "Роберт Кольер" },
  { text: "Сила не приходит от того, что ты можешь сделать. Она приходит от преодоления того, что ты считал невозможным.", author: "Риг Вейл" },
  { text: "Каждый день — новый шанс стать лучше.", author: "BodyMind AI" },
];

export default function MotivationModal() {
  const [show, setShow] = useState(true);
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="relative max-w-lg w-full mx-4 glass-card p-8 text-center glow-green"
          >
            <button onClick={() => setShow(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
            <p className="text-xl font-display font-semibold leading-relaxed mb-3 text-foreground">
              "{quote.text}"
            </p>
            <p className="text-sm text-muted-foreground">— {quote.author}</p>
            <div className="mt-6">
              <button
                onClick={() => setShow(false)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Начать день 💪
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
