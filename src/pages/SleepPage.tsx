import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  TrendingUp,
  TrendingDown,
  Brain,
  AlarmClock,
  Dumbbell,
  Pill,
  GraduationCap,
  Briefcase,
  CalendarDays,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type GoalType = "recovery" | "fatloss" | "mass";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

interface DayConfig {
  key: DayKey;
  label: string;

  hasWork: boolean;
  workStart: string;
  workEnd: string;

  hasStudy: boolean;
  studyStart: string;
  studyEnd: string;

  hasTraining: boolean;
  trainingDurationHours: number;

  wakeUp: string;
}

interface WeeklyDayPlan {
  key: DayKey;
  day: string;
  modeLabel: string;
  sleepStart: string;
  wakeUp: string;
  training: string;
  note: string;
  sleepHours: number;
  quality: number;
  overloaded: boolean;
  timeConflict: boolean;
}

const dayOrder: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Понедельник" },
  { key: "tue", label: "Вторник" },
  { key: "wed", label: "Среда" },
  { key: "thu", label: "Четверг" },
  { key: "fri", label: "Пятница" },
  { key: "sat", label: "Суббота" },
  { key: "sun", label: "Воскресенье" },
];

function parseTimeToMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(totalMinutes: number) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function subtractMinutes(time: string, minutes: number) {
  return minutesToTime(parseTimeToMinutes(time) - minutes);
}

function addMinutes(time: string, minutes: number) {
  return minutesToTime(parseTimeToMinutes(time) + minutes);
}

function getGoalSleepHours(goal: GoalType) {
  if (goal === "mass") return 8.5;
  if (goal === "fatloss") return 7.5;
  return 8;
}

function createInitialDays(): DayConfig[] {
  return dayOrder.map((day) => ({
    key: day.key,
    label: day.label,

    hasWork: false,
    workStart: "09:00",
    workEnd: "18:00",

    hasStudy: false,
    studyStart: "08:00",
    studyEnd: "15:30",

    hasTraining: ["tue", "thu", "sat"].includes(day.key),
    trainingDurationHours: 2,

    wakeUp: day.key === "sat" || day.key === "sun" ? "08:00" : "07:00",
  }));
}

function getActiveCount(day: DayConfig) {
  return Number(day.hasWork) + Number(day.hasStudy) + Number(day.hasTraining);
}

function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
) {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);

  return aStart < bEnd && bStart < aEnd;
}

function getLatestBusyEnd(day: DayConfig) {
  const ends: string[] = [];
  if (day.hasWork) ends.push(day.workEnd);
  if (day.hasStudy) ends.push(day.studyEnd);

  if (ends.length === 0) return null;

  return ends.reduce((latest, current) =>
    parseTimeToMinutes(current) > parseTimeToMinutes(latest) ? current : latest
  );
}

function getModeLabelForDay(day: DayConfig) {
  const parts: string[] = [];

  if (day.hasWork) parts.push(`Работа ${day.workStart}–${day.workEnd}`);
  if (day.hasStudy) parts.push(`Учёба ${day.studyStart}–${day.studyEnd}`);
  if (day.hasTraining) parts.push(`Тренировка ${day.trainingDurationHours} ч`);

  if (parts.length === 0) return "Свободный день";

  return parts.join(" + ");
}

function buildTrainingTime(day: DayConfig) {
  if (!day.hasTraining) return "Нет тренировки";

  const busyEnd = getLatestBusyEnd(day);

  if (!busyEnd) {
    return addMinutes(day.wakeUp, 120);
  }

  return addMinutes(busyEnd, 90);
}

function estimateSleepQuality(
  goal: GoalType,
  day: DayConfig,
  sleepHours: number,
  overloaded: boolean,
  timeConflict: boolean
) {
  let score = 85;

  if (sleepHours < 7) score -= 12;
  if (sleepHours >= 8) score += 3;

  if (day.hasWork && day.hasStudy) score -= 8;
  if (day.hasTraining) score -= 2;

  if (overloaded) score -= 15;
  if (timeConflict) score -= 20;

  if (goal === "mass" && sleepHours < 8) score -= 5;

  return Math.max(50, Math.min(95, score));
}

function buildWeeklyPlan(goal: GoalType, days: DayConfig[]): WeeklyDayPlan[] {
  const targetSleep = getGoalSleepHours(goal);

  return days.map((day) => {
    const sleepStart = subtractMinutes(day.wakeUp, Math.round(targetSleep * 60));

    const timeConflict =
      day.hasWork &&
      day.hasStudy &&
      hasTimeOverlap(day.workStart, day.workEnd, day.studyStart, day.studyEnd);

    const overloaded =
      getActiveCount(day) >= 2 &&
      day.hasTraining &&
      ((day.hasWork && day.hasStudy) || timeConflict);

    let training = buildTrainingTime(day);

    if (timeConflict) {
      training = "День с конфликтом времени";
    } else if (overloaded) {
      training = "Перегруженный день";
    }

    let note = "Нормальный режим дня.";

    if (timeConflict) {
      note =
        "Работа и учёба пересекаются по времени. Нужно изменить часы, иначе такой день невозможен.";
    } else if (overloaded) {
      note =
        "День перегружен: одновременно слишком много нагрузки. Лучше убрать тренировку или перенести одну из активностей.";
    } else if (day.hasTraining) {
      note =
        "Тренировка поставлена в день, где она ещё укладывается в режим восстановления.";
    } else if (!day.hasWork && !day.hasStudy) {
      note = "Свободный день. Хорошо подходит для отдыха, прогулки или тренировки.";
    } else {
      note = "День без тренировки, основной акцент на сон и восстановление.";
    }

    const quality = estimateSleepQuality(goal, day, targetSleep, overloaded, timeConflict);

    return {
      key: day.key,
      day: day.label,
      modeLabel: getModeLabelForDay(day),
      sleepStart,
      wakeUp: day.wakeUp,
      training,
      note,
      sleepHours: targetSleep,
      quality,
      overloaded,
      timeConflict,
    };
  });
}

function getSupplementsForSleep(goal: GoalType) {
  const items = [
    {
      name: "Магний",
      dosage: "300–400 мг",
      timing: "за 30–60 минут до сна",
      note: "Базовая поддержка расслабления и вечернего режима.",
    },
    {
      name: "Омега-3",
      dosage: "1000–2000 мг",
      timing: "утром или днём",
      note: "Поддержка общего восстановления.",
    },
    {
      name: "Витамин D",
      dosage: "1000–2000 МЕ",
      timing: "утром",
      note: "Лучше принимать не поздно вечером.",
    },
  ];

  if (goal === "mass") {
    items.push({
      name: "Глицин",
      dosage: "3 г",
      timing: "перед сном",
      note: "Мягкая дополнительная поддержка сна.",
    });
  }

  return items;
}

export default function SleepPage() {
  const [goal, setGoal] = useState<GoalType>("recovery");
  const [days, setDays] = useState<DayConfig[]>(createInitialDays());

  const trainingCount = useMemo(
    () => days.filter((day) => day.hasTraining).length,
    [days]
  );

  function updateDay<K extends keyof DayConfig>(
    key: DayKey,
    field: K,
    value: DayConfig[K]
  ) {
    setDays((prev) =>
      prev.map((day) => {
        if (day.key !== key) return day;

        const nextDay = { ...day, [field]: value };

        return nextDay;
      })
    );
  }

  function toggleActivity(dayKey: DayKey, field: "hasWork" | "hasStudy" | "hasTraining") {
    setDays((prev) =>
      prev.map((day) => {
        if (day.key !== dayKey) return day;

        const currentValue = day[field];
        const nextValue = !currentValue;

        // если выключаем — всегда можно
        if (!nextValue) {
          return { ...day, [field]: false };
        }

        // ограничение: максимум 2 активности в день
        const currentCount = getActiveCount(day);
        if (currentCount >= 2) {
          return day;
        }

        // ограничение: максимум 4 тренировки в неделю
        if (field === "hasTraining") {
          const currentTrainingCount = prev.filter((d) => d.hasTraining).length;
          if (currentTrainingCount >= 4) {
            return day;
          }
        }

        return { ...day, [field]: true };
      })
    );
  }

  const weeklyPlan = useMemo(() => buildWeeklyPlan(goal, days), [goal, days]);

  const sleepData = weeklyPlan.map((item) => ({
    day: item.day.slice(0, 2),
    hours: item.sleepHours,
    quality: item.quality,
  }));

  const avg = (
    sleepData.reduce((sum, item) => sum + item.hours, 0) / sleepData.length
  ).toFixed(1);

  const best = sleepData.reduce((a, b) => (a.quality > b.quality ? a : b));
  const worst = sleepData.reduce((a, b) => (a.quality < b.quality ? a : b));

  const supplements = useMemo(() => getSupplementsForSleep(goal), [goal]);

  const qualityTrend = sleepData.map((item) => ({
    day: item.day,
    quality: item.quality,
  }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display font-bold">
          Анализ сна и режима восстановления
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Настройте каждый день отдельно. В одном дне можно выбрать максимум две активности: работа, учёба или тренировка.
        </p>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Общие параметры
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Цель</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as GoalType)}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="recovery">Восстановление и здоровье</option>
              <option value="fatloss">Снижение веса</option>
              <option value="mass">Набор массы</option>
            </select>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/30 p-4 text-sm">
            <p className="text-muted-foreground mb-1">Тренировок в неделю</p>
            <p className="font-medium">{trainingCount} / 4</p>
            <p className="text-xs text-muted-foreground mt-2">
              Рекомендуемый диапазон: 3–4 тренировки в неделю.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Настройка по дням
        </h2>

        <div className="space-y-4">
          {days.map((day) => {
            const activeCount = getActiveCount(day);
            const disableNewChoice = activeCount >= 2;

            return (
              <div
                key={day.key}
                className="rounded-xl border border-border/60 bg-background/30 p-4"
              >
                <p className="font-medium text-sm mb-4">{day.label}</p>

                <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Работа</p>
                    </div>

                    <label className="flex items-center gap-2 text-xs mb-3">
                      <input
                        type="checkbox"
                        checked={day.hasWork}
                        disabled={!day.hasWork && disableNewChoice}
                        onChange={() => toggleActivity(day.key, "hasWork")}
                      />
                      Есть работа в этот день
                    </label>

                    {day.hasWork && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Начало работы
                          </label>
                          <input
                            type="time"
                            value={day.workStart}
                            onChange={(e) =>
                              updateDay(day.key, "workStart", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Конец работы
                          </label>
                          <input
                            type="time"
                            value={day.workEnd}
                            onChange={(e) =>
                              updateDay(day.key, "workEnd", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Учёба</p>
                    </div>

                    <label className="flex items-center gap-2 text-xs mb-3">
                      <input
                        type="checkbox"
                        checked={day.hasStudy}
                        disabled={!day.hasStudy && disableNewChoice}
                        onChange={() => toggleActivity(day.key, "hasStudy")}
                      />
                      Есть учёба в этот день
                    </label>

                    {day.hasStudy && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Начало учёбы
                          </label>
                          <input
                            type="time"
                            value={day.studyStart}
                            onChange={(e) =>
                              updateDay(day.key, "studyStart", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Конец учёбы
                          </label>
                          <input
                            type="time"
                            value={day.studyEnd}
                            onChange={(e) =>
                              updateDay(day.key, "studyEnd", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Тренировка</p>
                    </div>

                    <label className="flex items-center gap-2 text-xs mb-3">
                      <input
                        type="checkbox"
                        checked={day.hasTraining}
                        disabled={
                          (!day.hasTraining && disableNewChoice) ||
                          (!day.hasTraining && trainingCount >= 4)
                        }
                        onChange={() => toggleActivity(day.key, "hasTraining")}
                      />
                      Тренировка в этот день
                    </label>

                    {day.hasTraining && (
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Длительность
                        </label>
                        <select
                          value={day.trainingDurationHours}
                          onChange={(e) =>
                            updateDay(day.key, "trainingDurationHours", Number(e.target.value))
                          }
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                        >
                          <option value={1}>1 час</option>
                          <option value={2}>2 часа</option>
                          <option value={3}>3 часа</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <AlarmClock className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Сон</p>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        Подъём
                      </label>
                      <input
                        type="time"
                        value={day.wakeUp}
                        onChange={(e) =>
                          updateDay(day.key, "wakeUp", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                      />
                    </div>
                  </div>
                </div>

                {activeCount >= 2 && (
                  <p className="text-xs text-amber-400 mt-3">
                    В этом дне уже выбрано максимум 2 активности.
                  </p>
                )}

                {day.hasWork &&
                  day.hasStudy &&
                  hasTimeOverlap(day.workStart, day.workEnd, day.studyStart, day.studyEnd) && (
                    <p className="text-xs text-red-400 mt-2">
                      Ошибка: работа и учёба пересекаются по времени.
                    </p>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 text-center">
          <Moon className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold">{avg}</p>
          <p className="text-sm text-muted-foreground">ч. сна в среднем</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5 text-center">
          <AlarmClock className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold">{weeklyPlan[0]?.sleepStart}</p>
          <p className="text-sm text-muted-foreground">пример времени сна</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 text-center">
          <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-display font-bold">{best.day}</p>
          <p className="text-sm text-muted-foreground">
            лучший день ({best.hours.toFixed(1)}ч, {best.quality}%)
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 text-center">
          <TrendingDown className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-3xl font-display font-bold">{worst.day}</p>
          <p className="text-sm text-muted-foreground">
            худший день ({worst.hours.toFixed(1)}ч, {worst.quality}%)
          </p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Недельный график сна</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sleepData}>
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
                domain={[0, 10]}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(160 18% 9%)",
                  border: "1px solid hsl(160 12% 16%)",
                  borderRadius: "8px",
                  color: "hsl(140 10% 90%)",
                }}
              />
              <Bar dataKey="hours" fill="hsl(152 60% 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4">Качество сна по неделе</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={qualityTrend}>
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
                domain={[40, 100]}
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
                dataKey="quality"
                stroke="hsl(152 60% 42%)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Логика режима
        </h3>

        <div className="space-y-3 text-sm text-secondary-foreground">
          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              В одном дне можно выбрать максимум две активности: работа, учёба или тренировка.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              Тренировок в неделю можно выбрать максимум четыре, оптимально — три или четыре.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>
              Если работа и учёба пересекаются по времени, день считается некорректным.
            </span>
          </div>
        </div>
      </motion.div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Pill className="w-5 h-5 text-primary" />
          Добавки для сна и восстановления
        </h3>

        <div className="space-y-3">
          {supplements.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="rounded-xl border border-border/60 bg-background/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.dosage}</p>
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
        <h3 className="font-display font-semibold mb-4">
          Недельный режим сна и восстановления
        </h3>

        <div className="space-y-3">
          {weeklyPlan.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border p-4 ${
                item.timeConflict
                  ? "border-red-500/40 bg-red-500/5"
                  : item.overloaded
                  ? "border-amber-500/40 bg-amber-500/5"
                  : "border-border/60 bg-background/30"
              }`}
            >
              <p className="font-medium text-sm mb-2">{item.day}</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                <p className="text-muted-foreground">
                  Режим дня: <span className="text-foreground">{item.modeLabel}</span>
                </p>
                <p className="text-muted-foreground">
                  Сон: <span className="text-foreground">{item.sleepStart}</span>
                </p>
                <p className="text-muted-foreground">
                  Подъём: <span className="text-foreground">{item.wakeUp}</span>
                </p>
                <p className="text-muted-foreground">
                  Тренировка: <span className="text-foreground">{item.training}</span>
                </p>
              </div>

              <p className="text-xs text-muted-foreground mt-3">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}