import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Search, Sparkles, ChevronDown, ChevronUp, AlertTriangle, Info, Lightbulb } from "lucide-react";

/* ═══════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════ */

type Tag = "violation" | "important" | "tip" | "mechanic";

interface Term {
  id: string;
  term: string;
  alias?: string;
  shortDesc: string;
  fullDesc: string;
  example?: string;
  badExample?: string;
  goodExample?: string;
  punishment?: string;
  category: string;
  tag?: Tag;
}

/* ═══════════════════════════════════════════════
   GLOSSARY DATA — Majestic RP / СНГ стиль
   ═══════════════════════════════════════════════ */

const TERMS: Term[] = [

  /* ──────────────── НАРУШЕНИЯ ──────────────── */

  {
    id: "n1",
    category: "Нарушения",
    tag: "violation",
    term: "DM / Дематч",
    alias: "Deathmatch",
    shortDesc: "Убийство или нападение на игрока без ролевого основания.",
    fullDesc:
      "DM — самое частое нарушение на серверах. Ты не можешь атаковать или убивать другого игрока просто потому, что хочешь. Любое насилие должно иметь предысторию в рамках РП: конфликт, долг, приказ, ситуативная причина. Если между вами ничего не было — это DM.",
    badExample: "Едешь по городу, видишь незнакомца — стреляешь. Никаких слов, никакой истории. Чистый DM.",
    goodExample: "Этот персонаж неделю назад ограбил твоего напарника, ты опознал его и устраиваешь разговор — вот это уже РП с основанием.",
    punishment: "Предупреждение / временный бан в зависимости от ситуации.",
  },
  {
    id: "n2",
    category: "Нарушения",
    tag: "violation",
    term: "VDM",
    alias: "Vehicle Deathmatch",
    shortDesc: "Намеренный наезд транспортом на людей без РП-причины.",
    fullDesc:
      "VDM — то же самое что DM, только с машиной в роли оружия. Специально давить людей без ролевого контекста запрещено. Случайный наезд при преследовании — другая история, но если ты целенаправленно едешь на пешеходов или стоящих игроков — это нарушение.",
    badExample: "Подъехал, переехал стоящего у магазина персонажа, уехал. VDM.",
    punishment: "Предупреждение / бан.",
  },
  {
    id: "n3",
    category: "Нарушения",
    tag: "violation",
    term: "Провал РП / ФРП",
    alias: "Fail RP",
    shortDesc: "Поведение, которое нарушает логику ролевого отыгрыша.",
    fullDesc:
      "Провал РП — когда твои действия или слова не вписываются в реальную логику ситуации. Примеры: убегать от вооружённых людей когда тебе угрожают — нереально. Звонить кому-то когда тебя держат под прицелом — нереально. Прыгать с крыши чтобы сбежать от ареста — нереально. Реши сам: сделал бы это живой человек в реальной ситуации?",
    badExample: "Тебя остановили трое с оружием, попросили лечь — ты побежал. Или: тебя держат в заложниках и ты тихо пишешь в телефоне координаты.",
    goodExample: "Тебя остановили, ты оцениваешь ситуацию, понимаешь что сил нет — подчиняешься. Это реально.",
    punishment: "Предупреждение, в зависимости от систематичности — бан.",
  },
  {
    id: "n4",
    category: "Нарушения",
    tag: "violation",
    term: "Мета / Метаигра",
    alias: "Metagaming",
    shortDesc: "Использование информации из Discord, стримов или чата в игре как IC-знания.",
    fullDesc:
      "Мета — одно из главных нарушений. Твой персонаж знает только то, что узнал внутри игры. Если ты в Дискорде увидел где спрятаны враги, где будет встреча или чей номер машины — в игре этой информации у твоего персонажа нет. Точка. Смотришь стрим — не едешь на место событий. Написали в общем чате — твой персонаж этого не слышал.",
    badExample: "В Discord кто-то написал 'мы на складе в промке' — ты заехал туда в игре как будто знаешь. Мета.",
    goodExample: "Ты лично слышал в игре по рации или видел своим персонажем — можешь использовать.",
    punishment: "Предупреждение / временный бан.",
  },
  {
    id: "n5",
    category: "Нарушения",
    tag: "violation",
    term: "Пауэргейм",
    alias: "Powergaming",
    shortDesc: "Навязывание другому игроку действий без его согласия или нереалистичные описания.",
    fullDesc:
      "Пауэргейм — когда ты через /me или слова вынуждаешь чужого персонажа что-то сделать, не оставляя выбора. Или описываешь физически невозможные действия. У каждого игрока есть право на ответный /me и право отыгрыша. Нельзя одним действием разоружить, связать и вырубить человека.",
    badExample: "/me хватает противника за шею, ломает руку, связывает и бросает в машину — и всё это в одном /me без шанса на ответ.",
    goodExample: "/me пытается схватить за запястье — потом ждёшь ответного действия персонажа.",
  },
  {
    id: "n6",
    category: "Нарушения",
    tag: "violation",
    term: "Комбат-лог",
    alias: "Combat Log",
    shortDesc: "Выход из игры во время активной РП-ситуации чтобы её избежать.",
    fullDesc:
      "Выходить из игры во время ограбления, захвата, перестрелки или ар��ста — запрещено. Это обнуляет ситуацию для другой стороны и считается нечестным уходом. Если интернет реально отвалился — объяснись через Discord. Намеренный выход — серьёзное нарушение.",
    badExample: "Тебя остановили полицейские, начали обыск — ты вышел из игры. Комбат-лог.",
    punishment: "Бан от нескольких часов до нескольких суток.",
  },
  {
    id: "n7",
    category: "Нарушения",
    tag: "violation",
    term: "ООС (выход из роли)",
    alias: "OOC в RP-ситуации",
    shortDesc: "Разговор вне роли прямо в RP-сцене без крайней необходимости.",
    fullDesc:
      "Если ты начинаешь в разгар ситуации разговаривать как игрок, а не персонаж — это портит отыгрыш для всех. «Слышь, ну ты чё, у меня лаг» во время допроса — ООС. Для технических вопросов используй /b или уведомление в Discord. В крайнем случае — /b с пометкой что это OOC.",
  },
  {
    id: "n8",
    category: "Нарушения",
    tag: "violation",
    term: "Гриф / Гриферство",
    shortDesc: "Целенаправленное уничтожение чужого имущества или RP-опыта без смысла.",
    fullDesc:
      "Гриферство — когда человек систематически мешает другим играть: сносит машины, взрывает без причин, ломает ивенты. Отличается от обычного PvP тем, что цели — не сюжет и не конфликт, а просто испортить другим вечер.",
    punishment: "Бан, часто без предупреждения при явном гриферстве.",
  },
  {
    id: "n9",
    category: "Нарушения",
    tag: "violation",
    term: "Стрим-снайп",
    shortDesc: "Использование трансляции другого игрока для получения его IC-местоположения.",
    fullDesc:
      "Смотришь стрим — видишь где находится персонаж — едешь туда в игре. Это и метаигра и стрим-снайп одновременно. Запрещено категорически. Серьёзно портит стримерам опыт и разрушает RP для всей ситуации.",
    punishment: "Бан.",
  },
  {
    id: "n10",
    category: "Нарушения",
    tag: "violation",
    term: "Баг-абьюз",
    alias: "Bug Abuse",
    shortDesc: "Намеренное использование игровых ошибок и багов для получения преимущества.",
    fullDesc:
      "Если ты нашёл баг — сообщи в техподдержку. Использовать его в свою пользу (дюпать предметы, проходить сквозь стены, телепортироваться через меню) — нарушение. Незнание не освобождает: если понимаешь что это баг — не используй.",
    punishment: "Бан, возможна откатка персонажа.",
  },

  /* ──────────────── IC / ООС ──────────────── */

  {
    id: "b1",
    category: "IC и ООС",
    tag: "important",
    term: "IC",
    alias: "In Character / В роли",
    shortDesc: "Всё, что происходит от лица твоего персонажа внутри игры.",
    fullDesc:
      "IC — это твой персонаж, его жизнь, его знания, его действия. Когда ты говоришь в микрофон в игре — это IC. Когда описываешь действие через /me — IC. Что важно: персонаж знает только то, что узнал сам. Он не читал Discord, не смотрел стримы, не слышал разговоры за пределами игры.",
    goodExample: "«Мой персонаж не знает этого человека, даже если мы лично знакомы вне игры» — правильный IC-подход.",
  },
  {
    id: "b2",
    category: "IC и ООС",
    tag: "important",
    term: "ООС / OOC",
    alias: "Out of Character / Вне роли",
    shortDesc: "Общение игроков между собой вне ролевого контекста.",
    fullDesc:
      "OOC — всё что ты говоришь как игрок, а не персонаж. Техничка, вопросы по правилам, жалобы — всё OOC. Главное правило: IC и OOC не смешиваются. Ты не можешь обидеться IC на то, что тебе сказали OOC, и наоборот — OOC обиды не переносятся в игру.",
    goodExample: "/b — это OOC-чат в игре. Используй его только для критических технических вещей, не для оправданий посреди ситуации.",
  },
  {
    id: "b3",
    category: "IC и ООС",
    tag: "important",
    term: "CK",
    alias: "Character Kill / Полная смерть",
    shortDesc: "Перманентная гибель персонажа — он уходит из игры навсегда.",
    fullDesc:
      "CK — это не просто смерть с больничкой. Это конец истории персонажа. После CK этот персонаж больше не существует: нельзя «воскреснуть», нельзя играть им снова. На Маджестике CK устанавливается администрацией в особых случаях или выдаётся по согласию сторон в рамках РП-сюжета. Обычная смерть — это не CK.",
    goodExample: "Договорились с противоборствующей группой на финальную разборку с условием CK проигравшей стороны — это сценарный CK по согласию.",
  },
  {
    id: "b4",
    category: "IC и ООС",
    tag: "important",
    term: "PK / Больничка",
    alias: "Player Kill / Смерть без потери персонажа",
    shortDesc: "Обычная смерть в игре — персонаж выживает, но теряет память о ситуации.",
    fullDesc:
      "После PK твой персонаж очнулся в больнице. Он не помнит кто его убил, как это произошло и где. Нельзя использовать эту память для мести, нельзя рассказывать друзьям. Это не значит что ты обязан вечно не знать убийцу — просто нужна IC-причина чтобы это выяснить заново.",
    badExample: "Убили → встал из больнички → сразу позвонил другу «слышь, меня только что Петров пристрелил на Гроув» — нарушение NLR и PK-правил.",
  },
  {
    id: "b5",
    category: "IC и ООС",
    tag: "important",
    term: "NLR",
    alias: "New Life Rule",
    shortDesc: "После смерти — нельзя возвращаться на место гибели и мстить за неё.",
    fullDesc:
      "NLR — правило новой жизни. После того как тебя убили, твой персонаж начинает с чистого листа в этой ситуации. Запрещено: возвращаться на место смерти пока ситуация не завершилась, мстить тем кто убил, использовать знания о том что там происходит. Время действия NLR обычно прописано в правилах сервера — как правило 15-30 минут или до конца ситуации.",
  },

  /* ──────────────── RP МЕХАНИКИ ──────────────── */

  {
    id: "m1",
    category: "РП Механики",
    tag: "mechanic",
    term: "/me",
    shortDesc: "Описание действия твоего персонажа — то, что видят другие.",
    fullDesc:
      "Команда /me описывает физические действия персонажа которые нельзя показать геймплейно. Пишется в третьем лице, без оценок, просто факт действия. Другие игроки вокруг это видят. Оппонент должен получить шанс ответить своим /me прежде чем действие «случилось».",
    goodExample: "/me медленно достаёт портмоне двумя пальцами и кладёт на капот.",
    badExample: "/me моментально выхватывает пистолет и нейтрализует троих — без шанса на ответ. Это пауэргейм.",
  },
  {
    id: "m2",
    category: "РП Механики",
    tag: "mechanic",
    term: "/do",
    shortDesc: "Описание окружения или факта, который другие персонажи могут воспринять.",
    fullDesc:
      "Команда /do описывает что-то объективное в сцене: запах, свет, состояние предмета, погода, деталь обстановки. Пишется не от лица персонажа а от «нарратора». Используется чтобы обогатить сцену деталями которые нельзя показать механически.",
    goodExample: "/do На столе лежит сломанный телефон с выбитым экраном. Запах горелого в воздухе.",
  },
  {
    id: "m3",
    category: "РП Механики",
    tag: "mechanic",
    term: "/b",
    shortDesc: "OOC-сообщение прямо в игре, видно всем рядом стоящим.",
    fullDesc:
      "Команда /b позволяет написать что-то как игрок, не персонаж. Используй только для реально срочных технических вещей во время ситуации: «/b у меня слетело управление». Не используй /b для оправданий, обсуждения правил или выражения обиды посреди сцены.",
  },
  {
    id: "m4",
    category: "РП Механики",
    tag: "mechanic",
    term: "Захват / Kidnap",
    shortDesc: "IC-похищение персонажа — требует согласия на долгий отыгрыш.",
    fullDesc:
      "Захват — ситуация когда персонажа берут в плен. Требует реальной РП-причины, соблюдения правил угрозы (сначала требование, потом применение силы). Удерживать кого-то долго без отыгрыша — запрещено. На Маджестике обычно прописан максимальный лимит удержания. Захваченный должен получить реальный отыгрыш, а не сидеть в подвале и ждать.",
    goodExample: "Задолжал деньги группировке, тебя перехватили, везут на разговор — всё через /me, с диалогом, с конкретной целью.",
  },
  {
    id: "m5",
    category: "РП Механики",
    tag: "mechanic",
    term: "Угроза / KOS",
    alias: "Kill on Sight",
    shortDesc: "Предупреждение перед применением силы — обязательно в большинстве ситуаций.",
    fullDesc:
      "Перед тем как стрелять или бить — нужно дать персонажу шанс. Это называется угроза или предупреждение. KOS (убить при виде) — это когда у тебя есть конкретный приказ или веская IC-причина атаковать без слов. Например: этот человек только что застрелил твоего напарника у тебя на глазах. Просто «он мне не нравится» — не KOS.",
  },
  {
    id: "m6",
    category: "РП Механики",
    tag: "mechanic",
    term: "Эскалация конфликта",
    shortDesc: "Конфликт должен развиваться постепенно — от слов к действиям.",
    fullDesc:
      "Нельзя начинать с выстрелов. Реальный конфликт нарастает: слова → угрозы → физический контакт → оружие. Пропускать ступени — провал РП. Даже если ты злишься IC — дай другому шанс отреагировать на каждом этапе. Это делает RP живым.",
    goodExample: "«Ты должен мне деньги» → «Последний раз говорю» → достаёт оружие → выстрел — логичная эскалация.",
    badExample: "Подъехал, без слова достал пушку и выстрелил потому что «между нами война» — провал РП.",
  },
  {
    id: "m7",
    category: "РП Механики",
    tag: "tip",
    term: "Маска / Анонимность",
    shortDesc: "Маска скрывает IC-личность персонажа во время преступлений.",
    fullDesc:
      "Надел маску — другие персонажи не могут IC опознать тебя по лицу. Но: голос остаётся твоим, особые приметы (татуировки, одежда, машина) могут быть замечены. Маска не делает тебя невидимым для камер и свидетелей — она лишь убирает IC-опознание по лицу. Частая ошибка: снять маску перед знакомыми думая что они тебя уже знают — но их персонажи могут IC этого не знать.",
  },

  /* ──────────────── СТРУКТУРА СЕРВЕРА ──────────────── */

  {
    id: "s1",
    category: "Структура сервера",
    tag: "important",
    term: "Государственные фракции",
    alias: "Госы / LEO",
    shortDesc: "Полиция, шериф, FIB, медики, правительство — легальная сторона сервера.",
    fullDesc:
      "На Маджестике госфракции — это LSPD (полиция Лос-Сантоса), LSSD (шериф округа), FIB (федеральный следственный комитет), EMS (медики), Правительство. Игра за госа предполагает соблюдение законов сервера IC: нельзя брать взятки без РП, нельзя «крышевать» крими без RP-обоснования. Schwarz Family держала лидерки в LSPD, LSSD и FIB.",
  },
  {
    id: "s2",
    category: "Структура сервера",
    tag: "important",
    term: "Лидерка",
    shortDesc: "Должность лидера фракции — высшее IC-звание в рамках организации.",
    fullDesc:
      "Лидер фракции на Маджестике — это реальная должность с реальной ответственностью. Лидер набирает состав, устанавливает внутренние правила, отвечает за активность и репутацию. Получить лидерку сложно — нужна хорошая история персонажа, активность и одобрение администрации. Schwarz Family неоднократно брала лидерки FIB I, FIB II, LSSD, LSPD.",
  },
  {
    id: "s3",
    category: "Структура сервера",
    tag: "mechanic",
    term: "Криминальные группировки",
    alias: "Крими / Нелегалы",
    shortDesc: "Неофициальные или официальные преступные организации на сервере.",
    fullDesc:
      "Криминальная сторона сервера — группировки, семьи, картели, банды. Официальные крими-фракции имеют статус, локации и внутренние правила. Неофициальные — просто компании людей без статуса фракции. Schwarz Family — криминальная семья. Крими живёт по своим правилам, но правила сервера над всем.",
  },
  {
    id: "s4",
    category: "Структура сервера",
    tag: "mechanic",
    term: "EMS / Медики",
    shortDesc: "Медицинская фракция — поднимают раненых и дают шанс обойти больничку.",
    fullDesc:
      "EMS — Emergency Medical Services. Когда тебя «убили», ты лежишь и ждёшь. Если приедет EMS и отыграет медпомощь — тебя могут поднять без NLR и без больничного штрафа. Это не обязательство медиков — это добровольный RP. Если медиков нет и ты в луже — либо зовёшь их IC, либо ждёшь и едешь в больницу.",
  },
  {
    id: "s5",
    category: "Структура сервера",
    tag: "tip",
    term: "Прайм-тайм",
    shortDesc: "Вечерние часы — пик онлайна, самые живые события на сервере.",
    fullDesc:
      "Прайм-тайм на Маджестике — обычно 19:00–00:00 МСК. В это время максимум игроков, проходят ивенты, стрелки, встречи фракций. Если хочешь живого RP — играй в прайм. Днём сервер тоже работает но активность заметно ниже.",
  },

  /* ──────────────── КРИМИ-СЛОВАРЬ ──────────────── */

  {
    id: "c1",
    category: "Крими-словарь",
    tag: "mechanic",
    term: "Стрелочка / Перестрелка",
    shortDesc: "IC-вооружённый конфликт между группировками с ролевым основанием.",
    fullDesc:
      "Стрелочка — это не просто пострелять. Это организованный конфликт между группами с историей, причиной и последствиями. Требует предварительной IC-эскалации: провокации, нарушения договорённостей, объявления войны. Начать стрелку «просто так» — DM.",
  },
  {
    id: "c2",
    category: "Крими-словарь",
    tag: "mechanic",
    term: "Точка / Варка",
    shortDesc: "IC-локация для нелегального производства или торговли.",
    fullDesc:
      "«Варить» — производить запрещённые вещества. «Точка» — место сбыта или производства. В рамках крими-экономики Маджестика это ключевые механики. Точку нужно защищать, конкуренты могут пытаться её захватить или зачистить — всё через IC-конфликт.",
  },
  {
    id: "c3",
    category: "Крими-словарь",
    tag: "mechanic",
    term: "Налёт / Наезд",
    shortDesc: "Организованное IC-нападение на объект или группу.",
    fullDesc:
      "Налёт — спланированная акция против конкретной цели: склада, бизнеса, базы, персонажа. В отличие от случайной стрелки, налёт готовится, имеет цель (ресурсы, сообщение, устранение) и проводится с соблюдением правил угрозы и эскалации.",
  },
  {
    id: "c4",
    category: "Крими-словарь",
    tag: "mechanic",
    term: "Откат",
    shortDesc: "Возврат к предыдущему состоянию персонажа/предметов — только через администрацию.",
    fullDesc:
      "Если тебя несправедливо обокрали через баг или нарушение — можно подать заявку на откат. Администрация рассматривает и при подтверждении возвращает потерянное. Просто «не хочу мириться с результатом честного RP» — не основание для отката.",
  },
  {
    id: "c5",
    category: "Крими-словарь",
    tag: "mechanic",
    term: "Контракт",
    shortDesc: "Внутрисемейное задание с наградой — записывайся через сайт.",
    fullDesc:
      "В Schwarz Family контракт — это конкретная задача с вознаграждением. Рыбалка, доставка, охрана точки, ограбление. Контракты публикуются на сайте, участники записываются, ставится таймер. После закрытия контракта те кто его выполнил получают очки активности и достижения. Участвуй — это и деньги, и развитие персонажа.",
  },

  /* ──────────────── СОВЕТЫ НОВИКАМ ──────────────── */

  {
    id: "t1",
    category: "Советы",
    tag: "tip",
    term: "Первые шаги на сервере",
    shortDesc: "С чего начать чтобы не облажаться в первый же день.",
    fullDesc:
      "Прочитай правила сервера полностью — не листай, именно читай. Создай персонажа с продуманной историей: откуда он, почему в Лос-Сантосе, чем занимается. Не лезь сразу в крими — начни с легальной деятельности чтобы понять механики. Первые дни наблюдай за опытными игроками. Задавай вопросы в OOC-чате сервера или Discord.",
  },
  {
    id: "t2",
    category: "Советы",
    tag: "tip",
    term: "Голос — основа живого РП",
    shortDesc: "Говори голосом — это в 10 раз живее текстового отыгрыша.",
    fullDesc:
      "На Маджестике общение через микрофон — стандарт. Текст используется для /me и /do, а диалоги — голосом. Не бойся говорить: даже неуверенный голос лучше молчащего персонажа. Придумай интонацию, манеру речи, словечки для своего персонажа — это создаёт характер.",
    goodExample: "Персонаж нервный и говорит отрывисто — передай это голосом. Персонаж спокойный делец — говори медленно, взвешенно.",
  },
  {
    id: "t3",
    category: "Советы",
    tag: "tip",
    term: "Как правильно умирать",
    shortDesc: "Смерть — часть игры, реагируй на неё правильно.",
    fullDesc:
      "Тебя убили — не выходи из игры, не пиши сразу «нарушение» в Discord. Сначала спокойно полежи и подожди. Если ты уверен что был DM или нарушение — запиши факт, сделай скриншот, обратись в жалобы потом. Во время ситуации не разрушай RP криками про нарушения — это само по себе ООС.",
  },
  {
    id: "t4",
    category: "Советы",
    tag: "tip",
    term: "Промокод и старт",
    shortDesc: "Используй промокод семьи при создании персонажа для стартового буста.",
    fullDesc:
      "При регистрации нового персонажа на Маджестике можно ввести промокод. Это даёт стартовые деньги или предметы. У Schwarz Family есть свой промокод — актуальный найдёшь в разделе «Редукс» на нашем сайте. Вводится один раз при создании персонажа.",
  },
  {
    id: "t5",
    category: "Советы",
    tag: "tip",
    term: "Как вести себя с госами",
    shortDesc: "Остановила полиция — не беги, не грубь, отыгрывай ситуацию.",
    fullDesc:
      "Даже если у тебя полный багажник нелегала — вести себя с полицией нужно IC. Остановился, вышел, отвечаешь. Бежать без причины — провал РП. Сопротивляться с оружием когда тебя один коп остановил за нарушение ПДД — нереально и тоже провал РП. Оцени ситуацию: стоит ли риск? Часто лучший RP — это не побег, а диалог.",
  },
  {
    id: "t6",
    category: "Советы",
    tag: "important",
    term: "Апелляция / Жалоба",
    shortDesc: "Как оспорить бан или подать жалобу на нарушителя.",
    fullDesc:
      "Получил наказание несправедливо — подавай апелляцию на форуме проекта. Пиши спокойно, с доказательствами (скриншоты, видео), без эмоций. Хочешь пожаловаться на другого игрока — собери доказательства и создай тему в разделе жалоб. Жалобы без доказательств обычно не рассматриваются. Discord-обсуждения 'он читер' без записи — не работают.",
  },
];

/* ═══════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════ */

const CATEGORIES = [
  { id: "all",              label: "Всё",                emoji: "📚" },
  { id: "Нарушения",        label: "Нарушения",          emoji: "🚫" },
  { id: "IC и ООС",        label: "IC / ООС",            emoji: "🎭" },
  { id: "РП Механики",     label: "РП Механики",         emoji: "⚙️" },
  { id: "Структура сервера", label: "Сервер",            emoji: "🏙️" },
  { id: "Крими-словарь",   label: "Крими",               emoji: "🔫" },
  { id: "Советы",          label: "Советы",              emoji: "💡" },
];

const TAG_CONFIG: Record<Tag, { label: string; color: string; bg: string; border: string; Icon: typeof AlertTriangle }> = {
  violation: { label: "Нарушение",  color: "#ff3366", bg: "#ff336612", border: "#ff336628", Icon: AlertTriangle },
  important:  { label: "Важно",     color: "#f59e0b", bg: "#f59e0b12", border: "#f59e0b28", Icon: Info },
  mechanic:   { label: "Механика",  color: "#3b82f6", bg: "#3b82f612", border: "#3b82f628", Icon: Info },
  tip:        { label: "Совет",     color: "#22c55e", bg: "#22c55e12", border: "#22c55e28", Icon: Lightbulb },
};

/* ═══════════════════════════════════════════════
   TERM CARD
   ═══════════════════════════════════════════════ */

function TermCard({ term, index }: { term: Term; index: number }) {
  const [open, setOpen] = useState(false);
  const tagCfg = term.tag ? TAG_CONFIG[term.tag] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.22 }}
      className="border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all duration-300 overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-0 text-left group"
      >
        {/* Left accent stripe */}
        <div
          className="w-[3px] shrink-0 self-stretch"
          style={{ background: tagCfg ? `${tagCfg.color}40` : "rgba(155,35,53,0.2)" }}
        />

        <div className="flex-1 min-w-0 px-4 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="text-white/80 group-hover:text-white transition-colors"
                  style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.95rem", letterSpacing: "0.02em" }}
                >
                  {term.term}
                </span>
                {term.alias && (
                  <span className="text-white/20"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.62rem" }}>
                    / {term.alias}
                  </span>
                )}
                {tagCfg && (
                  <span
                    className="px-1.5 py-0.5 uppercase tracking-wider inline-flex items-center gap-1"
                    style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem",
                      color: tagCfg.color, background: tagCfg.bg, border: `1px solid ${tagCfg.border}`,
                    }}
                  >
                    {term.tag === "violation" && "⚠ "}
                    {tagCfg.label}
                  </span>
                )}
              </div>
              <p className="text-white/30 leading-relaxed"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem" }}>
                {term.shortDesc}
              </p>
            </div>
            <div className="shrink-0 mt-1">
              {open
                ? <ChevronUp size={13} className="text-white/20" />
                : <ChevronDown size={13} className="text-white/20" />
              }
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-[3px] px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
              {/* Full description */}
              <p className="text-white/45 leading-relaxed"
                style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.78rem", lineHeight: 1.85 }}>
                {term.fullDesc}
              </p>

              {/* Bad example */}
              {term.badExample && (
                <div className="border border-[#ff3366]/15 bg-[#ff3366]/[0.04] p-3">
                  <p className="text-[#ff3366]/50 uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem" }}>
                    ✗ Так нельзя
                  </p>
                  <p className="text-white/40 italic"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem", lineHeight: 1.7 }}>
                    {term.badExample}
                  </p>
                </div>
              )}

              {/* Good example */}
              {term.goodExample && (
                <div className="border border-[#22c55e]/15 bg-[#22c55e]/[0.04] p-3">
                  <p className="text-[#22c55e]/50 uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem" }}>
                    ✓ Правильно
                  </p>
                  <p className="text-white/40 italic"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem", lineHeight: 1.7 }}>
                    {term.goodExample}
                  </p>
                </div>
              )}

              {/* Neutral example (old "example" field) */}
              {!term.badExample && !term.goodExample && term.example && (
                <div className="border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-white/20 uppercase tracking-wider mb-1.5"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem" }}>
                    Пример
                  </p>
                  <p className="text-[#9b2335]/60 italic"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.75rem" }}>
                    {term.example}
                  </p>
                </div>
              )}

              {/* Punishment */}
              {term.punishment && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={11} className="text-[#f59e0b]/40 shrink-0" />
                  <p className="text-[#f59e0b]/40"
                    style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.65rem" }}>
                    {term.punishment}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════ */

export function CabinetGlossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TERMS.filter((t) => {
      const catOk = activeCategory === "all" || t.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        t.term.toLowerCase().includes(q) ||
        (t.alias ?? "").toLowerCase().includes(q) ||
        t.shortDesc.toLowerCase().includes(q) ||
        t.fullDesc.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const violationCount = TERMS.filter((t) => t.tag === "violation").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <BookOpen size={20} className="text-[#9b2335]" strokeWidth={1.5} />
        <h2 className="text-white"
          style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem" }}>
          Словарь РП
        </h2>
        <span className="text-white/20"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
          {TERMS.length} статей
        </span>
      </div>

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="border border-[#9b2335]/15 bg-[#9b2335]/[0.04] p-4 mb-6 flex items-start gap-3"
      >
        <Sparkles size={15} className="text-[#9b2335]/50 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div>
          <p className="text-white/60 mb-1"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}>
            Справочник по правилам и механикам Majestic RP для участников семьи.
          </p>
          <p className="text-white/25 leading-relaxed"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.72rem" }}>
            Начни с раздела «Нарушения» — знание запрещённого убережёт от бана в первые дни.
            Раздел «Советы» — для тех, кто только зашёл на сервер.
            Актуальные правила всегда на форуме{" "}
            <a href="https://forum.majestic-rp.ru" target="_blank" rel="noopener noreferrer"
              className="text-[#9b2335]/60 hover:text-[#9b2335] transition-colors underline decoration-[#9b2335]/30">
              forum.majestic-rp.ru
            </a>.
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Всего статей", value: TERMS.length, color: "#9b2335" },
          { label: "Нарушений", value: violationCount, color: "#ff3366" },
          { label: "Механик", value: TERMS.filter(t => t.tag === "mechanic").length, color: "#3b82f6" },
          { label: "Советов", value: TERMS.filter(t => t.tag === "tip").length, color: "#22c55e" },
        ].map((s) => (
          <div key={s.label} className="border border-white/5 bg-white/[0.01] p-3 text-center">
            <p style={{ fontFamily: "'Russo One', sans-serif", fontSize: "1.4rem", color: s.color }}>
              {s.value}
            </p>
            <p className="text-white/20 uppercase tracking-widest mt-0.5"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.48rem" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск: DM, захват, /me..."
          className="w-full bg-[#0d0d15] border border-white/8 focus:border-[#9b2335]/30 text-white/70 pl-9 pr-9 py-2.5 outline-none transition-colors"
          style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.85rem" }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors text-sm">
            ✕
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => {
          const count = cat.id === "all" ? TERMS.length : TERMS.filter((t) => t.category === cat.id).length;
          const active = activeCategory === cat.id;
          return (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 uppercase tracking-wider transition-all duration-300"
              style={{
                fontFamily: "'Oswald', sans-serif", fontSize: "0.58rem",
                background: active ? "#9b233515" : "rgba(255,255,255,0.02)",
                border: `1px solid ${active ? "#9b233540" : "rgba(255,255,255,0.06)"}`,
                color: active ? "#9b2335" : "rgba(255,255,255,0.3)",
              }}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span className="opacity-40">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Tag legend */}
      <div className="flex flex-wrap gap-4 mb-5">
        {(Object.entries(TAG_CONFIG) as [Tag, typeof TAG_CONFIG[Tag]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2" style={{ background: cfg.color, opacity: 0.6 }} />
            <span className="text-white/20 uppercase tracking-wider"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>
              {cfg.label}
            </span>
          </div>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="border border-white/5 bg-white/[0.01] p-12 text-center">
          <BookOpen size={32} className="text-white/10 mx-auto mb-3" strokeWidth={1} />
          <p className="text-white/20 uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.68rem" }}>
            Ничего не найдено
          </p>
          {search && (
            <button onClick={() => setSearch("")}
              className="text-[#9b2335]/50 hover:text-[#9b2335] transition-colors uppercase tracking-wider"
              style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.6rem" }}>
              Сбросить поиск
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((term, i) => (
            <TermCard key={term.id} term={term} index={i} />
          ))}
        </div>
      )}

      <p className="text-white/8 text-center mt-10 uppercase tracking-widest"
        style={{ fontFamily: "'Oswald', sans-serif", fontSize: "0.5rem" }}>
        Schwarz Family · Majestic RP · Информация носит ознакомительный характер
      </p>
    </div>
  );
}