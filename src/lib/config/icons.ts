import {
  Link, Globe, Mail, Phone, Smartphone, MessageCircle, MapPin, Calendar, Clock, Star, Heart, Music, Video,
  Image as ImageIcon, Camera, ShoppingBag, ShoppingCart, CreditCard, Facebook, Twitter, Instagram, Youtube,
  Linkedin, Github, Twitch, MessageSquare, Send, Briefcase, User, Users, Home, Book, Coffee, Award, Play, Pause, X, Check,
  Zap, Compass, Navigation, Store, Map, Ticket, Activity, Airplay, AlarmClock, AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Anchor, Aperture, Archive, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, AtSign, Battery, BatteryCharging,
  Bell, BellOff, Bluetooth, Bold, Bookmark, Box, Briefcase as BriefcaseAlt, Calendar as CalendarIcon, Cast,
  CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clipboard, Cloud, CloudDrizzle, CloudLightning,
  CloudRain, CloudSnow, Code, Codepen, Coffee as CoffeeIcon, Columns, Command, Compass as CompassIcon, Copy,
  CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, CornerUpLeft,
  CornerUpRight, Cpu, CreditCard as CreditCardIcon, Crop, Crosshair, Database, Delete, Disc, DollarSign, Download,
  DownloadCloud, Droplet, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, FastForward, Feather, File, FileMinus,
  FilePlus, FileText, Film, Filter, Flag, Folder, FolderMinus, FolderPlus, Framer, Frown, Gift, GitBranch,
  GitCommit, GitMerge, GitPullRequest, Grid, HardDrive, Hash, Headphones, HelpCircle, Hexagon, Inbox, Info,
  Key, Layers, Layout, LifeBuoy, Link2, List, Loader, Lock, LogIn, LogOut, Maximize, Maximize2, Mic, MicOff,
  Minimize, Minimize2, Minus, MinusCircle, MinusSquare, Monitor, Moon, MoreHorizontal, MoreVertical, MousePointer,
  Move, Octagon, Package, Paperclip, PauseCircle, PenTool, Percent, PhoneCall, PhoneForwarded, PhoneIncoming,
  PhoneMissed, PhoneOff, PhoneOutgoing, PieChart, PlayCircle, Plus, PlusCircle, PlusSquare, Pocket, Power,
  Printer, Radio, RefreshCcw, RefreshCw, Repeat, Rewind, RotateCcw, RotateCw, Rss, Save, Scissors, Search,
  Server, Settings, Share, Share2, Shield, ShieldOff, ShoppingBag as ShoppingBagIcon, ShoppingCart as ShoppingCartIcon, Shuffle, SkipBack, SkipForward,
  Slack, Slash, Sliders, Smartphone as SmartphoneIcon, Smile, Speaker, Square, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag,
  Target, Terminal, Thermometer, ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight, Trash, Trash2, Trello,
  TrendingDown, TrendingUp, Triangle, Truck, Tv, Type, Umbrella, Underline, Unlock, Upload, UploadCloud,
  UserCheck, UserMinus, UserPlus, Users as UsersIcon, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX, Watch, Wifi,
  WifiOff, Wind, XCircle, XOctagon, XSquare, Youtube as YoutubeIcon, ZapOff, ZoomIn, ZoomOut
} from "lucide-react";

import {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaSnapchat, FaDiscord,
  FaTwitch, FaPinterest, FaSpotify, FaSoundcloud, FaApple, FaAndroid, FaWindows, FaLinux,
  FaGithub, FaGitlab, FaBitbucket, FaSlack, FaTrello, FaFigma, FaSketch, FaInvision,
  FaStripe, FaPaypal, FaAmazon, FaGoogle, FaMicrosoft, FaReddit, FaWhatsapp, FaTelegram,
  FaViber, FaLine, FaWeixin, FaVk, FaOdnoklassniki, FaYandex, FaYahoo,
  FaBitcoin, FaEthereum, FaWallet, FaGamepad, FaRobot, FaGhost
} from "react-icons/fa";

import {
  SiX, SiMastodon, SiThreads, SiPatreon, SiMedium, SiSubstack, SiKofi, SiBuymeacoffee,
  SiLinktree, SiNotion, SiObsidian, SiEvernote, SiDropbox, SiGooglecloud,
  SiAmazon, SiFirebase, SiSupabase, SiVercel, SiNetlify, SiHeroku, SiDigitalocean
} from "react-icons/si";

import {
  BsApple, BsAndroid2, BsWindows, BsGoogle, BsAmazon, BsAward, BsBook, BsBriefcase,
  BsCalendarDate, BsCameraVideo, BsCart3, BsChatDots, BsClock, BsCompass, BsCreditCard,
  BsEnvelope, BsFacebook, BsGithub, BsGlobe, BsHeart, BsHouse, BsInstagram, BsLinkedin,
  BsMap, BsMusicNote, BsPhone, BsPlay, BsSend, BsShare, BsShield, BsSnapchat, BsStar,
  BsTiktok, BsTwitch, BsTwitter, BsX, BsYoutube, BsDiscord, BsWhatsapp, BsTelegram,
  BsBell, BsBug, BsCalendar, BsCamera, BsCloud, BsCpu, BsDatabase, BsDownload, BsEye,
  BsEyeSlash, BsFileText, BsFolder, BsGear, BsGift, BsGraphUp, BsHandThumbsUp, BsImage,
  BsInfoCircle, BsKey, BsLightning, BsLock, BsMegaphone, BsMic, BsMoon, BsPalette,
  BsPaperclip, BsPerson, BsPlus, BsQrCode, BsQuestionCircle, BsSearch, BsShop, BsSliders,
  BsSpeaker, BsSun, BsTag, BsTrash, BsTruck, BsTv, BsUmbrella, BsVolumeUp, BsWifi
} from "react-icons/bs";

import {
  TbAccessPoint, TbActivity, TbAddressBook, TbAlarm, TbAlertCircle, TbAnchor, TbAperture,
  TbArchive, TbArrowDown, TbArrowUp, TbArrowLeft, TbArrowRight, TbAward, TbBackpack,
  TbBallpen, TbBarcode, TbBattery, TbBell, TbBluetooth, TbBook, TbBookmark, TbBrandApple,
  TbBrandAndroid, TbBrandWindows, TbBrandChrome, TbBrandDiscord, TbBrandFacebook, TbBrandFigma,
  TbBrandGithub, TbBrandInstagram, TbBrandLinkedin, TbBrandMedium, TbBrandReddit, TbBrandSnapchat,
  TbBrandSpotify, TbBrandTiktok, TbBrandTelegram, TbBrandWhatsapp, TbBrandYoutube,
  TbBriefcase, TbBuildingStore, TbBulb, TbCalculator, TbCalendar, TbCamera, TbCar, TbChartBar,
  TbCheck, TbChevronDown, TbChevronUp, TbCircle, TbClick, TbClipboard, TbClock, TbCloud,
  TbCode, TbCoffee, TbCompass, TbCreditCard, TbCrown, TbDatabase, TbDeviceGamepad, TbDeviceMobile,
  TbDeviceTv, TbDownload, TbEdit, TbEye, TbFileText, TbFilter, TbFlag, TbFolder, TbGift,
  TbGlobe, TbHeadphones, TbHeart, TbHome, TbInfoCircle, TbKey, TbLink, TbLock,
  TbMail, TbMapPin, TbMessage, TbMoon, TbMusic, TbPalette, TbPencil, TbPhone,
  TbPhoto, TbPin, TbPlayerPlay, TbPlug, TbPlus, TbPrinter, TbQrcode, TbQuestionMark,
  TbReceipt, TbSearch, TbSelector, TbSettings, TbShare, TbShield, TbShoppingCart, TbStar,
  TbSun, TbTag, TbTarget, TbTerminal, TbThumbUp, TbTool, TbTrash, TbTrophy, TbTruck,
  TbUser, TbUsers, TbVideo, TbVolume, TbWifi, TbWorld, TbWriting, TbX, TbZip
} from "react-icons/tb";

import {
  MdHome, MdSettings, MdPerson, MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdAccessTime,
  MdStar, MdFavorite, MdAudiotrack, MdVideocam, MdImage, MdPhotoCamera, MdShoppingBag,
  MdShoppingCart, MdPayment, MdFacebook, MdShare, MdShield, MdChat, MdSend, MdWork,
  MdInfo, MdHelp, MdLock, MdNotifications, MdSearch, MdCloud, MdDownload, MdUpload,
  MdPlayArrow, MdVolumeUp, MdWifi, MdEdit, MdDelete, MdAdd, MdRemove, MdCheck,
  MdClose, MdFolder, MdLaptop, MdTranslate, MdSecurity, MdThumbUp, MdGrade, MdVerified,
  MdDashboard, MdList, MdMenu, MdLink, MdQrCode, MdBarChart, MdBuild, MdCode,
  MdLanguage, MdStore, MdMap, MdLaunch
} from "react-icons/md";

import {
  AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineMail, AiOutlinePhone,
  AiOutlineEnvironment, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineStar, AiOutlineHeart,
  AiOutlineAudio, AiOutlineVideoCamera, AiOutlinePicture, AiOutlineCamera, AiOutlineShopping,
  AiOutlineShoppingCart, AiOutlineCreditCard, AiOutlineFacebook, AiOutlineTwitter, AiOutlineInstagram,
  AiOutlineYoutube, AiOutlineLinkedin, AiOutlineGithub, AiOutlineWechat, AiOutlineMessage,
  AiOutlineSend, AiOutlinePlayCircle, AiOutlineLock,
  AiOutlineBell, AiOutlineSearch, AiOutlineCloud, AiOutlineDownload, AiOutlineUpload,
  AiOutlineSound, AiOutlineWifi, AiOutlineEdit, AiOutlineDelete, AiOutlinePlus,
  AiOutlineMinus, AiOutlineCheck, AiOutlineClose, AiOutlineFolder, AiOutlineQuestionCircle,
  AiOutlineInfoCircle, AiOutlineCopy, AiOutlineDashboard, AiOutlineAppstore, AiOutlineUnorderedList,
  AiOutlineLink, AiOutlineQrcode, AiOutlineBarChart, AiOutlineBuild, AiOutlineCode,
  AiOutlineGlobal, AiOutlineShop, AiOutlineExport
} from "react-icons/ai";

import type { ComponentType } from "react";

// Categorized maps for easy UI tab selection
export const LUCIDE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  Link, Globe, Mail, Phone, Smartphone, MessageCircle, MapPin, Calendar, Clock, Star, Heart, Music, Video,
  ImageIcon, Camera, ShoppingBag, ShoppingCart, CreditCard, Facebook, Twitter, Instagram, Youtube,
  Linkedin, Github, Twitch, MessageSquare, Send, Briefcase, User, Users, Home, Book, Coffee, Award, Play, Pause, X, Check,
  Zap, Compass, Navigation, Store, Map, Ticket,
  Activity, Airplay, AlarmClock, AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Anchor, Aperture, Archive, ArrowDown, ArrowUp, ArrowLeft, ArrowRight, AtSign, Battery, BatteryCharging,
  Bell, BellOff, Bluetooth, Bold, Bookmark, Box, BriefcaseAlt, CalendarIcon, Cast,
  CheckCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Clipboard, Cloud, CloudDrizzle, CloudLightning,
  CloudRain, CloudSnow, Code, Codepen, CoffeeIcon, Columns, Command, CompassIcon, Copy,
  CornerDownLeft, CornerDownRight, CornerLeftDown, CornerLeftUp, CornerRightDown, CornerRightUp, CornerUpLeft,
  CornerUpRight, Cpu, CreditCardIcon, Crop, Crosshair, Database, Delete, Disc, DollarSign, Download,
  DownloadCloud, Droplet, Edit, Edit2, Edit3, ExternalLink, Eye, EyeOff, FastForward, Feather, File, FileMinus,
  FilePlus, FileText, Film, Filter, Flag, Folder, FolderMinus, FolderPlus, Framer, Frown, Gift, GitBranch,
  GitCommit, GitMerge, GitPullRequest, Grid, HardDrive, Hash, Headphones, HelpCircle, Hexagon, Inbox, Info,
  Key, Layers, Layout, LifeBuoy, Link2, List, Loader, Lock, LogIn, LogOut, Maximize, Maximize2, Mic, MicOff,
  Minimize, Minimize2, Minus, MinusCircle, MinusSquare, Monitor, Moon, MoreHorizontal, MoreVertical, MousePointer,
  Move, Octagon, Package, Paperclip, PauseCircle, PenTool, Percent, PhoneCall, PhoneForwarded, PhoneIncoming,
  PhoneMissed, PhoneOff, PhoneOutgoing, PieChart, PlayCircle, Plus, PlusCircle, PlusSquare, Pocket, Power,
  Printer, Radio, RefreshCcw, RefreshCw, Repeat, Rewind, RotateCcw, RotateCw, Rss, Save, Scissors, Search,
  Server, Settings, Share, Share2, Shield, ShieldOff, ShoppingBagIcon, ShoppingCartIcon, Shuffle, SkipBack, SkipForward,
  Slack, Slash, Sliders, SmartphoneIcon, Smile, Speaker, Square, StopCircle, Sun, Sunrise, Sunset, Tablet, Tag,
  Target, Terminal, Thermometer, ThumbsDown, ThumbsUp, ToggleLeft, ToggleRight, Trash, Trash2, Trello,
  TrendingDown, TrendingUp, Triangle, Truck, Tv, Type, Umbrella, Underline, Unlock, Upload, UploadCloud,
  UserCheck, UserMinus, UserPlus, UsersIcon, VideoOff, Voicemail, Volume, Volume1, Volume2, VolumeX, Watch, Wifi,
  WifiOff, Wind, XCircle, XOctagon, XSquare, YoutubeIcon, ZapOff, ZoomIn, ZoomOut
};

export const FONT_AWESOME_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaSnapchat, FaDiscord,
  FaTwitch, FaPinterest, FaSpotify, FaSoundcloud, FaApple, FaAndroid, FaWindows, FaLinux,
  FaGithub, FaGitlab, FaBitbucket, FaSlack, FaTrello, FaFigma, FaSketch, FaInvision,
  FaStripe, FaPaypal, FaAmazon, FaGoogle, FaMicrosoft, FaReddit, FaWhatsapp, FaTelegram,
  FaViber, FaLine, FaWeixin, FaVk, FaOdnoklassniki, FaYandex, FaYahoo,
  FaBitcoin, FaEthereum, FaWallet, FaGamepad, FaRobot, FaGhost
};

export const SIMPLE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  SiX, SiMastodon, SiThreads, SiPatreon, SiMedium, SiSubstack, SiKofi, SiBuymeacoffee,
  SiLinktree, SiNotion, SiObsidian, SiEvernote, SiDropbox, SiGooglecloud,
  SiAmazon, SiFirebase, SiSupabase, SiVercel, SiNetlify, SiHeroku, SiDigitalocean
};

export const BOOTSTRAP_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  BsApple, BsAndroid2, BsWindows, BsGoogle, BsAmazon, BsAward, BsBook, BsBriefcase,
  BsCalendarDate, BsCameraVideo, BsCart3, BsChatDots, BsClock, BsCompass, BsCreditCard,
  BsEnvelope, BsFacebook, BsGithub, BsGlobe, BsHeart, BsHouse, BsInstagram, BsLinkedin,
  BsMap, BsMusicNote, BsPhone, BsPlay, BsSend, BsShare, BsShield, BsSnapchat, BsStar,
  BsTiktok, BsTwitch, BsTwitter, BsX, BsYoutube, BsDiscord, BsWhatsapp, BsTelegram,
  BsBell, BsBug, BsCalendar, BsCamera, BsCloud, BsCpu, BsDatabase, BsDownload, BsEye,
  BsEyeSlash, BsFileText, BsFolder, BsGear, BsGift, BsGraphUp, BsHandThumbsUp, BsImage,
  BsInfoCircle, BsKey, BsLightning, BsLock, BsMegaphone, BsMic, BsMoon, BsPalette,
  BsPaperclip, BsPerson, BsPlus, BsQrCode, BsQuestionCircle, BsSearch, BsShop, BsSliders,
  BsSpeaker, BsSun, BsTag, BsTrash, BsTruck, BsTv, BsUmbrella, BsVolumeUp, BsWifi
};

export const TABLER_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  TbAccessPoint, TbActivity, TbAddressBook, TbAlarm, TbAlertCircle, TbAnchor, TbAperture,
  TbArchive, TbArrowDown, TbArrowUp, TbArrowLeft, TbArrowRight, TbAward, TbBackpack,
  TbBallpen, TbBarcode, TbBattery, TbBell, TbBluetooth, TbBook, TbBookmark, TbBrandApple,
  TbBrandAndroid, TbBrandWindows, TbBrandChrome, TbBrandDiscord, TbBrandFacebook, TbBrandFigma,
  TbBrandGithub, TbBrandInstagram, TbBrandLinkedin, TbBrandMedium, TbBrandReddit, TbBrandSnapchat,
  TbBrandSpotify, TbBrandTiktok, TbBrandTelegram, TbBrandWhatsapp, TbBrandYoutube,
  TbBriefcase, TbBuildingStore, TbBulb, TbCalculator, TbCalendar, TbCamera, TbCar, TbChartBar,
  TbCheck, TbChevronDown, TbChevronUp, TbCircle, TbClick, TbClipboard, TbClock, TbCloud,
  TbCode, TbCoffee, TbCompass, TbCreditCard, TbCrown, TbDatabase, TbDeviceGamepad, TbDeviceMobile,
  TbDeviceTv, TbDownload, TbEdit, TbEye, TbFileText, TbFilter, TbFlag, TbFolder, TbGift,
  TbGlobe, TbHeadphones, TbHeart, TbHome, TbInfoCircle, TbKey, TbLink, TbLock,
  TbMail, TbMapPin, TbMessage, TbMoon, TbMusic, TbPalette, TbPencil, TbPhone,
  TbPhoto, TbPin, TbPlayerPlay, TbPlug, TbPlus, TbPrinter, TbQrcode: TbQrcode, TbQrCode: TbQrcode, TbQuestionMark,
  TbReceipt, TbSearch, TbSelector, TbSettings, TbShare, TbShield, TbShoppingCart, TbStar,
  TbSun, TbTag, TbTarget, TbTerminal, TbThumbUp, TbTool, TbTrash, TbTrophy, TbTruck,
  TbUser, TbUsers, TbVideo, TbVolume, TbWifi, TbWorld, TbWriting, TbX, TbZip
};

export const MATERIAL_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  MdHome, MdSettings, MdPerson, MdEmail, MdPhone, MdLocationOn, MdCalendarToday, MdAccessTime,
  MdStar, MdFavorite, MdAudiotrack, MdVideocam, MdImage, MdPhotoCamera, MdShoppingBag,
  MdShoppingCart, MdPayment, MdFacebook, MdShare, MdShield, MdChat, MdSend, MdWork,
  MdInfo, MdHelp, MdLock, MdNotifications, MdSearch, MdCloud, MdDownload, MdUpload,
  MdPlayArrow, MdVolumeUp, MdWifi, MdEdit, MdDelete, MdAdd, MdRemove, MdCheck,
  MdClose, MdFolder, MdLaptop, MdTranslate, MdSecurity, MdThumbUp, MdGrade, MdVerified,
  MdDashboard, MdList, MdMenu, MdLink, MdQrCode, MdBarChart, MdBuild, MdCode,
  MdLanguage, MdStore, MdMap, MdLaunch
};

export const ANT_DESIGN_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  AiOutlineHome, AiOutlineSetting, AiOutlineUser, AiOutlineMail, AiOutlinePhone,
  AiOutlineEnvironment, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineStar, AiOutlineHeart,
  AiOutlineAudio, AiOutlineVideoCamera, AiOutlinePicture, AiOutlineCamera, AiOutlineShopping,
  AiOutlineShoppingCart, AiOutlineCreditCard, AiOutlineFacebook, AiOutlineTwitter, AiOutlineInstagram,
  AiOutlineYoutube, AiOutlineLinkedin, AiOutlineGithub, AiOutlineWechat, AiOutlineMessage,
  AiOutlineSend, AiOutlinePlayCircle, AiOutlineLock,
  AiOutlineBell, AiOutlineSearch, AiOutlineCloud, AiOutlineDownload, AiOutlineUpload,
  AiOutlineSound, AiOutlineWifi, AiOutlineEdit, AiOutlineDelete, AiOutlinePlus,
  AiOutlineMinus, AiOutlineCheck, AiOutlineClose, AiOutlineFolder, AiOutlineQuestionCircle,
  AiOutlineInfoCircle, AiOutlineCopy, AiOutlineDashboard, AiOutlineAppstore, AiOutlineUnorderedList,
  AiOutlineLink, AiOutlineQrcode, AiOutlineBarChart, AiOutlineBuild, AiOutlineCode,
  AiOutlineGlobal, AiOutlineShop, AiOutlineExport
};

// Full merged map for backward compatibility and fast dynamic rendering
export const CUSTOM_ICONS_MAP: Record<string, ComponentType<{ className?: string }>> = {
  ...LUCIDE_ICONS,
  ...FONT_AWESOME_ICONS,
  ...SIMPLE_ICONS,
  ...BOOTSTRAP_ICONS,
  ...TABLER_ICONS,
  ...MATERIAL_ICONS,
  ...ANT_DESIGN_ICONS
};

// Config for category tabs inside IconPicker
export const ICON_CATEGORIES = {
  all: Object.keys(CUSTOM_ICONS_MAP),
  lucide: Object.keys(LUCIDE_ICONS),
  fontAwesome: Object.keys(FONT_AWESOME_ICONS),
  bootstrap: Object.keys(BOOTSTRAP_ICONS),
  tabler: Object.keys(TABLER_ICONS),
  material: Object.keys(MATERIAL_ICONS),
  antDesign: Object.keys(ANT_DESIGN_ICONS),
  simpleIcons: Object.keys(SIMPLE_ICONS)
};
