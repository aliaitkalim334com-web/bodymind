import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Clock, RotateCcw, Zap, CalendarDays } from "lucide-react";

type ProgramName = "Full Body" | "Upper / Lower" | "Push Pull Legs" | "Сплит";
type LevelName = "Начинающий" | "Средний" | "Продвинутый";
type DurationName = "1 час" | "2 часа" | "3 часа";
type WeeklyFrequency = 3 | 4;

type Muscle =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "biceps"
  | "triceps";

interface BaseExercise {
  name: string;
  muscle: Muscle;
  technique: string;
}

interface Exercise extends BaseExercise {
  sets: number;
  reps: string;
  rest: string;
}

interface ProgramOption {
  name: ProgramName;
  description: string;
}

interface WeeklyWorkoutDay {
  dayKey: string;
  dayLabel: string;
  title: string;
  muscles: Muscle[];
  description: string;
  isTrainingDay: boolean;
}

const programs: ProgramOption[] = [
  {
    name: "Full Body",
    description:
      "Тренировка всего тела за одно занятие. Подходит новичкам, людям с ограниченным количеством тренировок в неделю и тем, кто хочет поддерживать общую физическую форму.",
  },
  {
    name: "Upper / Lower",
    description:
      "Программа делит тело на верх и низ. Верх — грудь, спина, руки. Низ — ноги и плечи. Хорошо подходит для 3–4 тренировок в неделю.",
  },
  {
    name: "Push Pull Legs",
    description:
      "Push — грудь, плечи, трицепс. Pull — спина, бицепс. Legs — ноги. Один из самых популярных форматов для среднего и продвинутого уровня.",
  },
  {
    name: "Сплит",
    description:
      "Каждая тренировка посвящена одной или двум мышечным группам. Такой формат подходит тем, кто хочет глубже прорабатывать мышцы.",
  },
];

const levels: LevelName[] = ["Начинающий", "Средний", "Продвинутый"];
const durations: DurationName[] = ["1 час", "2 часа", "3 часа"];

const exerciseDB: BaseExercise[] = [
  { name: "Жим штанги лёжа", muscle: "chest", technique: "Гриф на уровне глаз, лопатки сведены, грудь раскрыта." },
  { name: "Жим гантелей лёжа", muscle: "chest", technique: "Опускайте гантели подконтрольно." },
  { name: "Жим гантелей на наклонной скамье", muscle: "chest", technique: "Умеренный угол, без рывков." },
  { name: "Разводка гантелей лёжа", muscle: "chest", technique: "Локти слегка согнуты, движение плавное." },
  { name: "Сведения рук в кроссовере", muscle: "chest", technique: "Держите корпус устойчиво." },

  { name: "Подтягивания", muscle: "back", technique: "Тянитесь грудью к перекладине." },
  { name: "Тяга верхнего блока", muscle: "back", technique: "Тяните к верхней части груди." },
  { name: "Тяга штанги в наклоне", muscle: "back", technique: "Спина ровная." },
  { name: "Тяга горизонтального блока", muscle: "back", technique: "Лопатки сводите в конце движения." },
  { name: "Становая тяга", muscle: "back", technique: "Корпус напряжён, спина прямая." },

  { name: "Приседания со штангой", muscle: "legs", technique: "Колени идут по линии стоп." },
  { name: "Жим ногами", muscle: "legs", technique: "Колени не заваливаются внутрь." },
  { name: "Выпады с гантелями", muscle: "legs", technique: "Шаг устойчивый, корпус ровный." },
  { name: "Сгибание ног лёжа", muscle: "legs", technique: "Без рывков." },
  { name: "Подъём на носки стоя", muscle: "legs", technique: "Полная амплитуда." },

  { name: "Жим штанги стоя", muscle: "shoulders", technique: "Не прогибайте поясницу." },
  { name: "Жим гантелей сидя", muscle: "shoulders", technique: "Работайте подконтрольно." },
  { name: "Разведения гантелей в стороны", muscle: "shoulders", technique: "Поднимайте до уровня плеч." },
  { name: "Разведения в наклоне", muscle: "shoulders", technique: "Спина ровная." },
  { name: "Тяга штанги к подбородку", muscle: "shoulders", technique: "Без рывка." },

  { name: "Подъём штанги на бицепс", muscle: "biceps", technique: "Без раскачки корпуса." },
  { name: "Молотки с гантелями", muscle: "biceps", technique: "Нейтральный хват." },
  { name: "Подъём гантелей на бицепс сидя", muscle: "biceps", technique: "Локоть не уходит вперёд." },

  { name: "Разгибания рук на блоке", muscle: "triceps", technique: "Локти прижаты к корпусу." },
  { name: "Французский жим лёжа", muscle: "triceps", technique: "Локти стабильны." },
  { name: "Разгибание руки с гантелью из-за головы", muscle: "triceps", technique: "Без рывков." },
];

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function pickRandom<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, Math.min(count, array.length));
}

function getLevelConfig(level: LevelName) {
  switch (level) {
    case "Начинающий":
      return {
        sets: 3,
        reps: "10-12",
        rest: "2-3 мин",
        note: "Больше контроля, меньше объёма, длиннее отдых.",
      };
    case "Средний":
      return {
        sets: 4,
        reps: "8-10",
        rest: "90-120с",
        note: "Средний рабочий объём и хороший баланс нагрузки.",
      };
    case "Продвинутый":
      return {
        sets: 5,
        reps: "5-8",
        rest: "60-90с",
        note: "Больше объёма и интенсивности.",
      };
  }
}

function getExerciseCount(duration: DurationName) {
  if (duration === "1 час") return 4;
  if (duration === "2 часа") return 6;
  return 8;
}

function restDay(dayKey: string, dayLabel: string): WeeklyWorkoutDay {
  return {
    dayKey,
    dayLabel,
    title: "Восстановление",
    muscles: [],
    description: "День без тренировки. Акцент на сон, питание и восстановление.",
    isTrainingDay: false,
  };
}

function generateWeeklyTrainingPlan(
  program: ProgramName,
  frequency: WeeklyFrequency
): WeeklyWorkoutDay[] {
  if (program === "Upper / Lower") {
    if (frequency === 3) {
      return [
        restDay("mon", "Понедельник"),
        {
          dayKey: "tue",
          dayLabel: "Вторник",
          title: "Upper",
          muscles: ["chest", "back", "biceps", "triceps"],
          description: "Верх тела: грудь, спина, бицепс, трицепс.",
          isTrainingDay: true,
        },
        restDay("wed", "Среда"),
        {
          dayKey: "thu",
          dayLabel: "Четверг",
          title: "Lower",
          muscles: ["legs", "shoulders"],
          description: "Низ тела: ноги и плечи.",
          isTrainingDay: true,
        },
        restDay("fri", "Пятница"),
        {
          dayKey: "sat",
          dayLabel: "Суббота",
          title: "Upper",
          muscles: ["chest", "back", "biceps", "triceps"],
          description: "Повторная проработка верха тела.",
          isTrainingDay: true,
        },
        restDay("sun", "Воскресенье"),
      ];
    }

    return [
      restDay("mon", "Понедельник"),
      {
        dayKey: "tue",
        dayLabel: "Вторник",
        title: "Upper",
        muscles: ["chest", "back", "biceps", "triceps"],
        description: "Верх тела: грудь, спина, бицепс, трицепс.",
        isTrainingDay: true,
      },
      {
        dayKey: "wed",
        dayLabel: "Среда",
        title: "Lower",
        muscles: ["legs", "shoulders"],
        description: "Низ тела: ноги и плечи.",
        isTrainingDay: true,
      },
      restDay("thu", "Четверг"),
      restDay("fri", "Пятница"),
      {
        dayKey: "sat",
        dayLabel: "Суббота",
        title: "Upper",
        muscles: ["chest", "back", "biceps", "triceps"],
        description: "Повторная проработка верха тела.",
        isTrainingDay: true,
      },
      {
        dayKey: "sun",
        dayLabel: "Воскресенье",
        title: "Lower",
        muscles: ["legs", "shoulders"],
        description: "Повторная проработка низа тела.",
        isTrainingDay: true,
      },
    ];
  }

  if (program === "Push Pull Legs") {
    if (frequency === 3) {
      return [
        restDay("mon", "Понедельник"),
        {
          dayKey: "tue",
          dayLabel: "Вторник",
          title: "Push",
          muscles: ["chest", "shoulders", "triceps"],
          description: "Жимовой день: грудь, плечи, трицепс.",
          isTrainingDay: true,
        },
        restDay("wed", "Среда"),
        {
          dayKey: "thu",
          dayLabel: "Четверг",
          title: "Pull",
          muscles: ["back", "biceps"],
          description: "Тяговой день: спина и бицепс.",
          isTrainingDay: true,
        },
        restDay("fri", "Пятница"),
        {
          dayKey: "sat",
          dayLabel: "Суббота",
          title: "Legs",
          muscles: ["legs", "shoulders"],
          description: "Ноги и дополнительная работа на плечи.",
          isTrainingDay: true,
        },
        restDay("sun", "Воскресенье"),
      ];
    }

    return [
      restDay("mon", "Понедельник"),
      {
        dayKey: "tue",
        dayLabel: "Вторник",
        title: "Push",
        muscles: ["chest", "shoulders", "triceps"],
        description: "Жимовой день: грудь, плечи, трицепс.",
        isTrainingDay: true,
      },
      {
        dayKey: "wed",
        dayLabel: "Среда",
        title: "Pull",
        muscles: ["back", "biceps"],
        description: "Тяговой день: спина и бицепс.",
        isTrainingDay: true,
      },
      restDay("thu", "Четверг"),
      restDay("fri", "Пятница"),
      {
        dayKey: "sat",
        dayLabel: "Суббота",
        title: "Legs",
        muscles: ["legs", "shoulders"],
        description: "Ноги и дополнительная работа на плечи.",
        isTrainingDay: true,
      },
      {
        dayKey: "sun",
        dayLabel: "Воскресенье",
        title: "Push",
        muscles: ["chest", "shoulders", "triceps"],
        description: "Дополнительный жимовой день.",
        isTrainingDay: true,
      },
    ];
  }

  if (program === "Сплит") {
    if (frequency === 3) {
      return [
        restDay("mon", "Понедельник"),
        {
          dayKey: "tue",
          dayLabel: "Вторник",
          title: "Грудь + Трицепс",
          muscles: ["chest", "triceps"],
          description: "Глубокая проработка груди и трицепса.",
          isTrainingDay: true,
        },
        restDay("wed", "Среда"),
        {
          dayKey: "thu",
          dayLabel: "Четверг",
          title: "Спина + Бицепс",
          muscles: ["back", "biceps"],
          description: "День спины и бицепса.",
          isTrainingDay: true,
        },
        restDay("fri", "Пятница"),
        {
          dayKey: "sat",
          dayLabel: "Суббота",
          title: "Ноги + Плечи",
          muscles: ["legs", "shoulders"],
          description: "Ноги и плечи в одном дне.",
          isTrainingDay: true,
        },
        restDay("sun", "Воскресенье"),
      ];
    }

    return [
      restDay("mon", "Понедельник"),
      {
        dayKey: "tue",
        dayLabel: "Вторник",
        title: "Грудь + Трицепс",
        muscles: ["chest", "triceps"],
        description: "Глубокая проработка груди и трицепса.",
        isTrainingDay: true,
      },
      {
        dayKey: "wed",
        dayLabel: "Среда",
        title: "Спина + Бицепс",
        muscles: ["back", "biceps"],
        description: "День спины и бицепса.",
        isTrainingDay: true,
      },
      restDay("thu", "Четверг"),
      restDay("fri", "Пятница"),
      {
        dayKey: "sat",
        dayLabel: "Суббота",
        title: "Ноги",
        muscles: ["legs"],
        description: "Полноценная проработка ног.",
        isTrainingDay: true,
      },
      {
        dayKey: "sun",
        dayLabel: "Воскресенье",
        title: "Плечи + Руки",
        muscles: ["shoulders", "biceps", "triceps"],
        description: "Плечи и дополнительная работа на руки.",
        isTrainingDay: true,
      },
    ];
  }

  if (frequency === 3) {
    return [
      restDay("mon", "Понедельник"),
      {
        dayKey: "tue",
        dayLabel: "Вторник",
        title: "Full Body",
        muscles: ["chest", "back", "legs", "shoulders"],
        description: "Полноценная тренировка всего тела.",
        isTrainingDay: true,
      },
      restDay("wed", "Среда"),
      {
        dayKey: "thu",
        dayLabel: "Четверг",
        title: "Full Body",
        muscles: ["chest", "back", "legs", "shoulders"],
        description: "Вторая тренировка всего тела.",
        isTrainingDay: true,
      },
      restDay("fri", "Пятница"),
      {
        dayKey: "sat",
        dayLabel: "Суббота",
        title: "Full Body",
        muscles: ["chest", "back", "legs", "shoulders"],
        description: "Третья тренировка всего тела.",
        isTrainingDay: true,
      },
      restDay("sun", "Воскресенье"),
    ];
  }

  return [
    restDay("mon", "Понедельник"),
    {
      dayKey: "tue",
      dayLabel: "Вторник",
      title: "Full Body",
      muscles: ["chest", "back", "legs", "shoulders"],
      description: "Полноценная тренировка всего тела.",
      isTrainingDay: true,
    },
    {
      dayKey: "wed",
      dayLabel: "Среда",
      title: "Full Body",
      muscles: ["chest", "back", "legs", "shoulders"],
      description: "Вторая тренировка всего тела.",
      isTrainingDay: true,
    },
    restDay("thu", "Четверг"),
    restDay("fri", "Пятница"),
    {
      dayKey: "sat",
      dayLabel: "Суббота",
      title: "Full Body",
      muscles: ["chest", "back", "legs", "shoulders"],
      description: "Третья тренировка всего тела.",
      isTrainingDay: true,
    },
    {
      dayKey: "sun",
      dayLabel: "Воскресенье",
      title: "Full Body",
      muscles: ["chest", "back", "legs", "shoulders"],
      description: "Четвёртая тренировка всего тела.",
      isTrainingDay: true,
    },
  ];
}

function buildWorkoutForDay(
  muscles: Muscle[],
  level: LevelName,
  duration: DurationName
): Exercise[] {
  const levelConfig = getLevelConfig(level);
  const result: Exercise[] = [];
  const count = getExerciseCount(duration);

  const uniqueMuscles = [...new Set(muscles)];
  const perMuscleBase = Math.max(1, Math.floor(count / uniqueMuscles.length));
  let remaining = count;

  uniqueMuscles.forEach((muscle, index) => {
    const isLast = index === uniqueMuscles.length - 1;
    const takeCount = isLast ? remaining : Math.min(perMuscleBase, remaining);

    const pool = exerciseDB.filter((exercise) => exercise.muscle === muscle);
    const selected = pickRandom(pool, takeCount);

    selected.forEach((exercise) => {
      result.push({
        ...exercise,
        sets: levelConfig.sets,
        reps: levelConfig.reps,
        rest: levelConfig.rest,
      });
    });

    remaining -= selected.length;
  });

  if (result.length < count) {
    const extraPool = exerciseDB.filter((exercise) =>
      uniqueMuscles.includes(exercise.muscle)
    );

    const extra = pickRandom(
      extraPool.filter((exercise) => !result.some((r) => r.name === exercise.name)),
      count - result.length
    );

    extra.forEach((exercise) => {
      result.push({
        ...exercise,
        sets: levelConfig.sets,
        reps: levelConfig.reps,
        rest: levelConfig.rest,
      });
    });
  }

  return result;
}

export default function WorkoutsPage() {
  const [program, setProgram] = useState<ProgramName | "">("");
  const [level, setLevel] = useState<LevelName | "">("");
  const [duration, setDuration] = useState<DurationName | "">("");
  const [frequency, setFrequency] = useState<WeeklyFrequency>(3);
  const [selectedWeekDay, setSelectedWeekDay] = useState<string>("");
  const [plan, setPlan] = useState<Exercise[]>([]);
  const [opened, setOpened] = useState<number | null>(null);

  const selectedProgram = useMemo(
    () => programs.find((item) => item.name === program),
    [program]
  );

  const selectedLevelInfo = useMemo(
    () => (level ? getLevelConfig(level) : null),
    [level]
  );

  const weeklyPlan = useMemo(() => {
    if (!program) return [];
    return generateWeeklyTrainingPlan(program, frequency);
  }, [program, frequency]);

  const trainingDays = useMemo(
    () => weeklyPlan.filter((day) => day.isTrainingDay),
    [weeklyPlan]
  );

  function generateWorkout() {
    if (!program || !level || !duration) return;

    const targetDay =
      trainingDays.find((day) => day.dayKey === selectedWeekDay) || trainingDays[0];

    if (!targetDay) return;

    const generatedWorkout = buildWorkoutForDay(
      targetDay.muscles,
      level,
      duration
    );

    setOpened(null);
    setPlan(generatedWorkout);
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Генерация тренировки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите формат тренировок, уровень подготовки, длительность и недельный режим.
        </p>
      </div>

      <div className="glass-card p-4">
        <label className="text-sm mb-2 block">Программа тренировок</label>

        <div className="flex flex-wrap gap-2">
          {programs.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setProgram(item.name);
                setSelectedWeekDay("");
                setPlan([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                program === item.name
                  ? "bg-primary text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {selectedProgram && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">{selectedProgram.description}</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <label className="text-sm mb-2 block">Уровень</label>

          <div className="flex flex-wrap gap-2">
            {levels.map((item) => (
              <button
                key={item}
                onClick={() => setLevel(item)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  level === item
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {selectedLevelInfo && (
            <p className="text-xs text-muted-foreground mt-3">
              {selectedLevelInfo.note} Подходы: {selectedLevelInfo.sets}, повторения:{" "}
              {selectedLevelInfo.reps}, отдых: {selectedLevelInfo.rest}.
            </p>
          )}
        </div>

        <div className="glass-card p-4">
          <label className="text-sm mb-2 block">Длительность</label>

          <div className="flex flex-wrap gap-2">
            {durations.map((item) => (
              <button
                key={item}
                onClick={() => setDuration(item)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  duration === item
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {duration && (
            <p className="text-xs text-muted-foreground mt-3">
              {duration === "1 час" && "Короткая рабочая тренировка с базовым объёмом упражнений."}
              {duration === "2 часа" && "Стандартная полноценная тренировка с хорошим балансом объёма и восстановления."}
              {duration === "3 часа" && "Расширенная тренировка с большим количеством упражнений и глубокой проработкой мышц."}
            </p>
          )}
        </div>

        <div className="glass-card p-4">
          <label className="text-sm mb-2 block">Тренировок в неделю</label>

          <div className="flex flex-wrap gap-2">
            {[3, 4].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setFrequency(item as WeeklyFrequency);
                  setSelectedWeekDay("");
                  setPlan([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  frequency === item
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {item} раза
              </button>
            ))}
          </div>
        </div>
      </div>

      {program && (
        <div className="glass-card p-4">
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            Недельный план тренировок
          </h2>

          <div className="space-y-3">
            {weeklyPlan.map((day) => (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => {
                  if (day.isTrainingDay) {
                    setSelectedWeekDay(day.dayKey);
                    setPlan([]);
                  }
                }}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  day.isTrainingDay
                    ? selectedWeekDay === day.dayKey
                      ? "border-primary bg-primary/10"
                      : "border-primary/30 bg-primary/5 hover:bg-primary/10"
                    : "border-border/60 bg-background/30 cursor-default"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{day.dayLabel}</p>
                  <p className="text-xs text-muted-foreground">{day.title}</p>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  {day.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {trainingDays.length > 0 && (
        <div className="glass-card p-4">
          <label className="text-sm mb-2 block">Выберите тренировочный день</label>

          <div className="flex flex-wrap gap-2">
            {trainingDays.map((day) => (
              <button
                key={day.dayKey}
                onClick={() => {
                  setSelectedWeekDay(day.dayKey);
                  setPlan([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  selectedWeekDay === day.dayKey
                    ? "bg-primary text-white"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {day.dayLabel}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={generateWorkout}
        disabled={!program || !level || !duration || trainingDays.length === 0}
        className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Zap className="inline w-4 h-4 mr-2" />
        Сгенерировать тренировку
      </button>

      {plan.length > 0 && (
        <div className="space-y-3">
          <div className="glass-card p-4">
            <h2 className="font-semibold text-base mb-2">Параметры сгенерированной тренировки</h2>
            <p className="text-xs text-muted-foreground">
              Программа: <span className="text-foreground">{program}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Уровень: <span className="text-foreground">{level}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Длительность: <span className="text-foreground">{duration}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Частота: <span className="text-foreground">{frequency} тренировки в неделю</span>
            </p>
            {selectedWeekDay && (
              <p className="text-xs text-muted-foreground">
                День:{" "}
                <span className="text-foreground">
                  {weeklyPlan.find((d) => d.dayKey === selectedWeekDay)?.dayLabel ||
                    trainingDays[0]?.dayLabel}
                </span>
              </p>
            )}
            {selectedLevelInfo && (
              <p className="text-xs text-muted-foreground mt-2">
                Базовая схема: {selectedLevelInfo.sets} подходов, {selectedLevelInfo.reps} повторений, отдых {selectedLevelInfo.rest}.
              </p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {plan.map((exercise, index) => (
              <div
                key={`${exercise.name}-${index}`}
                onClick={() => setOpened(opened === index ? null : index)}
                className="glass-card p-4 cursor-pointer hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium">{exercise.name}</h3>
                </div>

                <div className="flex flex-wrap gap-4 text-xs mb-2">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    {exercise.sets} подходов
                  </span>

                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {exercise.reps} повторений
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exercise.rest} отдыха
                  </span>
                </div>

                {opened === index && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground mt-2"
                  >
                    {exercise.technique}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}