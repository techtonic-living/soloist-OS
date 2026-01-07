# Soloist OS Layout Specification (Legacy)

> **Deprecated**: This document is a historical extraction from an older Figma layout and is **not representative of current goals and requirements**.
>
> **Current spec**: Use `docs/admin/LAYOUT_SPEC_V2.md` + `docs/DESIGN_SYSTEM.md` as the authoritative references.
>
> Keep this file only for archaeology when restoring older work.

## Overview

This specification documents the **Left Rail Slide Layout** and **Bottom Multi-Purpose Status/Task Bar** concepts, along with the **3×3 Master Grid Layout** extracted from the Figma design file.

---

## Design Tokens

### Colors
| Token           | Value     | Usage                                 |
| --------------- | --------- | ------------------------------------- |
| `bg-on-surface` | `#2C2C2C` | Primary background color for surfaces |
| `grid-border`   | `#393737` | Border color for grid elements        |
| `Default/White` | `#FFFFFF` | Text and accent color                 |

### Effects
| Token        | Properties                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `on-surface` | Glass effect (radius: 4px), Background blur (radius: 4px), Drop shadow (#E9D7D740, offset: 1px 1px, radius: 1px) |

---

## Master Grid Layout (3×3)

The viewport is organized into a **3×3 grid** with the following structure:

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER ROW                              │
├────────────┬──────────────────────────────────────┬─────────────┤
│ Header-Left│          Header-Main                 │ Header-Right│
│  (500px)   │        (flexible)                    │  (1332px)   │
├━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┼━━━━━━━━━━━━━┤
│            │                                      │             │
│ Left Rail  │          MAIN CONTENT                │ Right Panel │
│  (500px    │          (flexible)                  │  (1332px)   │
│  expanded) │                                      │             │
│            │                                      │             │
├━━━━━━━━━━━━┼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┼━━━━━━━━━━━━━┤
│ Footer-Left│          Footer-Main                 │ Footer-Right│
│  (500px)   │        (flexible)                    │  (1332px)   │
└────────────┴──────────────────────────────────────┴─────────────┘
```

### Grid Dimensions

| Region           | Width (Expanded) | Width (Collapsed)   | Height            |
| ---------------- | ---------------- | ------------------- | ----------------- |
| **Header Row**   | Full width       | Full width          | **150px** (fixed) |
| **Left Column**  | 500px            | 150px               | Flexible          |
| **Main Column**  | Flexible         | Flexible            | Flexible          |
| **Right Column** | 1332px           | 83px (chevron only) | Flexible          |
| **Footer Row**   | Full width       | Full width          | **150px** (fixed) |

---

## Header Row Specification

### Structure
```
┌─────────────┬──────────────────────────────────────┬─────────────┐
│ header-left │        header-main                   │header-right │
│   expanded  │      parent-container                │   container │
└─────────────┴──────────────────────────────────────┴─────────────┘
```

### Header-Left (Expanded State)
- **Total Width**: 500px
- **Height**: 150px

| Component               | Position   | Dimensions | Description            |
| ----------------------- | ---------- | ---------- | ---------------------- |
| `header-left-collapsed` | 0, 0       | 150×150px  | Logomark container     |
| `logomark`              | 32.5, 32.5 | 85×85px    | Brand logo icon        |
| `header-left-slideout`  | 150, 0     | 350×150px  | Slideout wordmark area |
| `workmark`              | 150, 51    | 322×48px   | Brand wordmark text    |

### Header-Main Parent Container
- **Width**: Flexible (2165px+ in examples)
- **Height**: 150px

| Component                      | Position  | Dimensions  | Description           |
| ------------------------------ | --------- | ----------- | --------------------- |
| `project-selector-container`   | 0, 0      | 322×150px   | Project dropdown      |
| `project-selector-placeholder` | 45, 45    | 266×70px    | Selector button       |
| `navigator-container`          | 322, 0    | remaining   | Breadcrumb navigation |
| `navigator-button-home`        | 50, 48.5  | 172×53px    | Home button           |
| `navigator-button-home-icon`   | 0, 0      | 46×46px     | Home icon             |
| `navigator-button-home-label`  | 76, 0     | 96×53px     | "Home" label          |
| `navigator-divider`            | 258, 56.2 | 16.4×37.6px | Separator             |
| `navigator-breadcrumbs`        | 310, 48.5 | 369×53px    | Breadcrumb trail      |

### Header-Right Container
- **Width**: 1332px
- **Height**: 150px

| Component                   | Position   | Dimensions | Description            |
| --------------------------- | ---------- | ---------- | ---------------------- |
| `ui-control-density-slider` | 40, 52.5   | 264×45px   | Density control        |
| `ui-control-zoom-slider`    | 338, 52.5  | 264×45px   | Zoom control           |
| `searchbar`                 | 638, 40    | 600×70px   | Global search          |
| `notifications-badge`       | 1282, 67.5 | 15×15px    | Notification indicator |

---

## Left Rail Sliding Panel

### States

#### Collapsed State
- **Width**: 150px
- **Contains**: Icon-only navigation

#### Expanded State
- **Width**: 500px
- **Animation**: Slides out from collapsed (350px slide distance)

### Left Rail Structure

```
┌────────────────────────┐
│    header-left (150px) │  ← Always visible
├────────────────────────┤
│   slideout (350px)     │  ← Slides in/out
└────────────────────────┘
```

### Left Rail - Collapsed Container
| Component             | Dimensions                    | Description   |
| --------------------- | ----------------------------- | ------------- |
| `left-rail-collapsed` | 150×(viewport height - 300px) | Icon column   |
| `nav-item-icon`       | 46×46px each                  | Tool icons    |
| Icon spacing          | 100px vertical                | Between icons |

### Left Rail - Slideout Container
| Component            | Dimensions                    | Description    |
| -------------------- | ----------------------------- | -------------- |
| `left-rail-slideout` | 350×(viewport height - 300px) | Labels area    |
| `nav-item-label`     | 180×53px                      | Tool name text |
| Label spacing        | 100px vertical                | Between labels |

### Slider Chevron Button
- **Position**: Centered vertically on right edge of left rail
- **Dimensions**: 52.5×52.5px
- **Offset from left edge**: ~124px when collapsed, ~474px when expanded
- **Animation**: Rotates 180° between states

---

## Bottom Status/Task Bar

### States

#### Collapsed State
- **Height**: 150px
- **Structure**: Single row with all three regions

#### Expanded State
- **Height**: Variable (expands upward)
- **Slideup panels** emerge from each region

### Footer Row Structure

```
┌───────────────┬─────────────────────────────┬──────────────────┐
│  footer-left  │        footer-main          │   footer-right   │
│   (500px)     │       (flexible)            │    (1332px)      │
└───────────────┴─────────────────────────────┴──────────────────┘
```

### Footer-Left (Collapsed)
- **Width**: 500px (150px icon area + 350px slideout)
- **Height**: 150px

| Component                    | Position  | Dimensions | Description          |
| ---------------------------- | --------- | ---------- | -------------------- |
| `footer-left-collapsed-icon` | 0, 0      | 150×150px  | Settings/action icon |
| `footer-left-slideout`       | 150, 0    | 350×150px  | Label area           |
| `slideout-label`             | 190, 48.5 | ~200×53px  | Action label text    |
| `slideout-chevron`           | 300, 69   | 24×12px    | Expand indicator     |

### Footer-Left (Expanded) - Slideup Panel
- **Width**: 348px
- **Item Height**: 100px
- **Maximum Items**: 4+ visible

| Component                | Dimensions | Description     |
| ------------------------ | ---------- | --------------- |
| `slideup-item`           | 348×100px  | Each action row |
| `item-label-container`   | 237×100px  | Text area       |
| `item-chevron-container` | 106×100px  | Chevron/action  |
| `item-label`             | ~180×23px  | Action text     |

### Footer-Main (Collapsed)
- **Width**: Flexible (2664px in examples)
- **Height**: 150px

| Component              | Position   | Dimensions | Description         |
| ---------------------- | ---------- | ---------- | ------------------- |
| `placeholder-label`    | 56, 48.5   | 264×53px   | Status label        |
| `placeholder-notation` | 350, 39    | ~2200×72px | Usage/notation area |
| `chevron-container`    | right edge | 83×150px   | Expand trigger      |
| `chevron-icon`         | 29, 69     | 24×12px    | Expand arrow        |

### Footer-Right (Collapsed)
- **Width**: 1332px
- **Height**: 150px

| Component              | Position   | Dimensions | Description    |
| ---------------------- | ---------- | ---------- | -------------- |
| `placeholder-label`    | 30, 48.5   | 288×53px   | Context label  |
| `placeholder-notation` | 348, 27    | 864×96px   | Details area   |
| `chevron-container`    | right edge | 83×150px   | Expand trigger |

---

## Animation Specifications

### Left Rail Slide Animation
```css
/* Slide out animation */
.left-rail-slideout {
  transform: translateX(-350px); /* collapsed */
  transition: transform 300ms ease-out;
}

.left-rail-slideout.expanded {
  transform: translateX(0); /* expanded */
}

/* Chevron rotation */
.rail-chevron {
  transition: transform 300ms ease-out;
}

.rail-chevron.collapsed {
  transform: rotate(0deg);
}

.rail-chevron.expanded {
  transform: rotate(180deg);
}
```

### Footer Slideup Animation
```css
/* Slide up animation */
.footer-slideup {
  transform: translateY(100%); /* collapsed */
  transition: transform 300ms ease-out;
}

.footer-slideup.expanded {
  transform: translateY(0); /* expanded */
}

/* Chevron rotation */
.footer-chevron {
  transition: transform 300ms ease-out;
}

.footer-chevron.collapsed {
  transform: rotate(0deg);
}

.footer-chevron.expanded {
  transform: rotate(180deg);
}
```

---

## Component Hierarchy Reference

```
master-layout-viewport-wrapper-flex-column
├── master-layout-header-flex-row1-fixed (150px height)
│   ├── header-left-expanded (500px)
│   │   ├── header-left-collapsed (150px) → logomark
│   │   └── header-left-slideout (350px) → workmark
│   ├── header-main-parent-container (flexible)
│   │   ├── project-selector-container
│   │   └── navigator-container
│   │       ├── navigator-button-home
│   │       ├── navigator-divider
│   │       ├── navigator-breadcrumbs
│   │       └── navigator-subtool-container
│   └── header-right-container (1332px)
│       ├── ui-control-density-slider
│       ├── ui-control-zoom-slider
│       ├── searchbar
│       └── notifications-badge
├── master-layout-body-flex-row2-stretch (flexible height)
│   ├── left-rail-container (150px-500px width)
│   │   ├── left-rail-collapsed → icons
│   │   └── left-rail-slideout → labels
│   ├── main-content-container (flexible)
│   │   ├── main-header-subnavigator
│   │   └── main-content-placeholder
│   └── right-panel-container (1332px)
│       └── right-panel-content
├── master-layout-footer-flex-row3-fixed (150px height)
│   ├── footer-left-container (500px)
│   │   ├── footer-left-collapsed
│   │   └── footer-left-slideup-panel
│   ├── footer-main-container (flexible)
│   │   ├── footer-main-collapsed
│   │   └── footer-main-slideup-panel
│   └── footer-right-container (1332px)
│       ├── footer-right-collapsed
│       └── footer-right-slideup-panel
└── master-layout-left-rail-slider-chevron (52.5×52.5px)
```

---

## Key Measurements Summary

| Element                      | Measurement |
| ---------------------------- | ----------- |
| Header height                | 150px       |
| Footer height                | 150px       |
| Left rail collapsed width    | 150px       |
| Left rail expanded width     | 500px       |
| Right panel width            | 1332px      |
| Slide distance (left rail)   | 350px       |
| Chevron button size          | 52.5×52.5px |
| Nav item icon size           | 46×46px     |
| Vertical spacing (nav items) | 100px       |
| Breadcrumb item height       | 53px        |
| UI control slider size       | 264×45px    |
| Searchbar size               | 600×70px    |
| Footer slideup item height   | 100px       |

---

## Figma File Reference

- **File URL**: [Figma Design File](https://www.figma.com/design/Epq6cB46Dq21rzYXE2QQbJ/Untitled?node-id=1-1033&m=dev)
- **Primary Container**: `Left Rail and Bottom Status Bar Slide Animations` (node 1:24)
- **7 Parent Frames**: Various viewport states demonstrating slide behaviors
