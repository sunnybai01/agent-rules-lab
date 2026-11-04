# AI 开发规范体系：评估与 v2 方案

日期：2026-11-04。对象：provital-platform（57Blocks，3 人团队，全员 Claude Code）。
证据来源：本 lab 的 E1 结果（24 次运行，[results/e1-findings.md](../results/e1-findings.md)）、`variants/layout-c`、`variants/workflow`、fixture 里的检查脚本，以及 provital-platform `30918bb` 的现有文档。

---

## 第一部分：对原设计的评估

### 1.1 总体判断

方向正确，骨架完整，可以作为 Sprint 2 的基础。三条主线（三类文档、追溯链、机器守门）都有 lab 证据支持。问题不在方向，而在**规模和顺序**：原设计一次引入了 9 种文档类型、5 个 skill、5 个脚本和 1 个 review agent，而团队只有 3 人、距 R0 只有 13 周。E1 已经给出一个警告（finding 4）：一条写得太宽的 ADR 规则，让 AI 每个 story 都写一份 ADR。规范里每多一种制品，就多一种会被 AI 机械地、过量地生产的东西。

所以 v2 的核心调整是：**制品减半，闸门按风险分级，生成能力分阶段兑现，实验先于规则。**

### 1.2 被证据支持的部分（保留）

| 原设计 | 证据 | 结论 |
|---|---|---|
| 能用机器检查的规则一律交给机器 | E1 finding 1：24 次运行 0 次违反边界、ERP、PII 规则；类型和检查在教规则，不是文档 | 保留，并作为第一原则 |
| 现状文档原地改写、随 PR 更新 | E1 finding 2：B/C 16 次运行 16 次正确更新了模块文档；A 0 次 | 保留。"同 PR 更新模块文档"是最有效的单条规则 |
| 规则要可执行（模板 + 索引 + 步骤） | E1 finding 3：三种布局都写了"数据模型变更先 ADR"，只有带模板的 B/C 真的写了 | 保留。每条规则必须配模板或命令，否则不写进规范 |
| 短根文件 + 每模块一份文件 | E1 finding 6：B 和 C 自动指标相同；C 多读 3.5 个文件，成本高 10%，但 9 模块时 B 会到 700+ 行且并行开发冲突 | 保留 C |
| 固定上下文加载顺序 | Claude Code 机制：根 CLAUDE.md 启动加载，子目录 CLAUDE.md 在读该目录文件时加载。C 的每模块 `CLAUDE.md → @AGENTS.md` 已实现这个顺序 | 保留，但改为**靠机制保证，不靠文字** |
| spec 放 repo，Jira 管状态 | lab Q2 已决定；E1 中 Jira 风格的 story 描述足够 AI 产出正确代码 | 保留 |

### 1.3 风险与缺口（需要修改）

**R1. 领域卡和模块 AGENTS.md 重复。** 原设计新增 `DOMAIN.md`（≤150 行），但 layout C 已有每模块 `AGENTS.md`（20–37 行），内容正是职责、公开 API、表、事件、不变量、归属 AC。两份文件意味着两处事实。**v2：一个模块一份文件，就是 `AGENTS.md`，上限 100 行；"领域卡"只是它的别名。**

**R2. "生成类"文档的雄心最大，证据最少。** 从代码生成公开 API 和事件需要 TS 提取器；契约文档依赖契约格式（TD-15 未决）。按原计划在 11/6–11/9 做不出来，做出来也没有被生成的对象。**v2：分两档。Sprint 2 做"校验"（脚本比对 AGENTS.md 的 API 表和 `index.ts` 的导出名，不一致 CI 报错），Sprint 4 起视需要做"生成"。** 校验脚本约 80 行，用 TS compiler API 即可。

**R3. "ID 存在性检查"没有数据源。** Discovery ID 的全集在 `57blocks/provital-discovery`，不在平台 repo；`discovery-baseline.md` 只是摘要，只引用了一部分 ID。没有机器可读的 ID 清单，存在性检查、影响分析、"按版本钉住"、"ID 被替代"四件事都做不了。**v2：新增 `docs/requirements/ids.<version>.json`，从 Discovery 包导出，钉住 commit。这是整个追溯链的锚点，必须最先做。**

**R4. ID 类型没有分层。** Discovery 包里有六种 ID：`AC`（验收标准）、`D`（决策）、`C`（能力）、`P`（输入/前提）、`O`（有替代方案的决策）、`R`（数值要求）。v0.1 共 436 条。fixture 的 `tools/traceability` 只匹配 `[AT]\d-AC-\d{3}`。测试只能追溯 AC；D/C/R 由 ADR 和架构文档承接。原设计把"每个 ID 归属且只归属一个领域"当作通则，但 T4 非功能需求、A7 割接、DP1 边界是横切的。**v2：ids.json 带 `type` 字段。归属不写进 ids.json（它是 Discovery 的导出，是记录），而写在模块 `AGENTS.md` 的 "Acceptance criteria" 节，只有 AC 有归属；D/C/R 常是横切的，用 `pnpm ids impact` 查引用处。**

**R5. spec 闸门的严格度先于 E2 结果被决定了。** 原设计："feat 必须先批 spec"。但 lab 的 E2（spec 工作流 vs 直接提示）还没跑；且 lab 的 `docs/specs/README.md` 写的是"spec 和代码在同一个 PR 里 review"，两者矛盾。3 人团队里，每个 feat story 都等另一个人批 spec，等待时间会比写代码还长。**v2：闸门按触发清单分级（见 2.4）。只有命中清单的 story 需要第二人在写代码前批准；其余 story 的 spec 和代码在同一 PR 审。E2 在 11/5–11/6 跑完后再锁定。**

**R6. 多人偏差的归因不准。** 原设计认为"个人 AI 记忆不一致是多人开发偏差的主要来源"。E1 的证据指向别处：偏差来自文档布局和规则是否可执行（A 两次漏掉 `subscriptions.ts` 约定，B/C 零次），记忆根本没参与（每次运行都是全新会话）。**v2：记忆隔离保留为卫生规则，但不作为主要杠杆；主要杠杆是共享的 skill 和模块文件。**

**R7. ADR 规则过宽（E1 finding 4 原文）。** 一个新列、一次 ERP 读取都触发了 ADR，而且编号不一致（0001 vs 0015）。**v2：ADR 触发清单收窄到 5 条，并和 spec 二人闸门用同一张清单；`docs/adr/README.md` 写明下一个空闲编号。**

**R8. 冷启动依赖未推送的分支。** "新会话只读 spec 就能接着做"的前提是 spec 和 plan 在远端。squash merge 之前分支上的中间提交只在本地。**v2：增加 `/handoff` skill：勾选 plan、提交、推送、写一段交接摘要。E2 冷启动实验必须经过它。**

**R9. 变更流程缺少"基线升级"这一类。** v0.1 → v1.0 不是一条 CR，是几十个条目的整体差异。**v2：基线升级 = 新的 ids.json + 一条 `BL-` 记录（差异由脚本生成）；CR 只记录 v1.0 之后的单项变更。**

**R10. 实验命名和 lab 冲突，通过标准不可操作。** 原设计的 E1–E5 和 lab 已完成的 E1（布局）、待跑的 E2/E3 重名。"分歧数明显下降"在 n=3 时无法判断。**v2：改名 P1–P5（pilot），每个实验先定评分表再跑，用 harness 补样本量，盲评。**

**R11. 时间线太满。** 11/4–11/13 内要完成规范、模板、5 skill、4 脚本、5 个实验、ADR，同时还有 Sprint 1 的交付和 E2/E3。**v2：分"Sprint 2 第一天必须有"和"Sprint 3 前补齐"两档，见第三部分。**

**R12. 两处小矛盾。** (a) 原设计说现状文档不写 change log，但 `architecture.md`、`delivery-plan.md`、`discovery-baseline.md` 都有 change log 表，`discovery-baseline.md` 还要求"在 change log 里记录变更"。v2 删除这些表，历史交给 git 和 CR。(b) `technical-decisions.md` 是"未决决策清单"，是现状不是记录；拆成 ADR 的是"已决"的部分，TD 本身保留为瘦身后的索引（TD "how to read" 已写明：决定后 ID 不变，ADR 引用 TD）。

---

## 第二部分：v2 方案

### 2.1 文档分类（三类不变，归属修正）

| 类别 | 改法 | AI 默认加载 | 上限 | 包含 |
|---|---|---|---|---|
| **现状 Living** | 原地改写，无 change log | 按加载顺序只加载相关部分 | 每文件有行数上限 | 根 `AGENTS.md`、`docs/README.md`、`architecture.md`、`infrastructure.md`、`delivery-plan.md`、`discovery-baseline.md`（摘要，钉住版本）、`technical-decisions.md`（未决索引）、`glossary.md`、`conventions/*.md`、每模块 `AGENTS.md`、进行中 story 的 `plan.md` |
| **记录 Records** | 批准后只增不改 | 否，按链接查 | 每类有上限 | `adr/NNNN-*.md`、`changes/CR-NNN-*.md`、`changes/BL-<version>.md`、已批准的 `specs/AN-n/spec.md`、`requirements/ids.<version>.json`、`proposal/*` |
| **校验 / 生成 Verified / Generated** | Sprint 2：脚本校验手写内容与代码一致；之后视需要改为生成 | 校验类随所在文件加载；生成类不提交 | — | 模块 `AGENTS.md` 的 "Public API" 和 "Events" 两节（校验）；追溯矩阵、影响报告（CI 生成，写入 job summary，不提交） |

配套规则（保留原设计四条，补两条）：
- 一个事实一处，其他地方只链接。Jira 和 spec 只写 AC ID。
- 历史只在 git、Jira、记录里。
- 项目事实不进个人 AI 记忆；会话里学到的东西通过 `/handoff` 和 PR 写回 repo。
- 长任务进度写在 `plan.md`，不靠对话记忆。
- **新增：每条规则必须配一个模板、命令或检查。没有的不写进规范。**（E1 finding 3）
- **新增：生成的内容不提交。** 提交会在 squash merge 和 3 人并行下制造冲突；CI 生成并发布即可。

### 2.2 仓库布局

```
AGENTS.md                              现状，≤60 行。命令、硬规则、加载顺序、完成标准
CLAUDE.md                              @AGENTS.md
docs/README.md                         文档地图，≤40 行
docs/architecture.md                   现状（删 change log）
docs/infrastructure.md
docs/delivery-plan.md
docs/discovery-baseline.md             现状摘要，首行钉住 "Discovery v1.0 @ <sha>"
docs/technical-decisions.md            未决索引，随 ADR 落地逐步瘦身
docs/glossary.md                       德语业务词 | 英文 | 代码名 | 模块，≤150 行
docs/conventions/{data,events,erp,testing,naming}.md   每份 ≤60 行
docs/requirements/ids.v0.1.json        记录。从 Discovery 包导出
docs/requirements/ids.v1.0.json
docs/requirements/current.json         指向当前版本（一行）
docs/adr/README.md + NNNN-*.md         记录，≤80 行/份
docs/changes/BL-v1.0.md                基线升级记录（脚本生成差异 + 人写决定）
docs/changes/CR-NNN-*.md               变更记录，≤40 行/份
docs/specs/AN-<n>/spec.md              批准后为记录，≤150 行
docs/specs/AN-<n>/plan.md              story 进行中为现状；合并后保留不再改
docs/specs/_template/{spec,plan}.md
packages/core/src/<module>/AGENTS.md   现状，≤100 行；API 和 Events 节有校验标记
packages/core/src/<module>/CLAUDE.md   @AGENTS.md
packages/<pkg>/AGENTS.md + CLAUDE.md
.github/pull_request_template.md
.github/workflows/ci.yml
.claude/settings.json                  共享 hooks 与权限
.claude/skills/{story-start,implement,handoff,review,cr}/SKILL.md
.claude/agents/reviewer.md
tools/{ids,docs-check,traceability,impact,pii-check,pr-check}/
```

### 2.3 需求拆分层级（保留，修正 L1 和 L2）

```
L1 需求原子   ids.<version>.json 里的条目：id, type(AC|D|C|P|O|R), area, title, release, source, status, supersededBy
   ↓ AC 归属一个模块（写在模块 AGENTS.md）；D/C/R 可以横切
L2 模块      = 限界上下文；每模块一份 AGENTS.md（即"领域卡"）
   ↓
L3 Epic/Story  Jira：Epic = 周，Story = 交付物（已有规则）。Story 摘要末尾带 AC ID（已有规则，/story-start 据此拒绝没有 AC 的 story）
   ↓ /story-start
L4 Spec      docs/specs/AN-n/spec.md + plan.md
   ↓ /implement
L5 任务/提交  plan.md 的步骤 → 分支 AN-n-* → PR → squash 提交 → it("A2-AC-014: …")
```

模块 `AGENTS.md` 结构（固定小节，校验脚本按标题找）：Owns、Public API（校验）、Tables、Events（校验）、Invariants、Reads from ERP、Acceptance criteria、Terms、Open questions。

拆分规则：
- 一个 story 一个 spec 一个 PR。
- 一个 story 声明一个**主模块**；要动第二个模块只能通过事件或该模块已有公开 API，否则拆 story。review agent 把违反记为偏差，不是 CI 硬错。（垂直切片里程碑需要跨模块 story，硬禁会卡住 11/27 的 vertical slice。）
- 命中触发清单（2.4）的 story，spec 必须先于代码被第二人批准，且需要 ADR 或 CR。

### 2.4 触发清单（一张表管 ADR 和二人闸门）

命中任一条即为"设计级 story"：

1. 新模块，或改变模块边界、模块间依赖方向。
2. 新增或改变事件契约、ERP port 操作、对外 payload 契约。
3. 新表，或新增**个人数据类别**的列（新增非个人数据列不算）。
4. 新技术、新外部依赖、新外部服务。
5. 对某个 Discovery ID 的解释与基线不同。

设计级 story：`/story-start` 在 spec 顶部标 `Gate: design`；`/implement` 检查 `Approved-by:` 行存在且不是作者本人，否则停止；需要 ADR（1、2、4）或 CR（5）。
普通 story：spec 和代码同一 PR 审；`/implement` 不等待。

ADR：`docs/adr/README.md` 写明下一个空闲编号（当前 0001、0002、0004、0009、0013 未分配，0003–0014 被 architecture.md 引用但不存在，先补这些）。

### 2.5 spec 必写内容（模板）

```
# AN-123: <summary>
- Jira: AN-123 | Gate: normal | design | Status: Draft | Approved | Done
- Approved-by: <name> <date>        （design 级必填，非作者）
- Baseline: Discovery v1.0
- Module: identity (primary) | Touches: journey (event only)
## Acceptance criteria        | ID | 测试文件 |（只写 ID，不抄原文）
## Design increment           模块 AGENTS.md 改什么 / 契约改什么 / schema 改什么（含 PII 元数据）
## Local decisions            本 story 内的小决定，不够格做 ADR 的
## Out of scope
## Open questions             批准前必须清空
## Deviations                 实现时填：与批准版的差异（PR 模板引用此节）
```
`plan.md`：小步，先测试后代码，每步列文件，最后一步"更新模块 AGENTS.md，跑 `pnpm check`"。进度勾选只在这里。

### 2.6 追溯链

```
ids.v1.0.json（@sha）→ 模块 AGENTS.md（Acceptance criteria 节）→ Jira AN-123（摘要含 AC ID，描述链到 spec）
→ specs/AN-123/spec.md（Approved-by）→ 分支 AN-123-* → PR（标题含 AN-123）→ squash 提交（标题 + 正文）
→ it("T3-AC-004: …") → CI 生成的追溯矩阵
```

机制上的两个关键点：
- GitHub 仓库设置 "Default to pull request title and description" 作为 squash 提交信息。这样**每个提交自动含 Jira key、spec 链接、AC ID、验证证据**，反查不需要任何工具，`git log --grep AN-123` 即可。
- PR 模板固定五节：Spec 链接、`Refs: AN-123`、Covered: AC IDs、Verification（跑了什么、结果）、Deviations from spec。`tools/pr-check` 在 CI 里校验：标题含 key；feat 类有 spec 且 Covered 与 spec 的 AC 一致；Verification 非空。

正查（AC → 代码）：`pnpm impact T3-AC-004` 或看 CI 的矩阵。反查（提交 → 需求）：提交信息本身。

### 2.7 需求变更流程

- **基线升级**（v0.1 → v1.0）：导出 `ids.v1.0.json`，`pnpm ids diff v0.1 v1.0` 生成差异（新增、删除、改文、替代），写入 `changes/BL-v1.0.md`；人补"决定"和"新建的 Jira"。`current.json` 指向 v1.0。
- **单项变更**：`/cr <来源>` 创建 `CR-NNN-*.md`：来源、受影响 ID（旧 → 新）、DR §8 分类（结构 / setting / 新规则条目 / 迟到输入）、影响面（`pnpm impact` 输出，不靠人记）、决定、新建 Jira。ID 永不复用，旧 ID 标 `supersededBy`。
- **spec 失效**：`tools/ids` 扫描 Status ≠ Done 的 spec 和所有测试标题，引用了 `supersededBy` 非空的 ID 即 CI 失败，spec 状态改 `Stale`，需重新批准。
- 谁批 CR：结构变更 → 走 Provital change control（DR §8），本地 CR 记录结果；其余 → tech lead。

### 2.8 守门（按强弱排序）

| 层 | 内容 | Sprint 2 状态 |
|---|---|---|
| 1 机器检查 | 现有：dep-cruiser、pii-check（**改为拒绝 TBD/TODO/to be confirmed**）、traceability `--require`。新增：`tools/ids`（存在性 + 替代）、`tools/docs-check`（行数上限、校验节与 `index.ts` 一致、现状文档无 change log 标题）、`tools/pr-check` | 全部必须 |
| 2 同一套流程 | `.claude/skills/{story-start,implement,handoff,review,cr}`、`.claude/agents/reviewer.md`、`.claude/settings.json` 提交进 repo。`settings.local.json` 不提交 | 必须 |
| 3 加载顺序 | 靠机制：根 `CLAUDE.md` 启动加载；模块 `CLAUDE.md` 在读该目录文件时加载；spec 由 `/implement` 读。根 `AGENTS.md` 禁止"读全部文档"的指令 | 必须 |
| 4 spec 闸门 | 按 2.4 分级 | 待 E2 后锁定 |
| 5 review agent | 现有 `architecture-reviewer` 改名 `reviewer`，增加：对照 spec 的 Design increment 逐项核对、输出 Deviations 列表供作者粘进 PR、检查主模块规则、检查新领域名词是否在 glossary | 必须 |
| 6 Stop hook | `pnpm check` 失败则阻止结束（lab 已有） | 待 E3 后决定 |
| 7 术语表 | `glossary.md`，review agent 检查 | 种子版 |

### 2.9 Fix 和 chore

- `fix`：不写 spec。PR 模板的 Covered 节写 AC ID，必须有一个以该 AC ID 命名的回归测试。若 bug 暴露的是需求缺口 → 走 `/cr`。
- `chore`/`docs`：不写 spec，`pr-check` 只验标题格式。
- Jira 类型 Task 对应 chore；Bug 对应 fix。

### 2.10 对原设计三个待定问题的回答

1. **spec 放 repo**：是。Jira 描述里由 `/story-start` 写入 spec 路径；spec 里写 Jira key。
2. **闸门严格度**：不按 feat/fix 分，按 2.4 触发清单分。feat 普通 story 自审（spec + 代码同 PR），设计级 story 二人先批。E2 结果若显示 spec 工作流在普通 story 上没有收益，普通 story 的 spec 降为 PR 正文里的一节。
3. **全员 Claude Code**：是。文件仍叫 `AGENTS.md`（厂商中立），skill 是 Markdown，换工具可迁移。

---

## 第三部分：落地与实验

### 3.1 分两档交付

**档 A：Sprint 2 第一天（11/16 前）必须有。** 没有这些，规范无法运行。

| 制品 | 来源 | 工作量 |
|---|---|---|
| 根 `AGENTS.md`（C 版 + 命令表 + "finish 前跑 `pnpm check`"） | `variants/layout-c` 已有，按 E1 finding 2 修 | 0.5 h |
| 9 个模块 `AGENTS.md` + `CLAUDE.md` | C 有 4 个，补 5 个（commerce、subscription、commission、content、ai），空模块只写 Owns 和 Acceptance criteria | 3 h |
| `docs/README.md`、`conventions/*` | C 已有 | 0.5 h |
| `docs/requirements/ids.v0.1.json` + `ids.v1.0.json` + `tools/ids` | 新。从 Discovery 包导出（需要一个导出脚本在 discovery repo 侧，或先手工从 `outputs/discovery/` 抽） | 4 h |
| spec/plan 模板、PR 模板、`docs/adr/README.md`（收窄触发 + 下一编号） | lab 已有，改 | 1 h |
| `tools/pii-check` 拒绝占位符 | E1 finding 5 | 0.5 h |
| `tools/docs-check`（行数上限 + 校验节） | 新 | 3 h |
| `tools/pr-check` + CI workflow | 新 | 2 h |
| skills：`story-start`、`implement`、`handoff`、`review`；agent `reviewer` | lab 有 2 个 skill 和 1 个 agent，改名加 2 个 | 3 h |
| `.claude/settings.json`（权限 + 可选 Stop hook） | lab 已有 | 0.5 h |
| GitHub 设置：squash 信息默认 PR 标题 + 正文 | 设置项 | 0.1 h |
| ADR-0015 "AI 开发规范"、ADR-0016 "文档架构"（lab 计划的两份） | 新 | 2 h |
| `docs/engineering/ai-development.md` 规范本体（≤120 行，其余全靠链接） | 新 | 2 h |

合计约 22 小时，一人 3 天。

**档 B：Sprint 3 前补齐。** `/cr` skill 和 `tools/impact`（v1 可以是 grep 加 ids.json）、`changes/BL-v1.0.md`、`glossary.md` 种子、`technical-decisions.md` 瘦身、删除现状文档的 change log、补 ADR-0003 到 -0014。

**不做（至少 Sprint 4 前）**：从代码生成 API 和事件文档；契约文档生成（等 TD-15）；追溯矩阵提交进 repo。

### 3.2 时间线

| 日期 | 工作 |
|---|---|
| 11/4–11/5 | 本方案和 Ryan、Teki 过一遍；决定触发清单的措辞；从 Discovery 包导出 ids.v0.1.json |
| 11/5–11/6 | lab 跑 E2（spec 工作流）和 E3（Stop hook），各 4 次；锁定 2.4 的闸门和 2.8 第 6 层 |
| 11/6–11/10 | 档 A 制品 |
| 11/10–11/12 | P1–P5（下表），用 1–2 个真实领域 story（建议 `kernel` settings 或 `identity` 注册） |
| 11/12–11/13 | 调整；两份 ADR 置 Accepted；PR 到 provital-platform；Discovery v1.0 到达后做 BL-v1.0 |
| Sprint 2 | 全面采用；retro 用 3.4 的指标 |

### 3.3 实验（改名 P，避免和 lab 的 E 系列混淆）

每个实验先写评分表，再跑；评分盲评（lab README 已有规则）。harness 可以用 `--gate manual` 和全新会话补样本，人只需各跑一次。

| 实验 | 问题 | 做法 | 样本 | 通过标准 |
|---|---|---|---|---|
| P1 多人一致性 | 同一 story，不同人的 AI 产出是否一致 | 同一 story；实验组 = v2 规范，对照组 = 现有 `AGENTS.md`（lab layout A）。3 人各 1 次全新会话只跑到 spec，harness 再各补 5 次 | 每组 8 份 spec | 五个维度（主模块、命名、边界处理、AC→测试映射、范围）两两比较的分歧数：实验组中位数 ≤ 对照组一半，且边界维度为 0 |
| P2 冷启动 | 中断后新会话能否不重复、不偏离 | harness：`/implement` 做到 plan 第 k 步后 kill，`/handoff` 推送，新会话只带 spec 和 plan 继续 | 3 个 k 值 × 2 次 | 重复步骤 0；与 spec 的偏差 0；新会话读文件数 ≤ 首次会话的一半 |
| P3 需求变更 | 影响面能否全部找到 | 用 v0.1→v1.0 真实差异生成 BL-v1.0；对每个变更 ID 跑 `pnpm impact`；两人独立手工列影响面作为真值 | 全部变更 ID | 召回 100%；误报 ≤ 20% |
| P4 追溯审计 | 任取一点能否双向查到 | 随机 5 个 squash 提交反查到 AC ID 和基线版本；随机 5 个 AC 正查到 spec、PR、测试；计时 | 10 次 | 每次 ≤ 2 分钟，10/10 查到 |
| P5 上下文膨胀 | 默认加载量是否随 story 数增长 | harness 已记录 docs read 和 input tokens（E1：C 平均 4.3 份、比 A 贵 $0.16）。在 fixture 里加 10 份假 spec 和 3 份 ADR 后重跑 T6 | 2 次 | input tokens 增幅 ≤ 10%；默认读的文件集合不变 |

P5 的要点：规范的"不加载记录类"规则是否真的生效，用 token 而不是用感觉判断。

### 3.4 Sprint 2 retro 指标

- feat PR 中有 spec 的比例；设计级 story 中 `Approved-by` 非作者的比例。
- `pr-check`、`ids`、`docs-check` 在 CI 的失败次数和原因（失败多说明规则不可执行，不是人不守规矩）。
- 每个 story 的 AI 成本（`claude -p` 不适用于真实开发，用会话的 `/cost` 手记）。
- review agent 的 Deviations 条数和其中被人工接受的比例。
- 每个 story 产生的记录类文件数（目标：普通 story 1 份 spec，设计级 ≤ 3 份）。

---

## 附录 A：`ids.<version>.json` 结构

```json
{
  "version": "0.1",
  "source": { "repo": "57blocks/provital-discovery", "path": "outputs/discovery", "commit": "733e97e" },
  "items": [
    { "id": "T3-AC-004", "type": "AC", "area": "T3",
      "title": "A consent record shows its type, its text version, its date, its source and its withdrawal",
      "source": "T3-architecture-domain-model-annex.md:122", "status": "active" },
    { "id": "A1-C-001", "type": "C", "area": "A1", "title": "Monthly settlement periods ...", "release": "R1",
      "source": "A1-commission-annex.md:65", "status": "active" }
  ]
}
```
被替代时加 `"status": "superseded", "supersededBy": "<新 ID>"`。`tools/ids` 的命令：`check`（默认，CI）、`show`、`impact`、`diff`、`export`。

## 附录 B：模块 `AGENTS.md` 的校验标记

```markdown
## Public API (`index.ts`) <!-- verified: exports -->
| Export | Use |
...
## Events <!-- verified: events -->
```
`tools/docs-check` 读 `index.ts` 的导出名和 `DomainEvent<"…">` 的名字，和表格第一列比对；多出或缺少都报错。表格的"Use"列仍由人写。这就是 Sprint 2 的"生成类"：人写意图，机器保证名字对得上。

## 附录 C：PR 模板

```markdown
Spec: docs/specs/AN-123/spec.md
Refs: AN-123
Covered: T3-AC-004
## Verification
- `pnpm check` ✔ / `pnpm trace --require T3-AC-004` ✔
## Deviations from spec
- none | <来自 spec 的 Deviations 节>
```

---

## 第四部分：档 A 实现状态（2026-11-04）

档 A 做成了 lab 里的变体 [variants/layout-v2](../variants/layout-v2/)，可以用 harness 直接跑 P1–P5（`--layout v2`）。它从 layout C 派生，a/b/c 没有改动，E1 结果仍然可比。

### 已完成

| 制品 | 位置 | 验证 |
|---|---|---|
| Discovery ID 清单 v0.1（436 条，钉住 `733e97e`） | `docs/requirements/ids.v0.1.json` | 从包里导出；包内引用的 ID 全部有定义 |
| `tools/ids`：check、show、impact、diff、export | `tools/ids/` | 7 个测试；模拟 v1.0 替代 T3-AC-004 后，进行中的 spec 和模块文件报错，模板和文档只警告 |
| `tools/docs-check`：行数、无 change log、链接、CLAUDE.md、模块小节、API 和事件表对照代码 | `tools/docs-check/` | 5 个测试；新增未登记导出时报错 |
| `tools/pr-check` | `tools/pr-check/` | 8 个测试；agent 产出的 PR 正文通过，作者自批设计级 story 时拒绝 |
| `pii-check` 拒绝占位符 | `tools/pii-check/` | "to be confirmed in the ADR" 被拒 |
| 根 `AGENTS.md`（59 行）、7 个模块/包文件、文档地图、ADR 索引、spec/plan 模板、变更记录说明 | 各处 | `pnpm check` 全部通过 |
| skills `story-start`、`implement`、`review`、`handoff`；子 agent `reviewer`；`settings.json` | `.claude/` | 冒烟运行中全部被调用 |
| PR 模板、CI workflow | `.github/` | CI 未在 GitHub 上运行过 |
| 规范本体（100 行）、ADR-0015、ADR-0016 | `docs/engineering/`、`docs/adr/` | 状态 Proposed |

harness 改动：`--build-only`；变体可以追加 package 脚本；v2 的 spec 工作流用它自己的 skill；自动闸门扮演批准者并回答开放问题；`ids` 和 `docs` 的结果记录在 `checks` 里但不计入 `checks.all`。

### 和方案的差异

- **归属不进 ids.json。** 清单是 Discovery 的导出（记录类）；AC 归属写在模块 `AGENTS.md`，`pnpm ids` 检查一个 AC 只有一个归属模块。
- **模块文件只写了已有代码的 4 个模块。** provital-platform 目前没有代码，档 A 要和 monorepo 那个 story 一起落地，其余 5 个模块在创建时补模块文件。
- **追溯矩阵只做 AC → 测试。** D/C/R 的引用用 `pnpm ids impact` 查，不另建矩阵。
- **触发条件 5 收窄了**（见下面的冒烟结果）。

### 已经发现的真实问题

- provital-platform 现有 `AGENTS.md` 的 Jira 示例 ID `A2-AC-014`、`A2-AC-015` 在 Discovery 包里不存在（A2 只有 6 条 AC）。v2 改用 `A2-AC-006`。
- layout C 的 kernel 模块文件漏了 `dataMetaOf` 和 `BUSINESS_TIME_ZONE` 两个导出，erp-fake 的导出也没写。`pnpm docs` 现在会抓这类漂移。

### 冒烟运行：T6（同意记录），v2 + spec 工作流

| 运行 | 结果 | 成本 | 时间 |
|---|---|---|---|
| 第一次（闸门只填 `lab-gate`） | 实现阶段拒绝开工：设计级 story，4 个开放问题没回答，批准者不像真人。0 行代码 | $0.52 | 1.6 分钟 |
| 第二次（闸门扮演批准者回答问题） | 成功。硬测试 5/5，软测试 2/3，`ids`、`docs`、`trace` 全过 | $1.67 | 5.9 分钟 |
| 对照：E1 layout C 直接提示 T6 | 成功 | $0.85 | 2.8 分钟 |

观察：

1. **闸门真的挡得住。** 设计级 story 的开放问题没回答时，agent 不写代码，并列出它需要批准者回答什么。对 3 人团队，这意味着批准者必须在 spec 里写答案，不能只写 "LGTM"。
2. **ID 清单产生了实际价值。** `pnpm ids show` 打印的原文让 agent 发现 Jira story 对"撤回"的理解可能和 T3-AC-004 原文不一致，并作为开放问题提出。
3. **它发现了 spec 里的设计错误。** 批准的 spec 按 UUIDv7 排同一毫秒内的记录，但 `newId` 在毫秒以下是随机的。agent 改用插入顺序，并写进 Deviations。
4. **事件约定被遵守。** 批准者规则是"按约定选"，agent 选了 payload 只放 ID，并写进 ADR-0017。
5. **记录类文件又出现了过量。** agent 为一次"字段映射"写了 CR-001（没有 ID 变化，分类还写成 setting）。已收窄触发条件 5：只有和原文矛盾才算，映射写进 spec 的 Local decisions。需要在 P1 里复验。
6. **成本约为直接提示的 2 倍。** 多出的部分来自 ADR、CR、review 子 agent 和 spec。这正是 lab E2 要量化的：多花的钱换来的偏差减少是否值得。

### 下一步

- lab E2/E3（`--layout c`）照原计划跑；另外用 `--layout v2 --workflow spec` 跑 P1，样本至少 5 次，验证触发条件 5 收窄后不再多写 CR。
- 和 Ryan、Teki 过一遍第一到第三部分；ADR-0015、0016 的 Deciders 待定。
- 档 A 落地到 provital-platform：等 monorepo story，然后一个 PR 带上 `variants/layout-v2` 的内容。

---

## 第五部分：V2 实验（2026-11-04，16 次运行）

v2 在和 E1 相同的 4 个任务上各跑 2 次，两种用法都测：直接提示（和 A、B、C 同一个提示词，可直接比较），以及两段式 spec 工作流（harness 扮演批准者）。原始数据在 [results/summary.md](../results/summary.md) 的 "V2" 一节。

| 方案 | 成功 | 软测试 | 文档更新 | 写 ADR/CR | 平均成本 | 平均轮次 | 平均读文档 |
|---|---|---|---|---|---|---|---|
| C（E1） | 8/8 | 16/16 | 8/8 | 5 | $0.71 | 39 | 4.2 |
| v2 直接提示 | 8/8 | 16/16 | 8/8 | 4 | $1.36 | 61 | 9.9 |
| v2 spec 工作流 | 6/8 | 13/16 | 8/8 | 5 | $1.57 | 78 | 9.5 |

### 结论

1. **v2 直接提示的质量和 C 一样，留痕更准。** 16 次 v2 运行的 `pnpm ids` 和 `pnpm docs` 全部通过。ADR 只出现在真正的契约变更上（T2 的 ERP 读取、T6 的新事件）；C 曾为 T1 的一个新列写 ADR，v2 没有。16 次里没有一次多写变更记录，触发条件 5 的收窄有效。
2. **代价是成本约为 C 的 1.9 倍。** 8 次直接提示每次都写了 spec、plan 和 PR 正文，每次都读了模板。这就是"一个 story 一份 spec"的价格，约每个 story 多 0.65 美元。
3. **spec 工作流的 2 次失败来自同一条规则。** `implement` 规定"设计级 story 改设计要停下找批准者"。T6 发现批准的 spec 有排序错误，于是照错的实现；T3 发现 spec 自相矛盾，于是中途停下。两处都是实现细节，不是 API、契约或表结构。
4. **触发条件 2 仍然偏宽。** spec 工作流把只订阅已有事件的 T3 判成设计级 story，多写了一份 ADR。
5. **skill 引用了白名单外的命令。** spec 工作流平均被拒 8.5 次（E1 各方案约 3 次）：建分支、`gh api user`、带管道的 `pnpm check`。每次被拒都白耗轮次。
6. **第一版规则让 agent 拒绝直接需求。** 缺 Jira key 和 AC 时它停下来要信息。已改为"直接需求就一次做完，缺的东西在报告里列出，由 `pr-check` 在合并前拦截"，之后 8/8 成功。

### v2.1 的修订（还未做）

| 修订 | 针对 |
|---|---|
| `implement`：只有改公开 API、契约或表结构才停；实现细节的修正直接做，写进 Deviations | 结论 3 |
| 触发条件 2：订阅一个已有事件不算；只有新增或修改事件的名字、payload 才算 | 结论 4 |
| skill 不再要求建分支、查 GitHub 登录名；`settings.json` 允许 `git switch -c`、`git checkout -b`；提示用 `pnpm -s check` 而不是管道 | 结论 5 |
| 直接提示时 spec 改为可选：普通 story 只在 PR 正文写 "Design increment" 一节；设计级 story 仍写 spec | 结论 2 的成本 |

修订后建议重跑 V2 的 spec 工作流 8 次，再加 8 次"spec 可选"的直接提示，看成功率能否回到 8/8、成本能否降到 C 的 1.5 倍以内。

---

## 第六部分：v2.1 实验（2026-11-04，16 次运行）

v2.1 是 v2 加上第五部分的四项修订，放在 [variants/layout-v21](../variants/layout-v21/)，v2 保持原样以便对比。任务、重复次数和 harness 设置与 V2 相同。

| 方案 | 成功 | 软测试 | 平均成本 | 相对 C | 平均轮次 | 被拒命令 |
|---|---|---|---|---|---|---|
| C（E1） | 8/8 | 16/16 | $0.71 | 1.0 倍 | 39 | 3.5 |
| v2 直接提示 | 8/8 | 16/16 | $1.36 | 1.9 倍 | 61 | 5.2 |
| **v2.1 直接提示** | **8/8** | **16/16** | **$1.00** | **1.4 倍** | **43** | **2.0** |
| v2 spec 工作流 | 6/8 | 13/16 | $1.57 | 2.2 倍 | 78 | 7.2 |
| v2.1 spec 工作流 | 6/8 | 10/16 | $1.43 | 2.0 倍 | 76 | 2.2 |

### 结论

1. **四项修订都起了作用。**
   - 只为设计级 story 写 spec：T2、T6 写了，T1、T3 没写，分类全对。T1、T3 的成本已和 C 持平。
   - 订阅已有事件不再算设计级：4 次 T3 直接提示都没写 ADR。
   - 单条命令、不建分支：被拒命令从 5.2 次和 7.2 次降到约 2 次，低于 A、B、C。
   - 收窄"何时停下"：v2 时失败过的 T3 spec 工作流 2/2 成功。
2. **v2.1 发现了一个真实的需求矛盾。** T2 的一次运行写出 CR-001：任务要求每次调用都同步读 ERP 的顾问数据，而 T3-D-007 规定 ERP 数据从读副本读取。它把决定交给批准者和技术负责人。这正是触发条件 5 应该抓的情况；A、B、C 都没有留下这类记录。
3. **spec 工作流剩下的两次失败都在审批环节，都是 T6。** 一次是批准了 spec 但 ADR 仍是 Proposed；一次是批准者的回答（事件只带 ID）改了 spec 提议的事件契约，agent 按规则停下让批准者再看。harness 模拟的批准者只回答问题、不改 spec、不接受 ADR，真人批准时未必发生，但规则本身的歧义是真的。
4. **成本还剩 1.4 倍。** 多出的部分集中在设计级 story（T2、T6），它们仍写 spec 和 ADR。普通 story 已和 C 持平。

### 需要团队决定的一件事

**一次批准是否同时覆盖 spec 和它依赖的 ADR？** 建议"是"：批准者在 spec 上写 `Approved-by` 时，同时把 spec 引用的 ADR 设为 Accepted；如果回答改变了设计增量，由批准者自己改 spec。这样 3 人团队里一个设计级 story 只等一次人。确定后写进 `docs/adr/README.md` 和 `implement` skill。

### 建议

Sprint 2 默认用 v2.1 直接提示。设计级 story 可以选用 spec 工作流，前提是批准者按上面的规则批准。

### 实验中的环境问题

V21 跑到一半时，本机的 pnpm 缓存（`~/Library/pnpm/store`）被整个清空，当时系统盘只剩约 1.7 GB。harness 用离线安装，于是 11 次运行在搭建工作区时失败，没有进入 agent。我联网重新填充了缓存，补跑了这 11 次，失败的尝试没有计入结果。
