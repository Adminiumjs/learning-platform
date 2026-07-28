/*
 * Shared-component barrel. Screens import from here:
 *
 *   import { Card, Chip, EmptyState, Pill } from "../components";
 *
 * Importing the barrel also pulls in components.css, so a screen never has to
 * remember it. Screen-local styles still live at src/styles/screen-<view>.css
 * and are imported by the screen itself.
 */

import "../styles/components.css";

export { Icon, ICONS } from "./Icon";
export type { IconProps } from "./Icon";

export { Cover, CoverChip, PlayerShell } from "./Cover";
export type { CoverProps, CoverChipProps, PlayerShellProps } from "./Cover";

export {
  AttachmentChip,
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Callout,
  Card,
  CheckRow,
  Chip,
  ChipRow,
  EmptyState,
  FactRow,
  Field,
  IconButton,
  PageHead,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHead,
  SelectField,
  Segmented,
  Skel,
  StatGrid,
  StatTile,
  Tabs,
  TextArea,
  TextInput,
  Toggle,
} from "./Primitives";
export type {
  AttachmentChipProps,
  AvatarProps,
  ButtonProps,
  CalloutProps,
  CardProps,
  CheckRowProps,
  ChipProps,
  EmptyStateProps,
  FieldProps,
  PillProps,
  ProgressBarProps,
  ProgressRingProps,
  SegmentOption,
  SegmentedProps,
  SelectFieldProps,
  StatTileProps,
  TabOption,
  TabsProps,
  TextAreaProps,
  TextInputProps,
  Tone,
  ToggleProps,
} from "./Primitives";

export { Footer, Header, MobileSheet } from "./Header";
export { DemoDock } from "./DemoDock";
export { Modal, Toast } from "./Overlays";

export {
  BARE_VIEWS,
  BRAND,
  FOOTER_LINKS,
  INSTRUCTOR_SCREENS,
  STUDENT_SCREENS,
  navFor,
  screensFor,
} from "./chrome";
