# Питання до архітектури KB: як успадковані статті живуть у Unit-scoped дереві папок

Дискавері декларує "кожен Unit має власне дерево папок" і одночасно "статті успадковуються від батьківського Unit'у", але ніде явно не каже, як ці дві речі співіснують. Стаття без папки існувати не може (`folder_id NOT NULL` у data-model, та й семантично — це сирота). А папка з Develux у дереві Employo не живе. Як же тоді стаття з Develux показується в Employo?

## Що дискавері фактично каже (буквально)

З data-model §"Inherited content display":

> When an article from a parent Unit is displayed in a child Unit's KB:
>
> - The article's `unit_id` points to the PARENT Unit
> - Child Units see it because the parent is in their inheritance chain
> - The article is displayed with "From [Parent Unit name]" indicator
> - The article is READ-ONLY from the child Unit's perspective

З ux-flows S2:

> Folder hierarchy (3 levels), articles within folders, inherited content from parent Units with "From [Parent Unit name]" indicator.

З conceptual-model §1.2 (схема):

```
KB Location (Unit-scoped)
├── Folder ...
└── [Shared content: articles visible across multiple KB Locations]
```

Оце "[Shared content]" у дужках — це і є місце, де артефакти розписуються в безпорадності. Сутність не названа, не зведена до таблиці, не має folder_id для child Unit'а. Просто "якось показується".

## Три можливих прочитання — і жодне не задокументоване

**Інтерпретація 1: Папки батьківського Unit'у проєктуються у дерево дочірнього.**
Тобто Employo бачить власне дерево папок + поверх нього (або окремою секцією) дерево папок Develux. Стаття з Develux/Policies/Code-of-conduct з'являється у "проєкції" Develux'ового дерева всередині Employo. Папки помічені "From Develux", read-only.

*Проблема:* це фактично повертає модель "Shared with you", яку дискавері з PRD прибрало як архітектурно неправильну. До того ж — якщо Develux має 3 рівні папок, а Employo свої 3 рівні, користувач Employo може побачити 6 рівнів дерева. Шумно.

**Інтерпретація 2: Успадковані статті лягають у "плоску" секцію без папок.**
Окрема зона "Company-wide" / "Inherited" / "From Develux" у KB кожного дочірнього Unit'у, де лежать успадковані статті без структури папок.

*Проблема:* губиться організація. Якщо Develux має 30 успадкованих статей — вони висипаються плоским списком, без категоризації.

**Інтерпретація 3: Статті "матчаться" у однойменні папки дочірнього Unit'у.**
Якщо в Employo є папка "Policies" — стаття "Code of conduct" з Develux/Policies показується там. Якщо немає — створюється віртуально.

*Проблема:* a) це "глобальні папки by stealth" — тобто фактично модель прототипу, тільки замаскована; b) що робити, коли назви папок не збігаються; c) хто власник матчингу — користувач Develux чи Employo.

## Conceptual Model сама визнала, що це невирішено

§6 Tension 5: "Cross-Unit content sharing model" — три варіанти:

- **A.** Inheritance від батька, сабюніт може мати локальну overriding-версію. *Проблема:* "what happens when parent updates and child has override?"
- **B.** Explicit cross-Unit sharing: одна стаття з multi-Unit visibility flags (це фактично PRD-модель).
- **C.** Окремий "Company" KB Location — неприв'язаний до жодного Unit'у, видимий всім.

Decision log нібито обрав A. Але опис варіанту A в conceptual-model пояснює лише **факт успадкування**, а не **як саме він рендериться у дереві дочірнього Unit'у**. Permission Matrix Edge Case 2 повторює те саме — "Author in Unit A sees Company-level articles inherited into Unit A's KB" — і знов жодного слова про папки, ця ланка в дискавері просто відсутня.

## Чому ця дірка важлива

Це не косметика. Те, як саме рендеряться успадковані статті, визначає:

1. **Структуру даних.** Якщо інтерпретація 1 — потрібен запит, що повертає дерево папок усіх ancestor Units + власне дерево, з міткою "inherited" на кожен елемент батьківського дерева. Якщо інтерпретація 2 — окрема query "inherited articles" без folder_id. Якщо інтерпретація 3 — потрібен matching layer між папками різних Units.
2. **Permission UI.** Чи може Employo Admin вимкнути показ конкретної папки з Develux? Чи лише статті? Дискавері не каже.
3. **Search scope.** Коли Andrii шукає в Employo, він шукає по власних статтях + успадкованих. У якій папці підсвічувати збіг — у Develux/Policies, чи в Employo/Inherited/Policies, чи без папки взагалі?
4. **Acknowledgement.** Якщо Develux публікує "Code of conduct" з ack-required, ack-record для Employo-співробітника має `article_id = develux-coc`. ОК, це працює. Але в якій папці він її бачив? Це впливає на audit trail.
5. **Реструктуризація Units.** Що буває, коли Employo переноситься з-під Develux в інший Space? Усі успадковані ack-records треба cancel'нути? Переприв'язати? Це є в Edge Case, але без folder-моделі — неповно.

## Що тут треба зробити

Це питання до моделі. Зокрема:

1. **Який з трьох сценаріїв (1 / 2 / 3) обрано?** Якщо decision log це вирішив — треба побачити запис.
2. **Якщо обрано інтерпретацію 1 (проєкція дерева батька)** — як рендеряться 4 рівні Units? Чи є контроль "приховати дерево Develux від Employo, бо воно занадто шумне"?
3. **Якщо обрано інтерпретацію 3 (matching по назвах папок)** — то це фактично глобальна таксономія через задні двері, і дискавері має це визнати. Тоді твій прототип ближчий до правди, ніж дискавері визнає.
4. **Структурне питання:** чи замість "inheritance" не потрібна окрема сутність типу "Library" / "Shared Folder" / "Company Section" — як описано у Tension 5 варіант C? Це б розв'язало і peer-to-peer sharing, і спільну таксономію — обидва провали поточної моделі.

Коротко кажучи: дискавері в цій точці робить вигляд, що проблема розв'язана, бо вона сформульована ("parent-to-child inheritance"). Але як це рендериться у UI з Unit-scoped папками — там білий простір.
