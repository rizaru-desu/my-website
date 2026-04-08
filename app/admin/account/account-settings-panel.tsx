"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
  type ReactNode,
} from "react";

import QRCode from "qrcode";
import QRCodeStyling, {
  type ExtensionFunction,
  type Options as StyledQrOptions,
} from "qr-code-styling";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type StatusTone = "idle" | "next-step" | "error" | "success";
type StatusState = {
  tone: StatusTone;
  message: string;
};

type TwoFactorPanelMode = "hidden" | "setup" | "disable";

type AccountSessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean | null;
  username?: string | null;
  role?: string | null;
  twoFactorEnabled?: boolean | null;
};

const STYLED_QR_EXTENSION: ExtensionFunction = (svg, options) => {
  const width = options.width ?? 0;
  const height = options.height ?? 0;
  const size = Math.min(width, height);
  if (!size) {
    return;
  }

  const doc = svg.ownerDocument;
  const overlay = doc.createElementNS("http://www.w3.org/2000/svg", "g");
  overlay.setAttribute("opacity", "0.98");

  const createRoundedRect = ({
    x,
    y,
    width: rectWidth,
    height: rectHeight,
    color,
    radius = 1.5,
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    radius?: number;
  }) => {
    const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(Math.round(x)));
    rect.setAttribute("y", String(Math.round(y)));
    rect.setAttribute("width", String(Math.round(rectWidth)));
    rect.setAttribute("height", String(Math.round(rectHeight)));
    rect.setAttribute("rx", String(radius));
    rect.setAttribute("fill", color);
    overlay.appendChild(rect);
  };

  const createCrossAccent = ({
    x,
    y,
    size: accentSize,
    color,
  }: {
    x: number;
    y: number;
    size: number;
    color: string;
  }) => {
    const thickness = accentSize * 0.22;
    const offsetY = y + accentSize * 0.39;

    const [first, second] = Array.from({ length: 2 }, (_, index) => {
      const line = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      line.setAttribute("x", String(Math.round(x)));
      line.setAttribute("y", String(Math.round(offsetY)));
      line.setAttribute("width", String(Math.round(accentSize)));
      line.setAttribute("height", String(Math.round(thickness)));
      line.setAttribute("rx", String(thickness * 0.35));
      line.setAttribute("fill", color);
      line.setAttribute(
        "transform",
        `rotate(${index === 0 ? 45 : -45} ${x + accentSize / 2} ${y + accentSize / 2})`,
      );
      return line;
    });

    overlay.appendChild(first);
    overlay.appendChild(second);
  };

  const moduleBands = [
    { x: 0.33, y: 0.12, w: 0.02, h: 0.09, color: "#ef2f2f" },
    { x: 0.38, y: 0.16, w: 0.018, h: 0.07, color: "#ef2f2f" },
    { x: 0.47, y: 0.17, w: 0.026, h: 0.055, color: "#f4b400" },
    { x: 0.56, y: 0.29, w: 0.02, h: 0.11, color: "#ef2f2f" },
    { x: 0.61, y: 0.31, w: 0.018, h: 0.08, color: "#ef2f2f" },
    { x: 0.73, y: 0.42, w: 0.02, h: 0.16, color: "#ef2f2f" },
    { x: 0.82, y: 0.36, w: 0.02, h: 0.11, color: "#ef2f2f" },
    { x: 0.28, y: 0.72, w: 0.02, h: 0.13, color: "#ef2f2f" },
    { x: 0.33, y: 0.72, w: 0.02, h: 0.13, color: "#ef2f2f" },
    { x: 0.58, y: 0.67, w: 0.02, h: 0.12, color: "#ef2f2f" },
    { x: 0.64, y: 0.69, w: 0.018, h: 0.09, color: "#ef2f2f" },
    { x: 0.86, y: 0.69, w: 0.02, h: 0.12, color: "#ef2f2f" },
  ];

  const accentBars = [
    { x: 0.11, y: 0.06, w: 0.1, h: 0.018, color: "#1f3ea8" },
    { x: 0.32, y: 0.06, w: 0.12, h: 0.02, color: "#f4b400" },
    { x: 0.5, y: 0.06, w: 0.14, h: 0.02, color: "#f4b400" },
    { x: 0.79, y: 0.06, w: 0.09, h: 0.018, color: "#1f3ea8" },
    { x: 0.11, y: 0.25, w: 0.09, h: 0.018, color: "#1f3ea8" },
    { x: 0.8, y: 0.25, w: 0.09, h: 0.018, color: "#1f3ea8" },
    { x: 0.1, y: 0.84, w: 0.1, h: 0.018, color: "#1f3ea8" },
    { x: 0.79, y: 0.84, w: 0.09, h: 0.018, color: "#1f3ea8" },
    { x: 0.18, y: 0.42, w: 0.13, h: 0.018, color: "#f4b400" },
    { x: 0.69, y: 0.58, w: 0.12, h: 0.018, color: "#f4b400" },
  ];

  const crosses = [
    { x: 0.43, y: 0.08, size: 0.11, color: "#1f3ea8" },
    { x: 0.55, y: 0.15, size: 0.1, color: "#1f3ea8" },
    { x: 0.08, y: 0.33, size: 0.08, color: "#1f3ea8" },
    { x: 0.19, y: 0.4, size: 0.11, color: "#1f3ea8" },
    { x: 0.42, y: 0.52, size: 0.08, color: "#1f3ea8" },
    { x: 0.87, y: 0.58, size: 0.08, color: "#1f3ea8" },
    { x: 0.11, y: 0.67, size: 0.08, color: "#1f3ea8" },
    { x: 0.74, y: 0.82, size: 0.11, color: "#1f3ea8" },
  ];

  accentBars.forEach((bar) => {
    createRoundedRect({
      x: width * bar.x,
      y: height * bar.y,
      width: size * bar.w,
      height: size * bar.h,
      color: bar.color,
      radius: 2,
    });
  });

  moduleBands.forEach((bar) => {
    createRoundedRect({
      x: width * bar.x,
      y: height * bar.y,
      width: size * bar.w,
      height: size * bar.h,
      color: bar.color,
      radius: 1.6,
    });
  });

  crosses.forEach((accent) => {
    createCrossAccent({
      x: width * accent.x,
      y: height * accent.y,
      size: size * accent.size,
      color: accent.color,
    });
  });

  svg.appendChild(overlay);
};

const STYLED_QR_OPTIONS: Partial<StyledQrOptions> = {
  type: "svg",
  width: 320,
  height: 320,
  margin: 12,
  shape: "square",
  qrOptions: {
    errorCorrectionLevel: "H",
  },
  dotsOptions: {
    type: "square",
    roundSize: false,
    color: "#f4b400",
  },
  cornersSquareOptions: {
    type: "square",
    color: "#1f3ea8",
  },
  cornersDotOptions: {
    type: "square",
    color: "#1f3ea8",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
};

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/65"
    >
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b-[3px] border-dashed border-ink/20 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/55">
        {label}
      </p>
      <p className="text-right text-sm leading-7 text-ink/78">{value}</p>
    </div>
  );
}

function StatusNotice({ state }: { state: StatusState }) {
  const className =
    state.tone === "success"
      ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#dce8ff_0%,#eff4ff_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
      : state.tone === "error"
        ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#ffd9d3_0%,#fff1e0_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
        : state.tone === "next-step"
          ? "rounded-[24px] border-[3px] border-ink bg-[linear-gradient(180deg,#fff4bf_0%,#fff8e8_100%)] px-4 py-4 text-sm leading-7 text-ink shadow-[5px_5px_0_var(--ink)]"
          : "rounded-[24px] border-[3px] border-ink bg-white/65 px-4 py-4 text-sm leading-7 text-ink/78 shadow-[5px_5px_0_var(--ink)]";

  return <div className={className}>{state.message}</div>;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return fallback;
}

function getFallbackUsername(email: string) {
  const [localPart = "studio-user"] = email.split("@");
  return localPart.toLowerCase();
}

function formatRoleLabel(role: string | null | undefined) {
  if (!role) {
    return "User";
  }

  return role
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getManualSecret(totpUri: string | null) {
  if (!totpUri) {
    return "";
  }

  try {
    return new URL(totpUri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

function buildBackupCodesText(backupCodes: string[]) {
  return [
    "Portofolio Admin 2FA Backup Codes",
    "",
    "Store this file in a safe offline location.",
    "Each code can only be used once.",
    "",
    ...backupCodes,
    "",
  ].join("\n");
}

function RealQrPanel({
  qrContainerRef,
  qrImageUrl,
  isReady,
  styledQrFailed,
}: {
  qrContainerRef: RefObject<HTMLDivElement | null>;
  qrImageUrl: string | null;
  isReady: boolean;
  styledQrFailed: boolean;
}) {
  return (
    <Card accent={isReady ? "cream" : "blue"} className="paper-grid p-5">
      <CardContent className="space-y-4 overflow-visible">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={isReady ? "red" : "blue"}>
            {isReady ? "Scan Ready" : "Locked"}
          </Badge>
          <span className="sticker-chip sticker-chip-cream">Comic QR</span>
        </div>

        <div className="relative mx-auto w-full max-w-[360px] overflow-visible px-4 pb-9 pt-5 sm:px-6">
          <div className="pointer-events-none absolute -left-1 top-6 z-40 rotate-[-6deg] rounded-full border-[4px] border-ink bg-accent-red px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.22em] text-white shadow-[4px_4px_0_var(--ink)]">
            Scan
          </div>
          <div className="pointer-events-none absolute -right-1 bottom-8 z-30 rotate-[6deg] rounded-full border-[4px] border-ink bg-[#ffe776] px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.22em] text-ink shadow-[4px_4px_0_var(--ink)]">
            App
          </div>

          {/* Layer Foreground (Shadow dipertahankan di sini) */}
          <div className="relative z-20 rounded-[34px] border-[4px] border-ink bg-white p-6 shadow-[8px_8px_0_var(--ink)]">
            <div className="relative aspect-square overflow-hidden bg-white p-4">
              {isReady ? (
                styledQrFailed ? (
                  qrImageUrl ? (
                    <Image
                      src={qrImageUrl}
                      alt="Authenticator setup QR code"
                      fill
                      sizes="320px"
                      className="object-contain p-3"
                      unoptimized
                    />
                  ) : (
                    // Gradient diubah menjadi warna flat solid agar konsisten
                    <div className="flex h-full items-center justify-center rounded-[18px] border-[2px] border-dashed border-ink/30 bg-[#fffaf1] px-6 text-center text-sm leading-7 text-ink/60">
                      Styled QR unavailable and the basic fallback is still
                      loading. Wait a moment and try again.
                    </div>
                  )
                ) : (
                  <div
                    ref={qrContainerRef}
                    className="flex h-full w-full items-center justify-center bg-white [&_svg]:h-full [&_svg]:w-full"
                  />
                )
              ) : (
                // Gradient diubah menjadi warna flat solid agar konsisten
                <div className="flex h-full items-center justify-center rounded-[18px] border-[2px] border-dashed border-ink/30 bg-[#fffaf1] px-6 text-center text-sm leading-7 text-ink/60">
                  Generate the setup QR first, then scan it with your
                  authenticator app.
                </div>
              )}
            </div>

            {styledQrFailed ? (
              <div className="pointer-events-none absolute inset-x-7 bottom-7 rounded-[16px] border-[2px] border-ink bg-[#fff8dd] px-3 py-2 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink shadow-[3px_3px_0_var(--ink)]">
                Styled view unavailable. Using the safe fallback QR.
              </div>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-7 text-ink/72">
          {isReady
            ? styledQrFailed
              ? "The backup QR stays high-contrast so the authenticator app can still scan it reliably."
              : "The styled SVG keeps the finder patterns bold and the quiet zone clean so it still scans well in authenticator apps."
            : "Confirm your password first to request the setup QR and unlock the scan panel."}
        </p>
      </CardContent>
    </Card>
  );
}

export function AccountSettingsPanel() {
  const {
    data: session,
    isPending: isSessionPending,
    refetch,
  } = authClient.useSession();
  const sessionUser = session?.user as AccountSessionUser | undefined;
  const currentEmail = sessionUser?.email ?? "";
  const currentName = sessionUser?.name ?? "";
  const currentUsername =
    sessionUser?.username ?? getFallbackUsername(currentEmail);
  const manualSecret = getManualSecret;
  const styledQrContainerRef = useRef<HTMLDivElement | null>(null);
  const styledQrInstanceRef = useRef<QRCodeStyling | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePhrase, setDeletePhrase] = useState("");
  const [disableTwoFactorPassword, setDisableTwoFactorPassword] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [appCode, setAppCode] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [styledQrFailed, setStyledQrFailed] = useState(false);
  const [twoFactorPanelMode, setTwoFactorPanelMode] =
    useState<TwoFactorPanelMode>("hidden");
  const [identityPending, setIdentityPending] = useState(false);
  const [emailPending, setEmailPending] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [identityState, setIdentityState] = useState<StatusState>({
    tone: "idle",
    message:
      "Name and username changes are saved directly to the current account.",
  });
  const [emailState, setEmailState] = useState<StatusState>({
    tone: "idle",
    message:
      "For a verified account, a verification link is sent to the new address before the login email changes.",
  });
  const [passwordState, setPasswordState] = useState<StatusState>({
    tone: "idle",
    message:
      "Password updates require the current password and sign out your other sessions after the change succeeds.",
  });
  const [deleteState, setDeleteState] = useState<StatusState>({
    tone: "idle",
    message:
      "The danger barrier stays deliberate: password plus the `DELETE ACCOUNT` phrase, then a confirmation link sent to your email.",
  });
  const [twoFactorState, setTwoFactorState] = useState<StatusState>({
    tone: "idle",
    message:
      "Use the switch to turn two-factor security on or off. Setup on this page uses the authenticator app flow, then verifies one code before protection goes live.",
  });
  const isTwoFactorEnabled = Boolean(sessionUser?.twoFactorEnabled);
  const isTwoFactorSetupPending =
    !isTwoFactorEnabled && twoFactorPanelMode === "setup";
  const isTwoFactorSwitchOn = isTwoFactorEnabled || isTwoFactorSetupPending;
  const twoFactorStatusVariant = isTwoFactorEnabled
    ? "blue"
    : isTwoFactorSetupPending
      ? "yellow"
      : "cream";
  const twoFactorStatusLabel = isTwoFactorEnabled
    ? "Enabled"
    : isTwoFactorSetupPending
      ? "Setup Pending"
      : "Disabled";
  const twoFactorModeLabel = isTwoFactorEnabled
    ? "Authenticator app"
    : isTwoFactorSetupPending
      ? "Setup pending verification"
      : "Disabled";
  const twoFactorSummaryLabel = isTwoFactorEnabled
    ? "Authenticator app enabled"
    : isTwoFactorSetupPending
      ? "Setup pending verification"
      : "Disabled";

  function handleDownloadBackupCodes() {
    if (!backupCodes.length) {
      setTwoFactorState({
        tone: "error",
        message: "No backup codes are available to save yet.",
      });
      return;
    }

    const backupCodesFile = new Blob([buildBackupCodesText(backupCodes)], {
      type: "text/plain;charset=utf-8",
    });
    const downloadUrl = window.URL.createObjectURL(backupCodesFile);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "portofolio-admin-2fa-backup-codes.txt";
    link.click();
    window.URL.revokeObjectURL(downloadUrl);

    setTwoFactorState({
      tone: "success",
      message:
        "Backup codes downloaded as a TXT file. Keep that file somewhere private and offline.",
    });
  }

  useEffect(() => {
    if (!totpUri) {
      return;
    }

    let cancelled = false;

    void QRCode.toDataURL(totpUri, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#191919",
        light: "#ffffff",
      },
    })
      .then((dataUrl: string) => {
        if (!cancelled) {
          setQrImageUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrImageUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [totpUri]);

  useEffect(() => {
    let cancelled = false;
    const container = styledQrContainerRef.current;

    async function renderStyledQr() {
      if (!totpUri || !container) {
        return;
      }

      try {
        container.innerHTML = "";

        const styledQr = new QRCodeStyling({
          ...STYLED_QR_OPTIONS,
          data: totpUri,
        });
        styledQr.applyExtension(STYLED_QR_EXTENSION);
        styledQr.append(container);

        if (cancelled) {
          container.innerHTML = "";
          return;
        }

        styledQrInstanceRef.current = styledQr;
      } catch {
        if (!cancelled) {
          setStyledQrFailed(true);
        }
      }
    }

    void renderStyledQr();

    return () => {
      cancelled = true;
      styledQrInstanceRef.current = null;
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [totpUri]);

  async function refreshLiveSession() {
    await refetch();
  }

  function resetTwoFactorSetupState({
    clearPassword = false,
    clearBackupCodes = true,
  }: {
    clearPassword?: boolean;
    clearBackupCodes?: boolean;
  } = {}) {
    setAppCode("");
    setTotpUri(null);
    setQrImageUrl(null);
    setStyledQrFailed(false);
    if (clearPassword) {
      setAppPassword("");
    }
    if (clearBackupCodes) {
      setBackupCodes([]);
    }
  }

  async function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const trimmedName = String(formData.get("account-name") ?? "").trim();
    const trimmedUsername = String(formData.get("account-username") ?? "")
      .trim()
      .toLowerCase();

    if (!trimmedName || !trimmedUsername) {
      setIdentityState({
        tone: "error",
        message:
          "Name and username are both required before the account can be updated.",
      });
      return;
    }

    setIdentityPending(true);
    const result = await authClient.updateUser({
      name: trimmedName,
      username: trimmedUsername,
    });
    setIdentityPending(false);

    if (result.error) {
      setIdentityState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to save the account detail right now.",
        ),
      });
      return;
    }

    await refetch();
    setIdentityState({
      tone: "success",
      message:
        "Account detail saved. Your session now reflects the latest name and username.",
    });
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = newEmail.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailState({
        tone: "error",
        message: "Enter the new email address first.",
      });
      return;
    }

    if (trimmedEmail === currentEmail.toLowerCase()) {
      setEmailState({
        tone: "error",
        message:
          "The new email must be different from the current login email.",
      });
      return;
    }

    setEmailPending(true);
    const result = await authClient.changeEmail({
      newEmail: trimmedEmail,
      callbackURL: "/email-changed",
    });
    setEmailPending(false);

    if (result.error) {
      setEmailState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to start the email-change flow right now.",
        ),
      });
      return;
    }

    setNewEmail("");
    setEmailState({
      tone: "next-step",
      message:
        "Email change request submitted. Check the new address to finish the verification step before the login email changes.",
    });
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !currentPassword.trim() ||
      !nextPassword.trim() ||
      !confirmPassword.trim()
    ) {
      setPasswordState({
        tone: "error",
        message:
          "Fill in the current password, new password, and confirmation fields first.",
      });
      return;
    }

    if (nextPassword.length < 8) {
      setPasswordState({
        tone: "error",
        message: "Use at least 8 characters for the new password.",
      });
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordState({
        tone: "error",
        message: "The new password confirmation does not match yet.",
      });
      return;
    }

    setPasswordPending(true);
    const result = await authClient.changePassword({
      currentPassword,
      newPassword: nextPassword,
      revokeOtherSessions: true,
    });
    setPasswordPending(false);

    if (result.error) {
      setPasswordState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to update the password right now.",
        ),
      });
      return;
    }

    setCurrentPassword("");
    setNextPassword("");
    setConfirmPassword("");
    setPasswordState({
      tone: "success",
      message:
        "Password updated. Other sessions were signed out so the new credential takes over cleanly.",
    });
  }

  async function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (deletePhrase.trim() !== "DELETE ACCOUNT" || !deletePassword.trim()) {
      setDeleteState({
        tone: "error",
        message:
          "Type `DELETE ACCOUNT` and enter the current password before continuing.",
      });
      return;
    }

    setDeletePending(true);
    const result = await authClient.deleteUser({
      password: deletePassword,
      callbackURL: "/account-deleted",
    });
    setDeletePending(false);

    if (result.error) {
      setDeleteState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to delete the account right now.",
        ),
      });
      return;
    }

    setDeletePassword("");
    setDeletePhrase("");
      setDeleteState({
        tone: "next-step",
        message:
          "Deletion confirmation sent. Open the link in your email to permanently remove the account and finish the process.",
      });
  }

  function handleToggleTwoFactor() {
    if (isTwoFactorEnabled) {
      const nextMode = twoFactorPanelMode === "disable" ? "hidden" : "disable";
      setTwoFactorPanelMode(nextMode);

      if (nextMode === "disable") {
        setTwoFactorState({
          tone: "next-step",
          message:
            "Turning 2FA off opens a confirmation step first, then the second factor is removed after the password check succeeds.",
        });
      } else {
        setDisableTwoFactorPassword("");
        setTwoFactorState({
          tone: "idle",
          message:
            "Two-factor authentication remains enabled. Open the disable flow again whenever you want to turn it off.",
        });
      }

      return;
    }

    const nextMode = twoFactorPanelMode === "setup" ? "hidden" : "setup";
    setTwoFactorPanelMode(nextMode);

    if (nextMode === "setup") {
      resetTwoFactorSetupState({ clearPassword: true });
      setTwoFactorState({
        tone: "next-step",
        message:
          "Turning 2FA on now starts with a password check. Generate the QR next, then scan it, save the backup codes, and verify one authenticator code to finish setup.",
      });
    } else {
      resetTwoFactorSetupState({ clearPassword: true, clearBackupCodes: true });
      setTwoFactorState({
        tone: "idle",
        message:
          "Two-factor setup was canceled. Turning it on again will ask for your password and generate a fresh QR.",
      });
    }
  }

  function handleCancelTwoFactorSetup() {
    resetTwoFactorSetupState({ clearPassword: true });
    setTwoFactorPanelMode("hidden");
    setTwoFactorState({
      tone: "idle",
      message:
        "Two-factor setup was canceled. Start again with your password whenever you are ready to generate a new QR.",
    });
  }

  async function handleGenerateSetupQr() {
    if (!appPassword.trim()) {
      setTwoFactorState({
        tone: "error",
        message: "Enter the current password first to request the setup QR.",
      });
      return;
    }

    setTwoFactorPending(true);
    const result = await authClient.twoFactor.enable({
      password: appPassword,
    });
    setTwoFactorPending(false);

    if (result.error) {
      setTwoFactorState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to generate the authenticator setup QR right now.",
        ),
      });
      return;
    }

    setTotpUri(result.data?.totpURI ?? null);
    setBackupCodes(result.data?.backupCodes ?? []);
    setStyledQrFailed(false);
    setTwoFactorState({
      tone: "next-step",
      message:
        "QR generated. Scan it with your authenticator app, store the backup codes below, then enter the 6-digit code to finish enabling 2FA.",
    });
  }

  async function handleVerifyAppSetup() {
    if (appCode.trim().length < 6) {
      setTwoFactorState({
        tone: "error",
        message: "Enter the 6-digit authenticator code first.",
      });
      return;
    }

    setTwoFactorPending(true);
    const result = await authClient.twoFactor.verifyTotp({
      code: appCode.trim(),
    });
    setTwoFactorPending(false);

    if (result.error) {
      setTwoFactorState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to verify the authenticator code right now.",
        ),
      });
      return;
    }

    await refreshLiveSession();
    resetTwoFactorSetupState({ clearPassword: true, clearBackupCodes: false });
    setTwoFactorPanelMode("hidden");
    setTwoFactorState({
      tone: "success",
      message:
        "Two-factor authentication is now enabled. Save the backup codes shown below before leaving this page.",
    });
  }

  async function handleDisableTwoFactor() {
    if (!disableTwoFactorPassword.trim()) {
      setTwoFactorState({
        tone: "error",
        message: "Enter the current password first to disable 2FA.",
      });
      return;
    }

    setTwoFactorPending(true);
    const result = await authClient.twoFactor.disable({
      password: disableTwoFactorPassword,
    });
    setTwoFactorPending(false);

    if (result.error) {
      setTwoFactorState({
        tone: "error",
        message: getErrorMessage(
          result.error,
          "Unable to disable two-factor authentication right now.",
        ),
      });
      return;
    }

    await refreshLiveSession();
    setDisableTwoFactorPassword("");
    resetTwoFactorSetupState({ clearPassword: true, clearBackupCodes: true });

    setTwoFactorPanelMode("hidden");
    setTwoFactorState({
      tone: "success",
      message: "Two-factor authentication has been disabled for this account.",
    });
  }

  if (isSessionPending) {
    return (
      <Card className="paper-grid px-6 py-6 sm:px-8">
        <CardContent className="space-y-4">
          <Badge variant="blue">Account Session</Badge>
          <CardTitle>Loading your live account data.</CardTitle>
          <CardDescription>
            Your current account data is being loaded into the settings panel
            now.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (!sessionUser) {
    return (
      <Card accent="red" className="px-6 py-6 sm:px-8">
        <CardContent className="space-y-4">
          <Badge variant="red">Session Missing</Badge>
          <CardTitle>We could not load the current account.</CardTitle>
          <CardDescription>
            This admin surface is protected, so if the session is gone you can
            return to login and sign in again.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <Card className="paper-grid px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">User Account Detail</Badge>
              <CardTitle>Edit the identity behind this account</CardTitle>
              <CardDescription>
                Keep account-facing name and username separate from the public
                portfolio profile. This card updates the account you are signed
                in with.
              </CardDescription>
            </div>

            <Separator />

            <form
              key={`${currentName}:${currentUsername}`}
              className="space-y-5"
              onSubmit={handleIdentitySubmit}
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel htmlFor="account-name">Full name</FieldLabel>
                  <Input
                    id="account-name"
                    name="account-name"
                    defaultValue={currentName}
                    placeholder="Rizal Achmad"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="account-username">Username</FieldLabel>
                  <Input
                    id="account-username"
                    name="account-username"
                    defaultValue={currentUsername}
                    placeholder="rizalstudio"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" size="lg" disabled={identityPending}>
                  {identityPending ? "Saving Detail..." : "Save Account Detail"}
                </Button>
                <p className="text-sm leading-7 text-ink/65">
                  Changes here update the current account identity immediately.
                </p>
              </div>
            </form>

            <StatusNotice state={identityState} />
          </CardContent>
        </Card>

        <Card accent="blue" className="px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="blue">Change Email</Badge>
              <CardTitle>Move the login address safely</CardTitle>
              <CardDescription>
                The change stays pending until the verification step for the new
                address completes.
              </CardDescription>
            </div>

            <Separator />

            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div className="space-y-2">
                <FieldLabel htmlFor="current-email">Current email</FieldLabel>
                <Input
                  id="current-email"
                  type="email"
                  value={currentEmail}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <FieldLabel htmlFor="new-email">New email</FieldLabel>
                <Input
                  id="new-email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button type="submit" size="lg" disabled={emailPending}>
                  {emailPending ? "Starting Change..." : "Request Email Change"}
                </Button>
                <p className="text-sm leading-7 text-ink/65">
                  After verification, the account returns here with the new
                  email in place.
                </p>
              </div>
            </form>

            <StatusNotice state={emailState} />
          </CardContent>
        </Card>

        <Card className="px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="cream">Change Password</Badge>
              <CardTitle>
                Refresh credentials without leaving the page
              </CardTitle>
              <CardDescription>
                This section keeps the password update and session cleanup in
                one place.
              </CardDescription>
            </div>

            <Separator />

            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <FieldLabel htmlFor="current-password">
                  Current password
                </FieldLabel>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel htmlFor="next-password">New password</FieldLabel>
                  <Input
                    id="next-password"
                    type="password"
                    value={nextPassword}
                    onChange={(event) => setNextPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="confirm-password">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat the new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" disabled={passwordPending}>
                {passwordPending ? "Updating Password..." : "Update Password"}
              </Button>
            </form>

            <StatusNotice state={passwordState} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card accent="blue" className="px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="blue">Account Snapshot</Badge>
              <CardTitle>{currentName}</CardTitle>
              <CardDescription>
                A read-only summary of the login-facing account, separate from
                public profile storytelling and resume content.
              </CardDescription>
            </div>

            <Separator />

            <div className="space-y-4">
              <DetailRow label="Username" value={`@${currentUsername}`} />
              <DetailRow label="Primary email" value={currentEmail} />
              <DetailRow
                label="Role"
                value={formatRoleLabel(session?.user?.role)}
              />
              <DetailRow
                label="Email status"
                value={
                  sessionUser.emailVerified
                    ? "Verified"
                    : "Pending verification"
                }
              />
              <DetailRow label="Session model" value="Email + password" />
              <DetailRow
                label="2FA status"
                value={twoFactorSummaryLabel}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="paper-grid px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Setup 2FA</Badge>
              <CardTitle>Control the second factor with one switch</CardTitle>
              <CardDescription>
                Turning it on opens setup first, and turning it off still
                requires a password confirmation step.
              </CardDescription>
            </div>

            <Separator />

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-[3px] border-ink bg-white/75 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink/70">
                    Two-Factor Authentication
                  </p>
                  <Badge variant={twoFactorStatusVariant}>
                    {twoFactorStatusLabel}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-ink/72">
                  Current mode: {twoFactorModeLabel}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60">
                  {isTwoFactorSwitchOn ? "On" : "Off"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isTwoFactorSwitchOn}
                  aria-label="Toggle two-factor authentication"
                  onClick={handleToggleTwoFactor}
                  className={cn(
                    "relative inline-flex h-12 w-24 items-center rounded-full border-[3px] border-ink px-1 transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/35",
                    "shadow-[5px_5px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--ink)]",
                    isTwoFactorSwitchOn
                      ? "bg-accent-blue"
                      : "bg-white/75",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 rounded-full border-[3px] border-ink transition-transform duration-150",
                      isTwoFactorSwitchOn
                        ? "translate-x-[44px] bg-panel"
                        : "translate-x-0 bg-[#ffe776]",
                    )}
                  />
                </button>
              </div>
            </div>

            {twoFactorPanelMode === "setup" ? (
              <>
                <Separator />

                <div className="space-y-5">
                  <Card accent="blue" className="p-4">
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant="blue">Authenticator App</Badge>
                        <span className="sticker-chip sticker-chip-cream">
                          Security Setup
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-ink/78">
                        {totpUri
                          ? "Your setup materials are ready. Scan the QR, save the backup codes, then verify one authenticator code to finish enabling 2FA."
                          : "Start with your current password. After that, generate the setup QR and continue in your authenticator app."}
                      </p>
                    </CardContent>
                  </Card>

                  {totpUri ? (
                    <>
                      <RealQrPanel
                        qrContainerRef={styledQrContainerRef}
                        qrImageUrl={qrImageUrl}
                        isReady
                        styledQrFailed={styledQrFailed}
                      />

                      <Card accent="blue" className="p-4">
                        <CardContent className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <Badge variant="cream">Manual Secret</Badge>
                            <span className="sticker-chip">Fallback Copy</span>
                          </div>
                          <div className="rounded-[24px] border-[3px] border-ink bg-white/80 px-4 py-4 shadow-[5px_5px_0_var(--ink)]">
                            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-ink/55">
                              Secret for manual setup
                            </p>
                            <p className="mt-3 break-all font-display text-2xl uppercase leading-none text-ink">
                              {manualSecret(totpUri)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {backupCodes.length > 0 ? (
                        <Card accent="red" className="p-4">
                          <CardContent className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <Badge variant="red">Backup Codes</Badge>
                                <p className="text-sm leading-7 text-ink/72">
                                  Save them now or download a TXT copy before
                                  you leave this setup flow.
                                </p>
                              </div>
                              <span className="sticker-chip sticker-chip-cream">
                                Save Offline
                              </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              {backupCodes.map((code) => (
                                <div
                                  key={code}
                                  className="rounded-[22px] border-[3px] border-ink bg-white/80 px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-[4px_4px_0_var(--ink)]"
                                >
                                  {code}
                                </div>
                              ))}
                            </div>
                            <p className="text-sm leading-7 text-ink/78">
                              Save these now before leaving this page. Each code
                              is a one-time recovery path if the authenticator
                              app is unavailable later.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                              <Button
                                type="button"
                                size="lg"
                                variant="outline"
                                onClick={handleDownloadBackupCodes}
                              >
                                Download TXT
                              </Button>
                              <p className="text-sm leading-7 text-ink/65">
                                The TXT file includes all current recovery codes
                                in plain text.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : null}

                      <div className="space-y-2">
                        <FieldLabel htmlFor="app-code">
                          Verification code
                        </FieldLabel>
                        <Input
                          id="app-code"
                          type="text"
                          inputMode="numeric"
                          value={appCode}
                          onChange={(event) =>
                            setAppCode(event.target.value.replace(/\s+/g, ""))
                          }
                          placeholder="123456"
                          autoComplete="one-time-code"
                          maxLength={8}
                        />
                        <p className="text-sm leading-7 text-ink/65">
                          The account stays unprotected until this code
                          verifies.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          onClick={handleCancelTwoFactorSetup}
                        >
                          Cancel Setup
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          onClick={handleVerifyAppSetup}
                          disabled={twoFactorPending}
                        >
                          {twoFactorPending
                            ? "Verifying..."
                            : "Verify App Setup"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <FieldLabel htmlFor="app-password">
                          Confirm password
                        </FieldLabel>
                        <Input
                          id="app-password"
                          type="password"
                          value={appPassword}
                          onChange={(event) =>
                            setAppPassword(event.target.value)
                          }
                          placeholder="Enter your current password"
                          autoComplete="current-password"
                        />
                        <p className="text-sm leading-7 text-ink/65">
                          Confirm your password first. After that, use Generate
                          QR to reveal the QR code, backup codes, and
                          verification step.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          onClick={handleCancelTwoFactorSetup}
                        >
                          Cancel Setup
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          onClick={handleGenerateSetupQr}
                          disabled={twoFactorPending}
                        >
                          {twoFactorPending
                            ? "Requesting QR..."
                            : "Generate QR"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : null}

            {twoFactorPanelMode === "disable" ? (
              <>
                <Separator />

                <Card accent="red" className="p-4">
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Badge variant="red">Disable 2FA</Badge>
                      <p className="text-sm leading-7 text-ink/78">
                        Turning off 2FA remains deliberate. The second factor is
                        only removed after this password check succeeds.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <FieldLabel htmlFor="disable-two-factor-password">
                        Current password
                      </FieldLabel>
                      <Input
                        id="disable-two-factor-password"
                        type="password"
                        value={disableTwoFactorPassword}
                        onChange={(event) =>
                          setDisableTwoFactorPassword(event.target.value)
                        }
                        placeholder="Confirm your password"
                        autoComplete="current-password"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <Button
                        type="button"
                        size="lg"
                        variant="ink"
                        onClick={handleDisableTwoFactor}
                        disabled={twoFactorPending}
                      >
                        {twoFactorPending
                          ? "Disabling..."
                          : "Confirm Disable 2FA"}
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        onClick={() => setTwoFactorPanelMode("hidden")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}

            {backupCodes.length > 0 && twoFactorPanelMode !== "setup" ? (
              <>
                <Separator />

                <Card accent="red" className="p-4">
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <Badge variant="red">Backup Codes</Badge>
                        <p className="text-sm leading-7 text-ink/72">
                          These codes remain visible for this session so you can
                          still save them after setup succeeds.
                        </p>
                      </div>
                      <span className="sticker-chip sticker-chip-cream">
                        Save Offline
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {backupCodes.map((code) => (
                        <div
                          key={code}
                          className="rounded-[22px] border-[3px] border-ink bg-white/80 px-3 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink shadow-[4px_4px_0_var(--ink)]"
                        >
                          {code}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-ink/78">
                      Store these backup codes now; this page only keeps them
                      visible for the current session.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        onClick={handleDownloadBackupCodes}
                      >
                        Download TXT
                      </Button>
                      <p className="text-sm leading-7 text-ink/65">
                        Download a plain-text copy if you want an offline backup
                        outside this browser session.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}

            <StatusNotice state={twoFactorState} />
          </CardContent>
        </Card>

        <Card accent="red" className="px-6 py-6 sm:px-8">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Badge variant="red">Delete Account</Badge>
              <CardTitle>Keep the danger zone deliberate</CardTitle>
              <CardDescription>
                This destructive path is isolated on purpose. Password and the
                delete phrase start the request, then a confirmation link sent
                to your email completes the account removal.
              </CardDescription>
            </div>

            <Separator />

            <form className="space-y-5" onSubmit={handleDeleteSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel htmlFor="delete-password">
                    Current password
                  </FieldLabel>
                  <Input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    placeholder="Confirm your password"
                    autoComplete="current-password"
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="delete-phrase">
                    Type DELETE ACCOUNT
                  </FieldLabel>
                  <Input
                    id="delete-phrase"
                    value={deletePhrase}
                    onChange={(event) =>
                      setDeletePhrase(event.target.value.toUpperCase())
                    }
                    placeholder="DELETE ACCOUNT"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                variant="ink"
                disabled={deletePending}
              >
                {deletePending ? "Sending Confirmation..." : "Send Delete Confirmation"}
              </Button>
            </form>

            <StatusNotice state={deleteState} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
