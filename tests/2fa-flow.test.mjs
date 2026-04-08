import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function readWorkspaceFile(relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8");
}

test("Better Auth server keeps the default verification-on-enable flow explicit", async () => {
  const authSource = await readWorkspaceFile("lib/auth.ts");

  assert.match(authSource, /twoFactor\(\{\s*issuer:\s*"Portofolio Admin"/s);
  assert.match(authSource, /skipVerificationOnEnable:\s*false/);
});

test("account settings setup flow requires password before generating the QR", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(panelSource, /from "qr-code-styling"/);
  assert.match(
    panelSource,
    /if\s*\(!appPassword\.trim\(\)\)\s*\{\s*setTwoFactorState\(\{\s*tone:\s*"error",\s*message:\s*"Enter the current password first to request the setup QR\."/s,
  );
  assert.match(
    panelSource,
    /authClient\.twoFactor\.enable\(\{\s*password:\s*appPassword,\s*\}\)/s,
  );
  assert.match(panelSource, /setTotpUri\(result\.data\?\.totpURI \?\? null\)/);
  assert.match(panelSource, /setBackupCodes\(result\.data\?\.backupCodes \?\? \[\]\)/);
  assert.match(panelSource, /twoFactorPending \? "Requesting QR\.\.\." : "Generate QR"/);
});

test("account settings only reveals QR, backup codes, and verification after the TOTP URI exists", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(panelSource, /{totpUri \? \(/);
  assert.match(panelSource, /<RealQrPanel\s+qrContainerRef=\{styledQrContainerRef\}/s);
  assert.match(panelSource, /<FieldLabel htmlFor="app-code">\s*Verification code\s*<\/FieldLabel>/s);
  assert.match(panelSource, /backupCodes\.length > 0 \? \(/);
});

test("account settings uses a styled SVG QR with a basic qrcode fallback", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(panelSource, /new QRCodeStyling\(\{\s*\.\.\.STYLED_QR_OPTIONS,\s*data:\s*totpUri,/s);
  assert.match(panelSource, /styledQr\.applyExtension\(STYLED_QR_EXTENSION\)/);
  assert.match(panelSource, /QRCode\.toDataURL\(totpUri,\s*\{\s*errorCorrectionLevel:\s*"H"/s);
  assert.match(panelSource, /styledQrFailed \? \(/);
  assert.match(panelSource, /Styled preview unavailable\. Using the safe fallback QR\./);
});

test("account settings lets users download backup codes as a txt file", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(panelSource, /function buildBackupCodesText\(backupCodes: string\[\]\)/);
  assert.match(panelSource, /function handleDownloadBackupCodes\(\)/);
  assert.match(panelSource, /new Blob\(\[buildBackupCodesText\(backupCodes\)\],/);
  assert.match(panelSource, /link\.download = "portofolio-admin-2fa-backup-codes\.txt"/);
  assert.match(panelSource, /Download TXT/);
});

test("account settings keeps backup codes visible until verifyTotp succeeds and the setup panel closes", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(panelSource, /authClient\.twoFactor\.verifyTotp\(\{\s*code:\s*appCode\.trim\(\),\s*\}\)/s);
  assert.match(
    panelSource,
    /resetTwoFactorSetupState\(\{\s*clearPassword:\s*true,\s*clearBackupCodes:\s*false\s*\}\)/s,
  );
  assert.match(panelSource, /backupCodes\.length > 0 && twoFactorPanelMode !== "setup"/);
});

test("login flow redirects to the second-factor step when Better Auth requires it", async () => {
  const loginSource = await readWorkspaceFile("app/login/page.tsx");

  assert.match(loginSource, /if\s*\(context\.data\?\.twoFactorRedirect\)/);
  assert.match(loginSource, /Continue with your second-factor verification on the next screen\./);
});

test("2FA disable continues to require password confirmation", async () => {
  const panelSource = await readWorkspaceFile("app/admin/account/account-settings-panel.tsx");

  assert.match(
    panelSource,
    /if\s*\(!disableTwoFactorPassword\.trim\(\)\)\s*\{\s*setTwoFactorState\(\{\s*tone:\s*"error",\s*message:\s*"Enter the current password first to disable 2FA\."/s,
  );
  assert.match(
    panelSource,
    /authClient\.twoFactor\.disable\(\{\s*password:\s*disableTwoFactorPassword,\s*\}\)/s,
  );
});
