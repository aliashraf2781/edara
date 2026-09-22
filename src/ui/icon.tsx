import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Copy,
  Download,
  FileSpreadsheet,
  Filter,
  Globe,
  Inbox,
  Info,
  type LucideIcon,
  LogOut,
  Menu,
  Minus,
  Moon,
  Pencil,
  Plus,
  RefreshCw,
  School,
  Search,
  Shield,
  Sun,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react'
import { cn } from './cn'

/** One icon set, one stroke weight. Every screen draws from this list only. */
const ICONS = {
  search: Search,
  plus: Plus,
  minus: Minus,
  check: Check,
  close: X,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronEnd: ChevronRight,
  chevronStart: ChevronLeft,
  alert: AlertTriangle,
  info: Info,
  trash: Trash2,
  pencil: Pencil,
  copy: Copy,
  upload: Upload,
  download: Download,
  school: School,
  users: Users,
  user: User,
  ledger: BookOpen,
  sheet: FileSpreadsheet,
  chart: BarChart3,
  shield: Shield,
  logout: LogOut,
  sun: Sun,
  moon: Moon,
  globe: Globe,
  filter: Filter,
  clock: Clock,
  inbox: Inbox,
  menu: Menu,
  refresh: RefreshCw,
} as const satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  className?: string
  /** Icons are decorative unless given a label; then they are announced. */
  label?: string
  /** Arrows and chevrons mirror in RTL; search, filter and download do not. */
  directional?: boolean
}

export function Icon({ name, className, label, directional }: IconProps) {
  const IconComponent = ICONS[name]
  return (
    <IconComponent
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      data-directional={directional ? 'true' : undefined}
      strokeWidth={1.75}
      className={cn('size-5 shrink-0', className)}
    />
  )
}
