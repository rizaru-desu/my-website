import {
  AtSign,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Code2,
  ExternalLink,
  GitFork,
  Globe2,
  HeartHandshake,
  Layers,
  Link,
  Mail,
  MessageCircle,
  MonitorPlay,
  Music,
  Package,
  Palette,
  PenLine,
  PlayCircle,
  Podcast,
  Users,
  Radio,
  Rocket,
  Send,
  ShoppingBag,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";

type SocialIconKind =
  | "calendar"
  | "chat"
  | "code"
  | "community"
  | "design"
  | "email"
  | "external"
  | "facebook"
  | "funding"
  | "gaming"
  | "github"
  | "instagram"
  | "link"
  | "linkedin"
  | "music"
  | "package"
  | "podcast"
  | "portfolio"
  | "product"
  | "professional"
  | "rss"
  | "shop"
  | "telegram"
  | "twitter"
  | "user"
  | "video"
  | "website"
  | "writing"
  | "youtube";

type SocialLinkIconProps = {
  href: string;
  label: string;
  className?: string;
};

export const socialLinkOptions = [
  {
    label: "GitHub",
    keywords: "git repository code source open source",
    placeholderHref: "https://github.com/username",
    iconKind: "github",
    matchers: ["github.com", "github"],
  },
  {
    label: "GitLab",
    keywords: "git repository devops source code",
    placeholderHref: "https://gitlab.com/username",
    iconKind: "code",
    matchers: ["gitlab.com", "gitlab"],
  },
  {
    label: "Bitbucket",
    keywords: "git repository source code",
    placeholderHref: "https://bitbucket.org/username",
    iconKind: "code",
    matchers: ["bitbucket.org", "bitbucket"],
  },
  {
    label: "Stack Overflow",
    keywords: "developer questions answers coding",
    placeholderHref: "https://stackoverflow.com/users/123456",
    iconKind: "code",
    matchers: ["stackoverflow.com", "stack overflow", "stack-overflow"],
  },
  {
    label: "LinkedIn",
    keywords: "career work professional",
    placeholderHref: "https://linkedin.com/in/username",
    iconKind: "linkedin",
    matchers: ["linkedin.com", "linkedin"],
  },
  {
    label: "Email",
    keywords: "mail contact inbox",
    placeholderHref: "mailto:hello@example.com",
    iconKind: "email",
    matchers: ["mailto", "email", "mail"],
  },
  {
    label: "Instagram",
    keywords: "photo visual social",
    placeholderHref: "https://instagram.com/username",
    iconKind: "instagram",
    matchers: ["instagram.com", "instagram"],
  },
  {
    label: "X / Twitter",
    keywords: "twitter x social posts",
    placeholderHref: "https://x.com/username",
    iconKind: "twitter",
    matchers: ["x.com", "twitter.com", "twitter", "tweetdeck"],
  },
  {
    label: "YouTube",
    keywords: "video channel media",
    placeholderHref: "https://youtube.com/@username",
    iconKind: "youtube",
    matchers: ["youtube.com", "youtu.be", "youtube"],
  },
  {
    label: "Facebook",
    keywords: "community social page",
    placeholderHref: "https://facebook.com/username",
    iconKind: "facebook",
    matchers: ["facebook.com", "fb.com", "facebook"],
  },
  {
    label: "TikTok",
    keywords: "short video social creator",
    placeholderHref: "https://tiktok.com/@username",
    iconKind: "video",
    matchers: ["tiktok.com", "tiktok"],
  },
  {
    label: "Threads",
    keywords: "social posts conversation",
    placeholderHref: "https://threads.net/@username",
    iconKind: "chat",
    matchers: ["threads.net", "threads"],
  },
  {
    label: "Bluesky",
    keywords: "social posts microblog",
    placeholderHref: "https://bsky.app/profile/username.bsky.social",
    iconKind: "chat",
    matchers: ["bsky.app", "bluesky"],
  },
  {
    label: "Mastodon",
    keywords: "fediverse social microblog",
    placeholderHref: "https://mastodon.social/@username",
    iconKind: "chat",
    matchers: ["mastodon", "fediverse"],
  },
  {
    label: "Reddit",
    keywords: "community discussion forum",
    placeholderHref: "https://reddit.com/user/username",
    iconKind: "community",
    matchers: ["reddit.com", "reddit"],
  },
  {
    label: "Discord",
    keywords: "community chat server",
    placeholderHref: "https://discord.gg/invite",
    iconKind: "chat",
    matchers: ["discord.gg", "discord.com", "discord"],
  },
  {
    label: "Telegram",
    keywords: "chat message channel",
    placeholderHref: "https://t.me/username",
    iconKind: "telegram",
    matchers: ["t.me", "telegram.me", "telegram"],
  },
  {
    label: "WhatsApp",
    keywords: "chat message contact",
    placeholderHref: "https://wa.me/6281234567890",
    iconKind: "chat",
    matchers: ["wa.me", "whatsapp.com", "whatsapp"],
  },
  {
    label: "Slack",
    keywords: "workspace community chat",
    placeholderHref: "https://workspace.slack.com",
    iconKind: "chat",
    matchers: ["slack.com", "slack"],
  },
  {
    label: "Dribbble",
    keywords: "design portfolio shots",
    placeholderHref: "https://dribbble.com/username",
    iconKind: "design",
    matchers: ["dribbble.com", "dribbble"],
  },
  {
    label: "Behance",
    keywords: "design portfolio creative",
    placeholderHref: "https://behance.net/username",
    iconKind: "design",
    matchers: ["behance.net", "behance"],
  },
  {
    label: "Figma",
    keywords: "design prototype file",
    placeholderHref: "https://figma.com/@username",
    iconKind: "design",
    matchers: ["figma.com", "figma"],
  },
  {
    label: "CodePen",
    keywords: "frontend demo code sandbox",
    placeholderHref: "https://codepen.io/username",
    iconKind: "code",
    matchers: ["codepen.io", "codepen"],
  },
  {
    label: "CodeSandbox",
    keywords: "frontend demo code sandbox",
    placeholderHref: "https://codesandbox.io/u/username",
    iconKind: "code",
    matchers: ["codesandbox.io", "codesandbox"],
  },
  {
    label: "Replit",
    keywords: "code app repl",
    placeholderHref: "https://replit.com/@username",
    iconKind: "code",
    matchers: ["replit.com", "replit"],
  },
  {
    label: "npm",
    keywords: "package registry javascript",
    placeholderHref: "https://npmjs.com/~username",
    iconKind: "package",
    matchers: ["npmjs.com", "npm"],
  },
  {
    label: "Dev.to",
    keywords: "developer blog article writing",
    placeholderHref: "https://dev.to/username",
    iconKind: "writing",
    matchers: ["dev.to", "devto"],
  },
  {
    label: "Hashnode",
    keywords: "developer blog article writing",
    placeholderHref: "https://hashnode.com/@username",
    iconKind: "writing",
    matchers: ["hashnode.com", "hashnode"],
  },
  {
    label: "Medium",
    keywords: "blog article writing",
    placeholderHref: "https://medium.com/@username",
    iconKind: "writing",
    matchers: ["medium.com", "medium"],
  },
  {
    label: "Substack",
    keywords: "newsletter writing article",
    placeholderHref: "https://username.substack.com",
    iconKind: "writing",
    matchers: ["substack.com", "substack"],
  },
  {
    label: "Product Hunt",
    keywords: "product launch startup",
    placeholderHref: "https://producthunt.com/@username",
    iconKind: "product",
    matchers: ["producthunt.com", "product hunt", "producthunt"],
  },
  {
    label: "Peerlist",
    keywords: "career profile professional",
    placeholderHref: "https://peerlist.io/username",
    iconKind: "professional",
    matchers: ["peerlist.io", "peerlist"],
  },
  {
    label: "Wellfound",
    keywords: "startup career angel list",
    placeholderHref: "https://wellfound.com/u/username",
    iconKind: "professional",
    matchers: ["wellfound.com", "angel.co", "wellfound", "angellist"],
  },
  {
    label: "Calendly",
    keywords: "calendar booking schedule",
    placeholderHref: "https://calendly.com/username",
    iconKind: "calendar",
    matchers: ["calendly.com", "calendly"],
  },
  {
    label: "Linktree",
    keywords: "links bio landing page",
    placeholderHref: "https://linktr.ee/username",
    iconKind: "link",
    matchers: ["linktr.ee", "linktree"],
  },
  {
    label: "Twitch",
    keywords: "stream video gaming",
    placeholderHref: "https://twitch.tv/username",
    iconKind: "video",
    matchers: ["twitch.tv", "twitch"],
  },
  {
    label: "Spotify",
    keywords: "music audio podcast",
    placeholderHref: "https://open.spotify.com/user/username",
    iconKind: "music",
    matchers: ["spotify.com", "spotify"],
  },
  {
    label: "SoundCloud",
    keywords: "music audio creator",
    placeholderHref: "https://soundcloud.com/username",
    iconKind: "music",
    matchers: ["soundcloud.com", "soundcloud"],
  },
  {
    label: "Podcast",
    keywords: "audio episode show",
    placeholderHref: "https://podcasts.apple.com/podcast/id",
    iconKind: "podcast",
    matchers: ["podcasts.apple.com", "podcast"],
  },
  {
    label: "Pinterest",
    keywords: "visual boards inspiration",
    placeholderHref: "https://pinterest.com/username",
    iconKind: "design",
    matchers: ["pinterest.com", "pinterest"],
  },
  {
    label: "Patreon",
    keywords: "support membership creator",
    placeholderHref: "https://patreon.com/username",
    iconKind: "funding",
    matchers: ["patreon.com", "patreon"],
  },
  {
    label: "Ko-fi",
    keywords: "support donation coffee",
    placeholderHref: "https://ko-fi.com/username",
    iconKind: "funding",
    matchers: ["ko-fi.com", "kofi", "ko-fi"],
  },
  {
    label: "Buy Me a Coffee",
    keywords: "support donation coffee",
    placeholderHref: "https://buymeacoffee.com/username",
    iconKind: "funding",
    matchers: ["buymeacoffee.com", "buy me a coffee"],
  },
  {
    label: "Gumroad",
    keywords: "shop product digital",
    placeholderHref: "https://username.gumroad.com",
    iconKind: "shop",
    matchers: ["gumroad.com", "gumroad"],
  },
  {
    label: "Etsy",
    keywords: "shop store marketplace",
    placeholderHref: "https://etsy.com/shop/username",
    iconKind: "shop",
    matchers: ["etsy.com", "etsy"],
  },
  {
    label: "RSS",
    keywords: "feed blog subscription",
    placeholderHref: "https://example.com/rss.xml",
    iconKind: "rss",
    matchers: ["rss", "feed.xml", "rss.xml"],
  },
  {
    label: "Website",
    keywords: "site portfolio blog web",
    placeholderHref: "https://example.com",
    iconKind: "website",
    matchers: ["website", "portfolio", "personal site"],
  },
] as const;

const socialIconMap: Record<SocialIconKind, LucideIcon> = {
  calendar: CalendarDays,
  chat: MessageCircle,
  code: Code2,
  community: Users,
  design: Palette,
  email: Mail,
  external: ExternalLink,
  facebook: Users,
  funding: HeartHandshake,
  gaming: MonitorPlay,
  github: GitFork,
  instagram: Camera,
  link: Link,
  linkedin: BriefcaseBusiness,
  music: Music,
  package: Package,
  portfolio: Layers,
  product: Rocket,
  professional: BriefcaseBusiness,
  podcast: Podcast,
  rss: Radio,
  shop: ShoppingBag,
  telegram: Send,
  twitter: MessageCircle,
  user: UserRound,
  video: Video,
  website: Globe2,
  writing: PenLine,
  youtube: PlayCircle,
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function resolveIconKindFromText(text: string): SocialIconKind | null {
  const normalizedText = normalizeText(text);
  const exactOption = socialLinkOptions.find(
    (option) => normalizeText(option.label) === normalizedText,
  );

  if (exactOption) {
    return exactOption.iconKind;
  }

  const matchedOption = socialLinkOptions.find((option) =>
    option.matchers.some((matcher) => normalizedText.includes(matcher)),
  );

  return matchedOption?.iconKind ?? null;
}

function getHrefSearchText(href: string) {
  if (href.startsWith("mailto:")) {
    return "email mailto";
  }

  try {
    const url = new URL(href);
    return `${url.hostname} ${url.pathname}`.toLowerCase();
  } catch {
    return href.toLowerCase();
  }
}

export function getSocialLinkIconKind(
  input: Pick<SocialLinkIconProps, "href" | "label">,
): SocialIconKind {
  const labelKind = resolveIconKindFromText(input.label);
  const hrefKind = resolveIconKindFromText(getHrefSearchText(input.href));

  return labelKind ?? hrefKind ?? "website";
}

export function SocialLinkIcon({ href, label, className }: SocialLinkIconProps) {
  const Icon = socialIconMap[getSocialLinkIconKind({ href, label })] ?? ExternalLink;

  return (
    <Icon
      aria-hidden="true"
      className={className}
      size={16}
      strokeWidth={2.6}
    />
  );
}

export function SocialLinkFallbackIcon({ className }: { className?: string }) {
  return (
    <AtSign
      aria-hidden="true"
      className={className}
      size={16}
      strokeWidth={2.6}
    />
  );
}
