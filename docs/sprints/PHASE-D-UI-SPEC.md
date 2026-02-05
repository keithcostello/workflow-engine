# Phase D UI Specification

**Purpose**: Canonical spec for Phase D Web Workflow Builder and Project Status Dashboard. Defines screens, functions, and visual quality expectations.

**Scope**: Project status dashboard (with project selector and pending messages), workflow builder (list, detail, editors, graph, dual view).

**Relationship to Phase C**: Phase D extends the Phase C web-status-ui with project selector, pending messages, and adds workflow builder functionality.

---

## 1. Project Status Dashboard

### 1.1 Project Selector

- **Function**: User selects which project to view when multiple projects are running
- **Implementation**: Dropdown at top of dashboard, or sidebar list of projects
- **Behavior**: Selecting a project loads that project's status, pending gates, and last run
- **Indicators**: Status indicator per project (e.g., green dot = no pending, orange dot = pending gates)

### 1.2 Current Status

- **Function**: Display selected project's current phase, next steps, last run
- **Content**: Phase name, "Next" actions, last execution log summary (workflow name, status, end date)

### 1.3 Pending Messages

- **Function**: List all HITL gates awaiting user response for the selected project
- **Display**: Each item shows task ID, message text, and action buttons (Approve/Reject or Yes/No per HITL type)
- **Layout**: Prominent section; orange accent for pending items; scrollable if many

### 1.4 Layout

- **Top bar**: Project switcher dropdown; status badge (e.g., "2 pending"); optional "View Workflows" link
- **Main area**: Sections for Project List, Current Status, Pending Messages
- **Alternative**: Left sidebar (260px) with project list; main content shows selected project

---

## 2. Workflow Builder Screens

### 2.1 Workflow List

- **Function**: List all workflows from `workflows/` directory
- **Columns**: Workflow Name, Tasks (count), Last Run, Status
- **Layout**: Table with alternating row backgrounds; optional left sidebar

### 2.2 Workflow Detail (Read-Only)

- **Function**: View workflow YAML and role summary
- **Layout**: Two columns—left (60%) YAML code block with syntax highlighting; right (40%) role cards
- **Roles**: Each card shows role id, mode (agent/plan), description

### 2.3 Task Editor

- **Function**: Add or edit a task
- **Fields**: Name, Role (dropdown), Action, HITL Gate (type, message, options), On Complete (dropdown)
- **Layout**: Modal dialog; form layout with 12px spacing

### 2.4 Role Editor

- **Function**: Add or edit roles
- **Display**: Cards per role; mode badge (agent/plan); description; Edit link
- **Layout**: Horizontal card layout; dashed "Add Role" button

### 2.5 HITL Configuration Panel

- **Function**: Configure HITL gate for a task
- **Elements**: Type tabs (Approval, Question, Info, None); Message text area; Options (for Question); Auto-continue (for Info)
- **Layout**: Side panel ~320px wide

### 2.6 Visual Graph View

- **Function**: Show workflow as node diagram
- **Elements**: Nodes (task IDs); arrows (on_complete flow); HITL badge on nodes with HITL gates
- **Layout**: Horizontal left-to-right flow; light gray canvas

### 2.7 Dual View (Visual + YAML)

- **Function**: Split screen—visual graph left, YAML editor right
- **Toggle**: Visual | YAML | Both
- **Layout**: 50/50 split; vertical divider; top bar with Save, Validate

### 2.8 Empty State

- **Function**: Placeholder when no workflows exist
- **Display**: Dashed border, plus icon, "Add your first workflow"

---

## 3. Function Requirements

| # | Function | Required |
|---|----------|----------|
| 1 | Select project from multiple running projects | Yes |
| 2 | View pending HITL messages for selected project | Yes |
| 3 | List workflows from `workflows/` | Yes |
| 4 | View workflow YAML (read-only) | Yes |
| 5 | Edit workflow YAML | Yes |
| 6 | Add/edit/remove roles | Yes |
| 7 | Add/edit/remove tasks | Yes |
| 8 | Configure HITL (approval, question, info, none, ad-hoc) | Yes |
| 9 | Configure on_complete routing | Yes |
| 10 | Validate workflow before save | Yes |
| 11 | Visual graph view of workflow | Yes |
| 12 | Dual view (visual + YAML) | Yes |

---

## 4. Visual Quality Expectations (Nano Banana 2 Prompts)

The implemented UI should match these descriptions. Each prompt serves as acceptance criteria for look and feel.

### 4.1 Project Status Dashboard

**Prompt 1 — Project Selector View**
> Professional project status dashboard interface [subject], displaying project selector dropdown at top with label "Project", options orchestration-training and other-project, main area showing selected project name and status summary [action], white background, top navigation bar with project selector, main content area below [environment], soft diffused office lighting [lighting], minimal dashboard design, clean dropdown with light gray border [style], high resolution sharp focus, readable dropdown text [quality], avoid: cluttered layout, dark mode, distorted text, extra limbs [exclusions]

**Prompt 2 — Multiple Projects Sidebar**
> Project status dashboard interface [subject], displaying left sidebar with project list showing orchestration-training, other-project, third-project as selectable rows with status indicators green dot or orange dot [action], light gray sidebar 260px wide, main content area showing selected project details [environment], soft diffused lighting [lighting], minimal sidebar navigation design, hover state on project rows [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 3 — Full View with Pending Messages**
> Project status dashboard interface [subject], displaying project selector at top, Current Status section with Phase C Complete Next Phase D, Pending Messages section with orange alert box showing "piece_2_user_uat: Approve to proceed to Piece 3?" and Approve Reject buttons [action], white background, stacked sections with clear headers, prominent pending messages area [environment], soft diffused lighting [lighting], minimal dashboard design, orange accent for pending items [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 4 — Pending Messages Panel**
> Pending messages panel interface [subject], displaying list of pending HITL gates with task ID, message text, and Approve Reject or Yes No buttons per row [action], white card on light gray background, scrollable list layout [environment], soft diffused lighting [lighting], minimal alert panel design, orange left border on pending items [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 5 — Compact Header**
> Dashboard header interface [subject], displaying project switcher dropdown showing "orchestration-training" with chevron, status badge "2 pending" in orange, and View Workflows link [action], white header bar 56px tall, horizontal layout [environment], soft diffused lighting [lighting], minimal header design, compact dropdown [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 6 — Full Dashboard Three-Column**
> Project status dashboard interface [subject], displaying top bar with project dropdown orchestration-training, status badge 2 pending, left section Project List with orchestration-training and other-project, center section Current Status with Phase C Complete and Last Run details, right section Pending Messages with two items requiring approval [action], white background, three-column layout with project list left, status center, pending right [environment], soft diffused office lighting [lighting], minimal dashboard design, clear section dividers [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 7 — Project Dropdown Expanded**
> Dropdown menu interface [subject], displaying expanded project list with orchestration-training selected with checkmark, other-project, third-project as options, each with small status indicator [action], white dropdown panel with light shadow, below header bar [environment], soft diffused lighting [lighting], minimal dropdown design, 8px padding per row [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 8 — Single Pending Message Card**
> Message card interface [subject], displaying single pending approval with task name piece_2_user_uat, message "Code review and AI UAT passed. Proceed to Piece 3?" and Approve Reject buttons [action], white card with orange left border 4px, on light gray background [environment], soft diffused lighting [lighting], minimal card design, clear typography [style], high resolution sharp focus [quality], avoid: cluttered layout, distorted text [exclusions]

### 4.2 Workflow Builder

**Prompt 9 — Workflow List**
> Professional workflow management interface [subject], displaying a data table with columns "Workflow Name", "Tasks", "Last Run", "Status" and rows for minimal-workflow, phase-c-web-status-ui, docker-hello-workflow [action], desktop browser window with light gray background #f5f5f5, left sidebar 240px wide in dark charcoal #2d2d2d with white text [environment], soft diffused office lighting [lighting], minimal flat design Figma-style UI, clean typography 14px system font, alternating row backgrounds [style], high resolution sharp focus, detailed UI elements [quality], avoid: cluttered layout, dark mode, extra limbs, blurry text [exclusions]

**Prompt 10 — Workflow Detail Read-Only**
> Web application editor interface [subject], showing split layout with YAML code block on left showing workflow syntax highlighting and right panel with role cards for developer, reviewer, validator [action], white background desktop view, two-column layout 60/40 split [environment], neutral soft lighting [lighting], developer IDE aesthetic, monospace code font, dark code theme #1e1e1e with blue keys and green strings [style], high resolution sharp focus, readable code text [quality], avoid: cluttered elements, distorted text, anatomical errors [exclusions]

**Prompt 11 — Task Editor Modal**
> Modal dialog form interface [subject], displaying form fields for Name, Role dropdown, Action input, HITL Gate section with Approval Question Info None radio buttons, Message text area, On Complete dropdown [action], white modal background with soft shadow, centered on gray overlay [environment], soft diffused light [lighting], clean form design Notion-style, 12px spacing between fields, blue Save button [style], high resolution sharp focus, detailed form elements [quality], avoid: cluttered layout, dark mode, blurry text, extra fingers [exclusions]

**Prompt 12 — Role Editor**
> Role configuration panel interface [subject], showing three white cards in a row each with role name developer reviewer validator, mode badge agent or plan, and description text [action], light gray background #f5f5f5, horizontal card layout [environment], soft diffused lighting [lighting], minimal card-based design, 8px rounded corners, 1px light gray borders [style], high resolution sharp focus [quality], avoid: cluttered elements, dark colors, distorted text [exclusions]

**Prompt 13 — Visual Graph View**
> Node-based workflow diagram interface [subject], displaying horizontal flow of connected nodes labeled setup_git validate_git piece_1 piece_1_code_review piece_1_ai_uat piece_1_user_uat piece_2 with arrows between them [action], light gray canvas background, left-to-right flow layout [environment], soft even lighting [lighting], clean Miro-style diagram, white rounded rectangle nodes, gray connecting arrows, orange HITL badge on one node [style], high resolution sharp focus, detailed diagram [quality], avoid: 3D effects, cluttered nodes, distorted text, extra limbs [exclusions]

**Prompt 14 — HITL Configuration Panel**
> Side panel settings interface [subject], showing HITL Gate title, tabs for Approval Question Info None, Message text area with placeholder text, Options input, Auto-continue checkbox [action], white panel 320px wide on light gray background [environment], soft diffused lighting [lighting], clean settings panel design, minimal form layout [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, blurry text [exclusions]

**Prompt 15 — Dual View Split Screen**
> Split-screen IDE interface [subject], left showing workflow node diagram with connected nodes, right showing dark YAML code editor with syntax highlighting [action], 50/50 split layout, vertical divider, top bar with workflow name and Save Validate buttons [environment], soft diffused lighting [lighting], modern IDE aesthetic, flat design [style], high resolution sharp focus [quality], avoid: cluttered elements, dark mode on left panel, distorted code [exclusions]

**Prompt 16 — Project Status Dashboard (Original)**
> Project status dashboard interface [subject], displaying Project List section with orchestration-training bullet and PENDING GATE orange badge, Pending Gates section, Project detail section with markdown-style headers and bullet lists [action], white background, documentation-style layout [environment], soft diffused lighting [lighting], minimal documentation aesthetic, monospace pre-style typography [style], high resolution sharp focus [quality], avoid: cluttered layout, dark mode, distorted text [exclusions]

**Prompt 17 — Empty State**
> Empty state interface [subject], showing placeholder for new workflow with dashed border rectangle, plus icon, text "Add your first workflow" [action], light gray background #f5f5f5, centered layout [environment], soft diffused lighting [lighting], minimal onboarding design, clean typography [style], high resolution sharp focus [quality], avoid: cluttered elements, dark colors, extra limbs [exclusions]

### 4.3 Negative Prompt (All Screens)

Use this exclusion list for all UI screens:

> blurry, low-res, extra fingers, deformed hands, anatomical errors, text distortion, watermarks, cluttered, noisy, messy layout, dark mode, 3D effects, photorealistic

---

## 5. Usage for UAT

- Compare implemented UI to each prompt description
- Verify function requirements checklist
- Reject if implemented UI deviates significantly from described look and feel
