import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Apple, Calculator, TrendingUp, Clock3, Pill } from "lucide-react";

type GoalType = "lose" | "maintain" | "gain";
type TrainingTimeType = "morning" | "day" | "evening" | "night";

interface MealItem {
  name: string;
  grams: string;
  protein: number;
  fat: number;
  carbs: number;
}

interface MealBlock {
  title: string;
  time: string;
  items: MealItem[];
}

interface SupplementItem {
  name: string;
  amount: string;
  timing: string;
  note: string;
}

const weekDays = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

function sumMealMacros(items: MealItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.protein += item.protein;
      acc.fat += item.fat;
      acc.carbs += item.carbs;
      return acc;
    },
    { protein: 0, fat: 0, carbs: 0 }
  );
}

function getGoalTitle(goal: GoalType) {
  if (goal === "lose") return "Похудение";
  if (goal === "gain") return "Набор массы";
  return "Поддержание формы";
}

function getTrainingTimeLabel(time: TrainingTimeType) {
  if (time === "morning") return "Утром";
  if (time === "day") return "Днём";
  if (time === "evening") return "Вечером";
  return "Ночью";
}

function getCaloriesTarget(tdee: number, goal: GoalType) {
  if (goal === "lose") return tdee - 400;
  if (goal === "gain") return tdee + 400;
  return tdee;
}

function getProteinTarget(weight: number, goal: GoalType) {
  if (goal === "lose") return Math.round(weight * 2.2);
  if (goal === "gain") return Math.round(weight * 2);
  return Math.round(weight * 1.8);
}

function getFatTarget(weight: number, calories: number, goal: GoalType) {
  if (goal === "lose") return Math.round(weight * 0.8);
  if (goal === "gain") return Math.round(weight * 1);
  return Math.max(Math.round(calories * 0.25 / 9), Math.round(weight * 0.8));
}

function getCarbsTarget(calories: number, protein: number, fat: number) {
  return Math.round((calories - protein * 4 - fat * 9) / 4);
}

function buildDailyMeals(goal: GoalType, trainingTime: TrainingTimeType): MealBlock[] {
  const templates = {
    lose: {
      morning: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "70 г", protein: 8, fat: 4, carbs: 42 },
            { name: "Ягоды", grams: "100 г", protein: 1, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Гречка", grams: "150 г готового продукта", protein: 5, fat: 2, carbs: 30 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "16:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "19:30",
          items: [
            { name: "Рыба", grams: "200 г", protein: 40, fat: 10, carbs: 0 },
            { name: "Салат", grams: "250 г", protein: 2, fat: 5, carbs: 10 },
            { name: "Авокадо", grams: "70 г", protein: 1, fat: 10, carbs: 6 },
          ],
        },
      ],
      day: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Омлет", grams: "4 яйца", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "60 г", protein: 7, fat: 4, carbs: 36 },
          ],
        },
        {
          title: "Перекус",
          time: "11:00",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
          ],
        },
        {
          title: "Обед после тренировки",
          time: "14:30",
          items: [
            { name: "Куриная грудка", grams: "220 г", protein: 50, fat: 5, carbs: 0 },
            { name: "Рис", grams: "180 г готового продукта", protein: 5, fat: 1, carbs: 50 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Ужин",
          time: "19:00",
          items: [
            { name: "Тунец", grams: "180 г", protein: 38, fat: 4, carbs: 0 },
            { name: "Салат", grams: "250 г", protein: 2, fat: 5, carbs: 10 },
          ],
        },
      ],
      evening: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "70 г", protein: 8, fat: 4, carbs: 42 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Рис", grams: "150 г готового продукта", protein: 4, fat: 1, carbs: 42 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "17:00",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "21:00",
          items: [
            { name: "Рыба", grams: "200 г", protein: 40, fat: 10, carbs: 0 },
            { name: "Овощи", grams: "250 г", protein: 2, fat: 0, carbs: 12 },
          ],
        },
      ],
      night: [
        {
          title: "Завтрак",
          time: "09:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "60 г", protein: 7, fat: 4, carbs: 36 },
          ],
        },
        {
          title: "Обед",
          time: "14:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Гречка", grams: "160 г готового продукта", protein: 5, fat: 2, carbs: 32 },
          ],
        },
        {
          title: "Ужин перед тренировкой",
          time: "20:00",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Приём пищи после тренировки",
          time: "00:30",
          items: [
            { name: "Протеиновый коктейль", grams: "1 порция", protein: 24, fat: 2, carbs: 3 },
            { name: "Йогурт без сахара", grams: "200 г", protein: 10, fat: 4, carbs: 8 },
          ],
        },
      ],
    },

    gain: {
      morning: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "5 шт", protein: 30, fat: 25, carbs: 2 },
            { name: "Овсянка", grams: "100 г", protein: 12, fat: 6, carbs: 60 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Говядина", grams: "220 г", protein: 48, fat: 14, carbs: 0 },
            { name: "Рис", grams: "220 г готового продукта", protein: 6, fat: 1, carbs: 60 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "16:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Хлеб цельнозерновой", grams: "100 г", protein: 8, fat: 2, carbs: 45 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "19:30",
          items: [
            { name: "Куриная грудка", grams: "220 г", protein: 50, fat: 5, carbs: 0 },
            { name: "Картофель", grams: "250 г", protein: 5, fat: 0, carbs: 50 },
            { name: "Салат", grams: "200 г", protein: 2, fat: 5, carbs: 10 },
          ],
        },
      ],
      day: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "5 шт", protein: 30, fat: 25, carbs: 2 },
            { name: "Овсянка", grams: "90 г", protein: 11, fat: 5, carbs: 54 },
          ],
        },
        {
          title: "Перекус перед тренировкой",
          time: "11:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Обед после тренировки",
          time: "14:30",
          items: [
            { name: "Говядина", grams: "220 г", protein: 48, fat: 14, carbs: 0 },
            { name: "Рис", grams: "250 г готового продукта", protein: 7, fat: 1, carbs: 68 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Ужин",
          time: "19:00",
          items: [
            { name: "Рыба", grams: "200 г", protein: 40, fat: 10, carbs: 0 },
            { name: "Картофель", grams: "220 г", protein: 4, fat: 0, carbs: 44 },
          ],
        },
      ],
      evening: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "5 шт", protein: 30, fat: 25, carbs: 2 },
            { name: "Овсянка", grams: "100 г", protein: 12, fat: 6, carbs: 60 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Куриная грудка", grams: "220 г", protein: 50, fat: 5, carbs: 0 },
            { name: "Рис", grams: "220 г готового продукта", protein: 6, fat: 1, carbs: 60 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "17:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
            { name: "Хлеб цельнозерновой", grams: "80 г", protein: 6, fat: 2, carbs: 36 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "21:00",
          items: [
            { name: "Говядина", grams: "220 г", protein: 48, fat: 14, carbs: 0 },
            { name: "Картофель", grams: "250 г", protein: 5, fat: 0, carbs: 50 },
          ],
        },
      ],
      night: [
        {
          title: "Завтрак",
          time: "09:00",
          items: [
            { name: "Яйца", grams: "5 шт", protein: 30, fat: 25, carbs: 2 },
            { name: "Овсянка", grams: "90 г", protein: 11, fat: 5, carbs: 54 },
          ],
        },
        {
          title: "Обед",
          time: "14:00",
          items: [
            { name: "Куриная грудка", grams: "220 г", protein: 50, fat: 5, carbs: 0 },
            { name: "Рис", grams: "220 г готового продукта", protein: 6, fat: 1, carbs: 60 },
          ],
        },
        {
          title: "Ужин перед тренировкой",
          time: "20:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
            { name: "Хлеб цельнозерновой", grams: "100 г", protein: 8, fat: 2, carbs: 45 },
          ],
        },
        {
          title: "Приём пищи после тренировки",
          time: "00:30",
          items: [
            { name: "Протеиновый коктейль", grams: "1 порция", protein: 24, fat: 2, carbs: 3 },
            { name: "Йогурт", grams: "250 г", protein: 12, fat: 4, carbs: 10 },
          ],
        },
      ],
    },

    maintain: {
      morning: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "80 г", protein: 9, fat: 5, carbs: 48 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Рис", grams: "180 г готового продукта", protein: 5, fat: 1, carbs: 50 },
            { name: "Овощи", grams: "200 г", protein: 2, fat: 0, carbs: 10 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "16:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "19:30",
          items: [
            { name: "Рыба", grams: "200 г", protein: 40, fat: 10, carbs: 0 },
            { name: "Гречка", grams: "180 г готового продукта", protein: 6, fat: 2, carbs: 36 },
          ],
        },
      ],
      day: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Омлет", grams: "4 яйца", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "70 г", protein: 8, fat: 4, carbs: 42 },
          ],
        },
        {
          title: "Перекус",
          time: "11:00",
          items: [
            { name: "Йогурт", grams: "200 г", protein: 10, fat: 4, carbs: 8 },
            { name: "Орехи", grams: "30 г", protein: 5, fat: 15, carbs: 5 },
          ],
        },
        {
          title: "Обед после тренировки",
          time: "14:30",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Рис", grams: "200 г готового продукта", protein: 5, fat: 1, carbs: 55 },
          ],
        },
        {
          title: "Ужин",
          time: "19:00",
          items: [
            { name: "Рыба", grams: "180 г", protein: 36, fat: 9, carbs: 0 },
            { name: "Салат", grams: "250 г", protein: 2, fat: 5, carbs: 10 },
          ],
        },
      ],
      evening: [
        {
          title: "Завтрак",
          time: "08:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "80 г", protein: 9, fat: 5, carbs: 48 },
          ],
        },
        {
          title: "Обед",
          time: "13:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Гречка", grams: "180 г готового продукта", protein: 6, fat: 2, carbs: 36 },
          ],
        },
        {
          title: "Приём пищи перед тренировкой",
          time: "17:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Ужин после тренировки",
          time: "21:00",
          items: [
            { name: "Рыба", grams: "200 г", protein: 40, fat: 10, carbs: 0 },
            { name: "Рис", grams: "180 г готового продукта", protein: 5, fat: 1, carbs: 50 },
          ],
        },
      ],
      night: [
        {
          title: "Завтрак",
          time: "09:00",
          items: [
            { name: "Яйца", grams: "4 шт", protein: 24, fat: 20, carbs: 2 },
            { name: "Овсянка", grams: "70 г", protein: 8, fat: 4, carbs: 42 },
          ],
        },
        {
          title: "Обед",
          time: "14:00",
          items: [
            { name: "Куриная грудка", grams: "200 г", protein: 46, fat: 4, carbs: 0 },
            { name: "Рис", grams: "180 г готового продукта", protein: 5, fat: 1, carbs: 50 },
          ],
        },
        {
          title: "Ужин перед тренировкой",
          time: "20:30",
          items: [
            { name: "Творог", grams: "200 г", protein: 32, fat: 10, carbs: 6 },
            { name: "Банан", grams: "1 шт", protein: 1, fat: 0, carbs: 25 },
          ],
        },
        {
          title: "Приём пищи после тренировки",
          time: "00:30",
          items: [
            { name: "Протеиновый коктейль", grams: "1 порция", protein: 24, fat: 2, carbs: 3 },
            { name: "Йогурт", grams: "200 г", protein: 10, fat: 4, carbs: 8 },
          ],
        },
      ],
    },
  };

  return templates[goal][trainingTime];
}

function buildWeeklyPlan(goal: GoalType, trainingTime: TrainingTimeType) {
  const dayPlan = buildDailyMeals(goal, trainingTime);

  return weekDays.map((day, index) => {
    if (goal === "gain") {
      if (index === 2 || index === 5) {
        return {
          day,
          meals: dayPlan.map((meal) => ({
            ...meal,
            items: meal.items.map((item) => {
              if (
                item.name.includes("Рис") ||
                item.name.includes("Овсянка") ||
                item.name.includes("Картофель") ||
                item.name.includes("Гречка")
              ) {
                return { ...item, grams: `${item.grams} (+ небольшая порция)` };
              }
              return item;
            }),
          })),
        };
      }
    }

    if (goal === "lose") {
      if (index === 1 || index === 4) {
        return {
          day,
          meals: dayPlan.map((meal) => ({
            ...meal,
            items: meal.items.map((item) => {
              if (
                item.name.includes("Рис") ||
                item.name.includes("Картофель") ||
                item.name.includes("Овсянка")
              ) {
                return { ...item, grams: `${item.grams} (чуть меньше обычного)` };
              }
              return item;
            }),
          })),
        };
      }
    }

    return { day, meals: dayPlan };
  });
}

function getSupplements(goal: GoalType, trainingTime: TrainingTimeType): SupplementItem[] {
  const common: SupplementItem[] = [
    {
      name: "Креатин",
      amount: "5 г",
      timing: "Каждый день",
      note:
        trainingTime === "morning"
          ? "Можно после завтрака или после тренировки."
          : "Можно до или после тренировки, главное принимать ежедневно.",
    },
    {
      name: "Омега-3",
      amount: "1000–2000 мг",
      timing: "Во время еды",
      note: "Лучше принимать с завтраком или обедом.",
    },
    {
      name: "Витамин D",
      amount: "2000 МЕ",
      timing: "Утром или днём",
      note: "Принимать вместе с приёмом пищи, где есть жиры.",
    },
  ];

  if (goal === "gain") {
    return [
      ...common,
      {
        name: "Сывороточный протеин",
        amount: "1 порция",
        timing: "После тренировки",
        note: "Подходит, если не добираете белок из обычной еды.",
      },
      {
        name: "Магний",
        amount: "300–400 мг",
        timing: "Перед сном",
        note: "Помогает расслаблению и восстановлению.",
      },
    ];
  }

  if (goal === "lose") {
    return [
      ...common,
      {
        name: "Протеин",
        amount: "1 порция",
        timing: "В удобное время",
        note: "Подходит как замена перекуса, если сложно набрать белок едой.",
      },
      {
        name: "Магний",
        amount: "300–400 мг",
        timing: "Перед сном",
        note: "Поддерживает сон и восстановление при дефиците калорий.",
      },
    ];
  }

  return [
    ...common,
    {
      name: "Магний",
      amount: "300–400 мг",
      timing: "Перед сном",
      note: "Подходит для качества сна и восстановления.",
    },
  ];
}

export default function NutritionPage() {
  const [weight, setWeight] = useState("77");
  const [height, setHeight] = useState("178");
  const [age, setAge] = useState("28");
  const [goal, setGoal] = useState<GoalType>("gain");
  const [trainingTime, setTrainingTime] = useState<TrainingTimeType>("evening");
  const [calculated, setCalculated] = useState(false);

  const numericWeight = Number(weight);
  const numericHeight = Number(height);
  const numericAge = Number(age);

  const bmr = 10 * numericWeight + 6.25 * numericHeight - 5 * numericAge + 5;
  const tdee = Math.round(bmr * 1.55);
  const calories = getCaloriesTarget(tdee, goal);
  const protein = getProteinTarget(numericWeight, goal);
  const fat = getFatTarget(numericWeight, calories, goal);
  const carbs = getCarbsTarget(calories, protein, fat);

  const macros = [
    {
      label: "Белки",
      value: protein,
      unit: "г",
      pct: Math.round((protein * 4 / calories) * 100),
      color: "bg-primary",
    },
    {
      label: "Жиры",
      value: fat,
      unit: "г",
      pct: Math.round((fat * 9 / calories) * 100),
      color: "bg-chart-emerald",
    },
    {
      label: "Углеводы",
      value: carbs,
      unit: "г",
      pct: Math.round((carbs * 4 / calories) * 100),
      color: "bg-chart-teal",
    },
  ];

  const dailyMeals = useMemo(() => buildDailyMeals(goal, trainingTime), [goal, trainingTime]);
  const weeklyPlan = useMemo(() => buildWeeklyPlan(goal, trainingTime), [goal, trainingTime]);
  const supplements = useMemo(() => getSupplements(goal, trainingTime), [goal, trainingTime]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Питание и БЖУ</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Рассчитайте калории, получите дневной рацион, недельный план и рекомендации по добавкам.
        </p>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Ваши данные
        </h2>

        <div className="grid sm:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Вес (кг)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Рост (см)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Возраст</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Цель</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="lose">Похудение</option>
              <option value="maintain">Поддержание формы</option>
              <option value="gain">Набор массы</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Когда тренируетесь</label>
            <select
              value={trainingTime}
              onChange={(e) => setTrainingTime(e.target.value as TrainingTimeType)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="morning">Утром</option>
              <option value="day">Днём</option>
              <option value="evening">Вечером</option>
              <option value="night">Ночью</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setCalculated(true)}
          className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          Рассчитать
        </button>
      </div>

      {calculated && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="glass-card p-5 text-center glow-green">
            <p className="text-sm text-muted-foreground">Суточная норма</p>
            <p className="text-4xl font-display font-bold text-gradient mt-1">{calories}</p>
            <p className="text-sm text-muted-foreground">ккал / день</p>
            <p className="text-xs text-muted-foreground mt-2">
              Цель: {getGoalTitle(goal)} · Тренировки: {getTrainingTimeLabel(trainingTime)}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {macros.map((macro, index) => (
              <motion.div
                key={macro.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{macro.label}</span>
                  <span className="text-xs text-muted-foreground">{macro.pct}%</span>
                </div>
                <p className="text-2xl font-display font-bold">
                  {macro.value}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    {macro.unit}
                  </span>
                </p>
                <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${macro.pct}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                    className={`h-full rounded-full ${macro.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Apple className="w-5 h-5 text-primary" />
              Дневной план питания
            </h3>

            <div className="space-y-4">
              {dailyMeals.map((meal, index) => {
                const totals = sumMealMacros(meal.items);

                return (
                  <motion.div
                    key={`${meal.title}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border border-border/60 bg-background/30 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="font-medium text-sm">{meal.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock3 className="w-3 h-3" />
                          {meal.time}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Б: {totals.protein} г · Ж: {totals.fat} г · У: {totals.carbs} г
                      </div>
                    </div>

                    <div className="space-y-2">
                      {meal.items.map((item, itemIndex) => (
                        <div
                          key={`${item.name}-${itemIndex}`}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">— {item.grams}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Б {item.protein} г · Ж {item.fat} г · У {item.carbs} г
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Общие рекомендации
            </h3>

            <div className="space-y-2 text-sm text-secondary-foreground">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Старайтесь распределять белок равномерно на 3–5 приёмов пищи в течение дня.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  Приём пищи перед тренировкой лучше делать за 1.5–2 часа до неё, если это обычная еда.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  После тренировки делайте акцент на белок и углеводы, особенно если цель — набор массы или восстановление.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Пейте минимум 2.5–3 литра воды в день.</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Добавки
            </h3>

            <div className="space-y-3">
              {supplements.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-xl border border-border/60 bg-background/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.amount}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Когда принимать: {item.timing}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-4">Недельный план питания</h3>

            <div className="space-y-4">
              {weeklyPlan.map((dayBlock) => (
                <div
                  key={dayBlock.day}
                  className="rounded-xl border border-border/60 bg-background/30 p-4"
                >
                  <p className="font-medium text-sm mb-3">{dayBlock.day}</p>

                  <div className="space-y-2">
                    {dayBlock.meals.map((meal, mealIndex) => (
                      <div key={`${dayBlock.day}-${meal.title}-${mealIndex}`} className="text-sm">
                        <span className="font-medium">{meal.title}:</span>{" "}
                        <span className="text-muted-foreground">
                          {meal.items.map((item) => `${item.name} (${item.grams})`).join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}