'use client';

import React from 'react';
import {
  // Navigation & Layout
  Dashboard,
  Home,
  Menu as MenuIcon,
  List as ListIcon,
  GridOn,
  ViewList,
  ViewModule,
  Widgets,
  Apps,

  // People & Users
  People,
  Person,
  PersonAdd,
  Group,
  Groups,
  SupervisedUserCircle,
  AccountCircle,
  ManageAccounts,

  // Admin & Security
  AdminPanelSettings,
  Security,
  Lock,
  LockOpen,
  VpnKey,
  Shield,
  VerifiedUser,
  Policy,

  // Business & Organization
  Business,
  BusinessCenter,
  CorporateFare,
  AccountTree,
  Folder,
  FolderOpen,
  FolderSpecial,
  Work,
  WorkOutline,

  // Documents & Files
  Description,
  Article,
  Assignment,
  AssignmentInd,
  AssignmentTurnedIn,
  InsertDriveFile,
  FileCopy,
  AttachFile,
  CloudUpload,
  CloudDownload,

  // Communication
  Message,
  Chat,
  Forum,
  Email,
  Send,
  Notifications,
  NotificationsActive,
  Announcement,
  Campaign,

  // Settings & Tools
  Settings,
  SettingsApplications,
  Build,
  Construction,
  Tune,
  DisplaySettings,
  AppSettingsAlt,

  // Analytics & Reports
  Assessment,
  Analytics,
  BarChart,
  PieChart,
  ShowChart,
  TrendingUp,
  TrendingDown,
  Insights,
  Leaderboard,

  // Development & Code
  Code,
  DataObject,
  Terminal,
  IntegrationInstructions,
  Api,
  DeveloperMode,
  BugReport,

  // Education & Learning
  School,
  MenuBook,
  AutoStories,
  Quiz,
  Psychology,

  // Design & Creative
  Palette,
  Brush,
  ColorLens,
  FormatPaint,
  DesignServices,

  // Help & Support
  Help,
  HelpOutline,
  HelpCenter,
  Support,
  SupportAgent,
  LiveHelp,
  ContactSupport,
  QuestionAnswer,

  // Links & Navigation
  Link,
  Launch,
  OpenInNew,
  ExitToApp,
  Logout,
  Login,

  // Status & Info
  Info,
  Warning,
  Error,
  CheckCircle,
  Cancel,
  Block,

  // Calendar & Time
  CalendarToday,
  Event,
  Schedule,
  AccessTime,
  History,

  // Shopping & Commerce
  ShoppingCart,
  Store,
  Storefront,
  Receipt,
  Payment,
  CreditCard,

  // Media
  Image,
  Photo,
  VideoLibrary,
  AudioFile,

  // Misc
  Star,
  Bookmark,
  Label,
  LocalOffer,
  Category,
  Extension,
  Inventory,
  Inventory2,
  Storage,
  Memory,
  Speed,
  Language,
  Public,
  Map,
  Place,
  LocationOn,
  Explore,

  // Arrows & Actions
  ArrowForward,
  ArrowBack,
  ArrowUpward,
  ArrowDownward,
  ExpandMore,
  ExpandLess,
  ChevronRight,
  ChevronLeft,

  // Edit & Create
  Edit,
  Add,
  Remove,
  Delete,
  Save,
  Refresh,
  Sync,

  // Table & Data
  TableChart,
  TableRows,
  ViewColumn,
  FilterList,
  Sort,
  Search
} from '@mui/icons-material';

/**
 * Comprehensive icon map for menu system
 * Icons are synchronized with ICON_TYPE codes in the database
 *
 * To add new icons:
 * 1. Import the icon from '@mui/icons-material'
 * 2. Add it to this iconMap with the exact name as the key
 * 3. Add the same icon name to ICON_TYPE codes in the database
 */
export const iconMap: Record<string, React.ReactElement> = {
  // Navigation & Layout
  Dashboard: <Dashboard />,
  Home: <Home />,
  Menu: <MenuIcon />,
  List: <ListIcon />,
  GridOn: <GridOn />,
  ViewList: <ViewList />,
  ViewModule: <ViewModule />,
  Widgets: <Widgets />,
  Apps: <Apps />,

  // People & Users
  People: <People />,
  Person: <Person />,
  PersonAdd: <PersonAdd />,
  Group: <Group />,
  Groups: <Groups />,
  SupervisedUserCircle: <SupervisedUserCircle />,
  AccountCircle: <AccountCircle />,
  ManageAccounts: <ManageAccounts />,

  // Admin & Security
  AdminPanelSettings: <AdminPanelSettings />,
  Security: <Security />,
  Lock: <Lock />,
  LockOpen: <LockOpen />,
  VpnKey: <VpnKey />,
  Shield: <Shield />,
  VerifiedUser: <VerifiedUser />,
  Policy: <Policy />,

  // Business & Organization
  Business: <Business />,
  BusinessCenter: <BusinessCenter />,
  CorporateFare: <CorporateFare />,
  AccountTree: <AccountTree />,
  Folder: <Folder />,
  FolderOpen: <FolderOpen />,
  FolderSpecial: <FolderSpecial />,
  Work: <Work />,
  WorkOutline: <WorkOutline />,

  // Documents & Files
  Description: <Description />,
  Article: <Article />,
  Assignment: <Assignment />,
  AssignmentInd: <AssignmentInd />,
  AssignmentTurnedIn: <AssignmentTurnedIn />,
  InsertDriveFile: <InsertDriveFile />,
  FileCopy: <FileCopy />,
  AttachFile: <AttachFile />,
  CloudUpload: <CloudUpload />,
  CloudDownload: <CloudDownload />,

  // Communication
  Message: <Message />,
  Chat: <Chat />,
  Forum: <Forum />,
  Email: <Email />,
  Send: <Send />,
  Notifications: <Notifications />,
  NotificationsActive: <NotificationsActive />,
  Announcement: <Announcement />,
  Campaign: <Campaign />,

  // Settings & Tools
  Settings: <Settings />,
  SettingsApplications: <SettingsApplications />,
  Build: <Build />,
  Construction: <Construction />,
  Tune: <Tune />,
  DisplaySettings: <DisplaySettings />,
  AppSettingsAlt: <AppSettingsAlt />,

  // Analytics & Reports
  Assessment: <Assessment />,
  Analytics: <Analytics />,
  BarChart: <BarChart />,
  PieChart: <PieChart />,
  ShowChart: <ShowChart />,
  TrendingUp: <TrendingUp />,
  TrendingDown: <TrendingDown />,
  Insights: <Insights />,
  Leaderboard: <Leaderboard />,

  // Development & Code
  Code: <Code />,
  DataObject: <DataObject />,
  Terminal: <Terminal />,
  IntegrationInstructions: <IntegrationInstructions />,
  Api: <Api />,
  DeveloperMode: <DeveloperMode />,
  BugReport: <BugReport />,

  // Education & Learning
  School: <School />,
  MenuBook: <MenuBook />,
  AutoStories: <AutoStories />,
  Quiz: <Quiz />,
  Psychology: <Psychology />,

  // Design & Creative
  Palette: <Palette />,
  Brush: <Brush />,
  ColorLens: <ColorLens />,
  FormatPaint: <FormatPaint />,
  DesignServices: <DesignServices />,

  // Help & Support
  Help: <Help />,
  HelpOutline: <HelpOutline />,
  HelpCenter: <HelpCenter />,
  Support: <Support />,
  SupportAgent: <SupportAgent />,
  LiveHelp: <LiveHelp />,
  ContactSupport: <ContactSupport />,
  QuestionAnswer: <QuestionAnswer />,

  // Links & Navigation
  Link: <Link />,
  Launch: <Launch />,
  OpenInNew: <OpenInNew />,
  ExitToApp: <ExitToApp />,
  Logout: <Logout />,
  Login: <Login />,

  // Status & Info
  Info: <Info />,
  Warning: <Warning />,
  Error: <Error />,
  CheckCircle: <CheckCircle />,
  Cancel: <Cancel />,
  Block: <Block />,

  // Calendar & Time
  CalendarToday: <CalendarToday />,
  Event: <Event />,
  Schedule: <Schedule />,
  AccessTime: <AccessTime />,
  History: <History />,

  // Shopping & Commerce
  ShoppingCart: <ShoppingCart />,
  Store: <Store />,
  Storefront: <Storefront />,
  Receipt: <Receipt />,
  Payment: <Payment />,
  CreditCard: <CreditCard />,

  // Media
  Image: <Image />,
  Photo: <Photo />,
  VideoLibrary: <VideoLibrary />,
  AudioFile: <AudioFile />,

  // Misc
  Star: <Star />,
  Bookmark: <Bookmark />,
  Label: <Label />,
  LocalOffer: <LocalOffer />,
  Category: <Category />,
  Extension: <Extension />,
  Inventory: <Inventory />,
  Inventory2: <Inventory2 />,
  Storage: <Storage />,
  Memory: <Memory />,
  Speed: <Speed />,
  Language: <Language />,
  Public: <Public />,
  Map: <Map />,
  Place: <Place />,
  LocationOn: <LocationOn />,
  Explore: <Explore />,

  // Arrows & Actions
  ArrowForward: <ArrowForward />,
  ArrowBack: <ArrowBack />,
  ArrowUpward: <ArrowUpward />,
  ArrowDownward: <ArrowDownward />,
  ExpandMore: <ExpandMore />,
  ExpandLess: <ExpandLess />,
  ChevronRight: <ChevronRight />,
  ChevronLeft: <ChevronLeft />,

  // Edit & Create
  Edit: <Edit />,
  Add: <Add />,
  Remove: <Remove />,
  Delete: <Delete />,
  Save: <Save />,
  Refresh: <Refresh />,
  Sync: <Sync />,

  // Table & Data
  TableChart: <TableChart />,
  TableRows: <TableRows />,
  ViewColumn: <ViewColumn />,
  FilterList: <FilterList />,
  Sort: <Sort />,
  Search: <Search />
};

/**
 * Get icon component by name
 * @param iconName - Name of the icon (e.g., "Dashboard", "People")
 * @param fallback - Optional fallback icon component (defaults to Dashboard)
 * @returns React element for the icon
 */
export function getMenuIcon(iconName: string | undefined | null, fallback?: React.ReactElement): React.ReactElement {
  if (!iconName) {
    return fallback || <Dashboard />;
  }
  return iconMap[iconName] || fallback || <Dashboard />;
}

/**
 * Get list of all available icon names
 * Useful for debugging or generating icon options
 */
export function getAvailableIconNames(): string[] {
  return Object.keys(iconMap).sort();
}

/**
 * Check if an icon name is valid/available
 */
export function isValidIconName(iconName: string): boolean {
  return iconName in iconMap;
}

export default iconMap;
