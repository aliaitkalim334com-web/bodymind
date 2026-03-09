import {
  Flame,
  Footprints,
  Timer,
  Moon,
  Dumbbell,
  Activity,
  Salad,
  CalendarDays,
  Target,
  TrendingUp,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import MotivationModal from "@/components/MotivationModal";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const weeklyActivityData = [
  { day: "Пн", caloriesBurned: 280, steps: 6500, sleep: 7.1 },
  { day: "Вт", caloriesBurned: 420, steps: 9100, sleep: 7.8 },
  { day: "Ср", caloriesBurned: 300, steps: 7200, sleep: 6.9 },
  { day: "Чт", caloriesBurned: 460, steps: 9800, sleep: 7.6 },
  { day: "Пт", caloriesBurned: 250, steps: 6100, sleep: 6.8 },
  { day: "Сб", caloriesBurned: 540, steps: 11200, sleep: 8.2 },
  { day: "Вс", caloriesBurned: 390, steps: 8700, sleep: 7.9 },
];

const weeklyWorkoutPlan = [
  { day: "Вторник", type: "Upper", status: "completed" },
  { day: "Четверг", type: "Lower", status: "completed" },
  { day: "Суббота", type: "Upper", status: "planned" },
];

const recentWorkouts = [
  {
    name: "Upper Body",
    duration: "1 ч 45 мин",
    calories: "420 ккал",
    date: "Сегодня",
    status: "Выполнено",
  },
  {
    name: "Lower Body",
    duration: "1 ч 30 мин",
    calories: "460 ккал",
    date: "Четверг",
    status: "Выполнено",
  },
  {
    name: "Upper Body",
    duration: "1 ч 35 мин",
    calories: "390 ккал",
    date: "Вторник",
    status: "Выполнено",
  },
];

const nutritionSummary = {
  calories: 2140,
  targetCalories: 2400,
  protein: 168,
  targetProtein: 180,
  carbs: 245,
  targetCarbs: 260,
  fat: 67,
  targetFat: 70,
};

const sleepSummary = {
  average: "7ч 33м",
  target: "8ч 00м",
  quality: "Хорошее",
  bedtime: "23:00",
  wakeTime: "07:00",
};

const todayPlan = {
  day: "Сегодня",
  workout: "Upper Body",
  workoutTime: "18:00",
  meals: "Завтрак, обед, предтренировочный перекус, ужин",
  sleep: "Сон в 23:00",
};

const completedWorkouts = weeklyWorkoutPlan.filter((w) => w.status === "completed").length;
const totalWorkouts = weeklyWorkoutPlan.length;
const workoutProgress = Math.round((completedWorkouts / totalWorkouts) * 100);

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <MotivationModal />

      <div>
        <h1 className="text-2xl font-display font-bold">Добро пожаловать 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Реальная сводка по тренировкам, сну, питанию и недельному плану
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          title="Калории"
          value={`${nutritionSummary.calories}`}
          subtitle={`из ${nutritionSummary.targetCalories} ккал`}
          trend="+6%"
          index={0}
        />
        <StatCard
          icon={Footprints}
          title="Шаги"
          value="8,700"
          subtitle="из 10,000 шагов"
          trend="+9%"
          index={1}
        />
        <StatCard
          icon={Timer}
          title="Тренировки"
          value={`${completedWorkouts}/${totalWorkouts}`}
          subtitle="выполнено за неделю"
          trend={`${workoutProgress}%`}
          index={2}
        />
        <StatCard
          icon={Moon}
          title="Сон"
          value={sleepSummary.average}
          subtitle={`Цель: ${sleepSummary.target}`}
          trend="+4%"
          index={3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 glow-green"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold">AI-рекомендации</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-secondary-foreground">
            У тебя 2 из 3 тренировок за неделю уже выполнены. Если в субботу сделаешь Upper Body, неделя будет закрыта по плану.
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-secondary-foreground">
            Белка набрано 168 г из 180 г. Добери ещё около 10–15 г белка в ужин или перекус.
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-sm text-secondary-foreground">
            Средний сон 7ч 33м — это неплохо, но для лучшего восстановления под силовые тренировки стоит приблизиться к 8 часам.
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            План на сегодня
          </h3>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="font-medium">Тренировка</p>
              <p className="text-muted-foreground mt-1">
                {todayPlan.workout} в {todayPlan.workoutTime}
              </p>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="font-medium">Питание</p>
              <p className="text-muted-foreground mt-1">{todayPlan.meals}</p>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <p className="font-medium">Сон</p>
              <p className="text-muted-foreground mt-1">{todayPlan.sleep}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Недельный план тренировок
          </h3>

          <div className="space-y-3">
            {weeklyWorkoutPlan.map((item, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 border ${
                  item.status === "completed"
                    ? "bg-primary/10 border-primary/30"
                    : "bg-secondary/30 border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {item.day} — {item.type}
                  </p>
                  <span
                    className={`text-xs ${
                      item.status === "completed"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.status === "completed" ? "Выполнено" : "Запланировано"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Salad className="w-5 h-5 text-primary" />
            Питание сегодня
          </h3>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg bg-secondary/30 p-3">
              <div className="flex justify-between">
                <span>Калории</span>
                <span className="font-medium">
                  {nutritionSummary.calories} / {nutritionSummary.targetCalories}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <div className="flex justify-between">
                <span>Белки</span>
                <span className="font-medium">
                  {nutritionSummary.protein} / {nutritionSummary.targetProtein} г
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <div className="flex justify-between">
                <span>Углеводы</span>
                <span className="font-medium">
                  {nutritionSummary.carbs} / {nutritionSummary.targetCarbs} г
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/30 p-3">
              <div className="flex justify-between">
                <span>Жиры</span>
                <span className="font-medium">
                  {nutritionSummary.fat} / {nutritionSummary.targetFat} г
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4">Активность за неделю</h3>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivityData}>
              <XAxis
                dataKey="day"
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(160 18% 9%)",
                  border: "1px solid hsl(160 12% 16%)",
                  borderRadius: "8px",
                  color: "hsl(140 10% 90%)",
                }}
              />
              <Bar dataKey="caloriesBurned" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4">Шаги за неделю</h3>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyActivityData}>
              <XAxis
                dataKey="day"
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(160 18% 9%)",
                  border: "1px solid hsl(160 12% 16%)",
                  borderRadius: "8px",
                  color: "hsl(140 10% 90%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="steps"
                stroke="hsl(152 60% 42%)"
                fill="hsl(152 60% 42% / 0.15)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Сон за неделю
          </h3>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyActivityData}>
              <CartesianGrid stroke="hsl(160 12% 16%)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(150 8% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[5, 9]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(160 18% 9%)",
                  border: "1px solid hsl(160 12% 16%)",
                  borderRadius: "8px",
                  color: "hsl(140 10% 90%)",
                }}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                stroke="hsl(152 60% 42%)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-primary" />
            Последние тренировки
          </h3>

          <div className="space-y-3">
            {recentWorkouts.map((w, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-secondary/30 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium text-sm">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.duration} · {w.calories}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">{w.date}</span>
                  <span className="text-xs text-primary">{w.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-5"
      >
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Общий статус недели
        </h3>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="text-muted-foreground mb-1">Тренировочный план</p>
            <p className="font-medium">{completedWorkouts} из {totalWorkouts} выполнено</p>
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="text-muted-foreground mb-1">Средний сон</p>
            <p className="font-medium">{sleepSummary.average}</p>
          </div>

          <div className="rounded-lg bg-secondary/30 p-4">
            <p className="text-muted-foreground mb-1">Питание</p>
            <p className="font-medium">БЖУ почти в норме</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}