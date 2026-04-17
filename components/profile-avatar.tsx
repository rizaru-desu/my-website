import { cn } from "@/lib/utils";
import { getProfileInitials } from "@/lib/profile.shared";

type ProfileAvatarProps = {
  name: string;
  src: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar({
  name,
  src,
  alt,
  className,
  imageClassName,
  fallbackClassName,
}: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border-[3px] border-ink bg-panel font-display uppercase text-ink shadow-[6px_6px_0_var(--ink)]",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? `${name} profile photo`}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <span className={cn("leading-none", fallbackClassName)}>
          {getProfileInitials(name)}
        </span>
      )}
    </div>
  );
}
