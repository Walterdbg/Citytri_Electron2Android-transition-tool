# Citytri Shipment Tracker — Tablet and Mobile UI Protocol

## Purpose

Transform the existing Citytri Shipment Tracker interface into a usable tablet and mobile interface while preserving the application’s existing desktop behavior, workflows, validation rules, state management, and data operations.

This is not a request to shrink the desktop interface until it fits inside a narrow viewport. It is a request to reorganize the same application into deliberate tablet and mobile working layouts.

The primary target is a tablet in portrait orientation. Mobile is the narrower design case used to ensure that the interface reflows correctly. The existing desktop interface must continue to work.

## Non-Negotiable Desktop Boundary

No part of this requirement may change the desktop application’s existing behavior.

The tablet and mobile implementation must be additive and strictly scoped to the applicable responsive ranges. It must not alter the accepted desktop:

- Layout or dimensions.
- Sidebar presentation or behavior.
- Record-table presentation.
- Record-opening and record-closing behavior.
- Scroll behavior.
- Control placement.
- Workflow order.
- Search, filtering, or selection behavior.
- Validation, draft, save, logging, or persistence behavior.
- Keyboard interaction.
- Existing labels, statuses, or available actions.
- Any existing or future addition to the desktop application.

Do not use the responsive work as an opportunity to refactor, clean up, rename, relocate, or redesign desktop components.

If shared code must be touched to support tablet or mobile presentation, its desktop output and behavior must remain functionally and visually identical. Prove this with desktop regression testing before calling the work complete.

Desktop behavior is the protected baseline. Tablet and mobile must adapt from it without modifying it.

## Image References

The user will add the approved reference images to this document later.

- `[INSERT: Current desktop — sidebar visible]`
- `[INSERT: Current desktop — sidebar hidden]`
- `[INSERT: Current desktop — records list]`
- `[INSERT: Current desktop — record expanded correctly in place]`
- `[INSERT: Current broken mobile default state]`
- `[INSERT: Current broken mobile record-opening behavior]`
- `[INSERT: Proposed mobile landing state]`
- `[INSERT: Proposed mobile list state]`
- `[INSERT: Proposed tablet landing state]`
- `[INSERT: Proposed tablet list state]`

The images illustrate the intent. The behavioral requirements in this document remain authoritative.

## Core Instruction

Preserve the application logic and transform the presentation for the available screen.

This transformation applies only to tablet and mobile responsive ranges. At desktop widths, the application must continue to render and behave exactly as it did before this work.

Do not:

- Rebuild the application.
- Replace established workflows.
- duplicate business logic for each screen size.
- Introduce a separate mobile data model or persistence path.
- Remove fields, actions, validations, statuses, filters, or workflow controls merely to make the layout fit.
- Treat horizontal scrolling or clipped content as an acceptable responsive solution.
- Compress the desktop table into narrow columns that wrap words vertically.
- Reintroduce behaviors that were previously corrected.

Use the same source of truth, application state, handlers, validation, persistence, and business rules across desktop, tablet, and mobile. Only the presentation and arrangement should change where necessary.

## Preserve Existing Behavior Before Changing CSS

Before implementation, trace the current renderer and identify:

- The component that controls sidebar visibility.
- The state that stores whether a record is open.
- The handler that opens and closes a record.
- The current mechanism that keeps an expanded record directly beneath its row.
- Every breakpoint and media query currently affecting the page.
- Any phone- or tablet-specific code that replaces, resets, or remounts the records component.
- Any `scrollIntoView`, focus, anchor, route, key, remount, or scroll-restoration logic triggered when a record opens.

Do not remove working behavior and recreate an approximation. Reuse the established behavior at every viewport.

## Existing Behaviors That Must Remain

### Hideable event sidebar

The event sidebar is already hideable on desktop.

When visible, it provides the selected event’s identity, navigation, shipping state, status summary, and workflow controls. When hidden, the main working area uses the released space.

The same capability must exist on tablet and mobile. The content may be presented as a full-width event panel instead of a narrow physical sidebar, but it remains the same event workspace and uses the same state and controls.

### Records open in place

Selecting a runner must expand that runner’s details directly beneath the selected row or card.

Opening or closing a record must not:

- Jump to the top of the page.
- Jump to the top of the records section.
- Reset the records list.
- change the active filters.
- change the search query.
- Replace the list with a different screen.
- Require the user to find the selected runner again.

The selected row/card must remain the visual anchor. Expanding it inserts the detail immediately below it. Closing it returns the user to the same position.

This behavior already exists in the accepted desktop implementation. Reapply it to tablet and mobile. Do not implement a new phone-specific record-opening path that restores the earlier undesirable jump.

### Existing GUI and business rules

All already-implemented rules remain in force, including but not limited to:

- Data loading and file operations.
- Search and filtering.
- Distance filters.
- Runner selection and bulk selection.
- Address review and editing.
- STAMPS validation behavior.
- Shipment information and status.
- Item display and editing.
- Audit and exception logging.
- Validation and save behavior.
- Unsaved-change protection, where applicable.
- Existing labels, status meanings, and workflow order.

Responsive work must not silently simplify, bypass, or change these rules.

## Responsive Strategy

Implement one shared application with purposeful layouts for three ranges:

1. Desktop: preserve the accepted desktop experience.
2. Tablet: primary new working layout.
3. Mobile: narrow, touch-first layout.

Breakpoint values must be chosen from the actual component behavior and tested widths, not from arbitrary device names alone. CSS media queries may control layout, but JavaScript must not create conflicting business behavior based only on viewport width.

Recommended validation viewports:

| Mode | Portrait validation size | Purpose |
| --- | ---: | --- |
| Mobile small | 360 × 800 CSS px | Narrow supported phone |
| Mobile standard | 390 × 844 CSS px | Primary phone validation |
| Mobile large | 412 × 915 CSS px | Larger Android-style phone |
| Tablet portrait | 768 × 1024 CSS px | Primary tablet validation |
| Tablet portrait large | 820 × 1180 CSS px | Larger tablet validation |
| Tablet landscape | 1024 × 768 CSS px | Rotation validation |

Do not identify a mode from orientation alone. A resized desktop window and a tablet of similar width must receive a usable layout.

## Two Primary Working States

Tablet and mobile must provide two clear working states within the selected event.

### State 1 — Event workspace / landing state

When the user enters an event, the event information area is presented as the primary workspace.

It contains the existing event sidebar information:

- Event name and date.
- Linked-event information.
- All Events.
- Calendar.
- Folder.
- Shipping status.
- Mark Closed.
- Pre-Event and Post-Event controls.
- Status summary.
- Refresh.
- Workflow steps.

On tablet and mobile, this should use the available width as a purposeful panel. Do not reproduce the desktop sidebar as a narrow strip centered inside the screen.

The records list and expanded runner details must not be squeezed beside this panel.

The existing menu/sidebar control hides this event workspace and reveals the operational list state. It must also provide a clear way to reopen the event workspace.

### State 2 — Operational list state

After the event workspace is hidden, the user works with:

- Source files and file actions.
- Search.
- Record filters.
- Distance filters.
- Record count.
- Bulk-selection action.
- Runner records.
- Inline expanded runner details.

The operational workspace should use the full available width.

The event workspace must not continue consuming invisible layout width after it is hidden.

## Tablet Layout — Primary Target

Tablet portrait must be treated as a first-class working environment, not as an enlarged phone or a compressed desktop.

### Tablet event workspace

- Use the tablet width instead of preserving the desktop sidebar width.
- Event navigation and shipping controls may occupy the upper section.
- Status and Workflow may use two balanced columns when the width permits.
- All controls must be touch-sized and readable.
- No overlapping labels or clipped buttons.
- No unnecessary empty area created by forcing desktop dimensions.

### Tablet operational workspace

The source-file area may remain visible but must reflow cleanly. Actions may occupy one or two deliberate rows. Do not allow the controls to wrap unpredictably or extend outside the viewport.

The records area should use a readable table/list hybrid. Preserve useful scanning without retaining every desktop column.

The collapsed tablet record should prioritize:

- Selection checkbox.
- BIB.
- Runner name.
- Placing/division summary.
- Items.
- Address status.
- Shipment status.

Email and other secondary information may appear only in the expanded detail if the available width cannot support them legibly.

The entire collapsed record remains selectable, except for controls whose own action must not open the record.

### Tablet expanded record

- Expand immediately beneath the selected record.
- Use the full records-container width.
- Use a responsive two-column field grid where it improves readability.
- Allow important or long fields to span the full width.
- Stack sections when their minimum usable widths cannot be maintained.
- Preserve every existing field and action.
- Keep status banners, labels, inputs, buttons, and shipment information inside the viewport.
- Do not require horizontal scrolling to complete the normal workflow.

## Mobile Layout

Mobile must be designed as a focused vertical working interface.

### Mobile event workspace

- Use nearly the full viewport width with reasonable page margins.
- Present the event information in a clear vertical order.
- Use touch-sized controls.
- Allow related controls to share a row only when each remains readable and operable.
- Stack them when necessary.
- Do not show the records table behind or beside the event workspace.

### Mobile operational workspace

The source-file tools should not dominate the initial mobile list view. Present them as a compact collapsible section or another compact control that exposes all existing actions when opened.

Search must be prominent and usable. Filters may wrap into deliberate rows or open through a compact filter control. The active filters must remain visible and understandable.

Do not display the desktop records table on mobile.

Use full-width runner cards. A collapsed card should prioritize:

- Selection checkbox.
- BIB.
- Runner name.
- Race, division, or placing summary.
- Address status.
- Shipment status.
- A clear expand/collapse affordance.

Secondary data belongs in the expanded content rather than in narrow columns.

### Mobile expanded record

- Expand directly beneath the selected card.
- Preserve the page position and selected card as the scroll anchor.
- Use a single-column form by default.
- Allow two fields on one row only when both remain comfortably usable, such as State and ZIP.
- Inputs and buttons must use the available width.
- Long banners and explanatory text must wrap normally.
- No content may be cut off on the right.
- No horizontal page scrolling.
- No desktop minimum width may remain on the expanded component.
- All existing record functions must remain available.

## Usability Requirements

### Touch interaction

- Interactive targets should be comfortably touchable, generally at least 44 × 44 CSS px where practical.
- Provide visible spacing between unrelated controls.
- Do not depend on hover to reveal required information or actions.
- Focus states must remain visible for keyboard and accessibility support.

### Text and content

- Do not solve width problems by reducing text to an unreadable size.
- Do not allow words, labels, status chips, or values to wrap one or two characters per line.
- Do not truncate information required to identify a runner or complete an action.
- Status labels must remain understandable without relying only on color.

### Overflow

- The page and principal working panels must not overflow horizontally at supported widths.
- Internal horizontal scrolling should not be used for the normal record workflow.
- If a genuinely tabular secondary report requires horizontal scrolling, isolate it intentionally and do not apply that exception to the primary runner list or edit form.

### Scroll stability

Dynamic layout changes must respect the user’s current working position.

- Do not call `scrollIntoView` automatically when opening a record unless a specific accessibility requirement demands it and the resulting motion has been approved.
- Do not focus a newly rendered field in a way that moves the page unexpectedly.
- Do not remount the entire records component when the selected record changes.
- Use stable record keys.
- Do not reset a scroll container as a side effect of responsive rendering.
- If layout measurement is required, preserve the selected row/card’s visual position before and after expansion.

## Layout Implementation Principles

- Prefer CSS Grid and Flexbox with explicit minimum sizes and wrapping behavior.
- Remove or override desktop `min-width` values at the appropriate breakpoints.
- Use `minmax(0, 1fr)` where grid children otherwise force overflow.
- Allow flex and grid children containing text to shrink with `min-width: 0`.
- Use shared components and shared handlers.
- Conditional rendering may change how information is grouped, but must not create a second implementation of record state, validation, or persistence.
- Do not use viewport detection to discard and recreate stateful components during a resize or orientation change.
- Rotating the device must preserve the selected event, sidebar state where reasonable, filters, search, open record, draft data, and scroll context.

## Desktop Protection

The accepted desktop interface is not part of the redesign and must not be changed.

- Preserve the hideable sidebar behavior.
- Preserve the full desktop record table where it remains usable.
- Preserve inline expansion beneath the selected row.
- Preserve the current controls and workflow.
- Responsive changes must not cause desktop regressions at standard or resized desktop widths.

Do not solve tablet/mobile issues with global CSS, shared markup changes, handler changes, state changes, or component replacements that alter the established desktop application intentionally or unintentionally.

All new responsive presentation rules must be scoped so that they are inactive at desktop widths. Desktop must not depend on the new mobile card layout, mobile event panel, compact file controls, or tablet field arrangement.

## Required Implementation Sequence

1. Trace and document the current responsive CSS and record-expansion behavior.
2. Identify why the existing phone code compresses the desktop table.
3. Identify why opening a record on phone changes the scroll position.
4. Preserve the existing shared state and handlers.
5. Implement the tablet event workspace and operational list state.
6. Implement the tablet expanded-record layout.
7. Implement the mobile event workspace and operational list state.
8. Implement the mobile card and expanded-record layout.
9. Test rotation and resizing without losing state or position.
10. Verify that desktop behavior remains unchanged.

Do not declare completion after applying media queries alone. Completion requires real interaction testing at each target viewport.

## Acceptance Tests

### State and navigation

- Opening an event on tablet and mobile presents a usable event workspace.
- Hiding the event workspace reveals the full operational workspace.
- Reopening it preserves the selected event and current application state.
- Hiding the panel releases its occupied width completely.

### Records

- Tablet records are readable without horizontal page scrolling.
- Mobile records appear as readable cards, not compressed desktop rows.
- Selecting BIB 2002 expands BIB 2002 directly beneath its row/card.
- The viewport does not jump to the top of the page or records list.
- Closing BIB 2002 returns to the same working position.
- Opening another runner does not reset search, filters, distance, or selection state.
- Record details and controls fit inside the viewport.

### Responsive continuity

- The open record remains open when rotating between supported portrait and landscape layouts.
- Unsaved data is not lost during resize or rotation.
- No responsive transition causes an unintended save, reload, remount, or navigation.
- The sidebar, search, filters, selection, and record-expansion rules behave consistently across modes.

### Layout quality

- No supported viewport has clipped right-side content.
- No primary workflow requires horizontal scrolling.
- No label or value becomes a vertical stack of short fragments.
- Buttons remain readable and touchable.
- Controls have a deliberate order rather than accidental CSS wrapping.
- The screen width is used effectively without large unexplained margins.

### Regression

- Before-and-after desktop screenshots match except for data that naturally changed during testing.
- Desktop interaction behavior matches the protected baseline.
- Desktop sidebar visible state remains correct.
- Desktop sidebar hidden state remains correct.
- Desktop inline record expansion remains correct.
- Existing file actions, filters, editing, validation, saving, and logging still work.
- Removing or disabling the new tablet/mobile responsive layer restores the same desktop application because desktop never depended on that layer.

## Required Completion Report

After implementation, report:

- The breakpoint ranges used and why.
- Which components change presentation at each range.
- Which state and handlers remain shared.
- The cause of the previous compressed mobile layout.
- The cause of the mobile scroll jump when opening a record.
- How record expansion now preserves the working position.
- How tablet and mobile avoid horizontal overflow.
- How resize and rotation preserve state and unsaved work.
- Every file changed.
- The viewports and interactions actually tested.
- Any remaining limitation, stated explicitly.

Do not describe the work as complete if only static screenshots were checked. Test the real controls and workflow.
