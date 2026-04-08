declare module "qrcode" {
  type QRCodeOptions = {
    errorCorrectionLevel?: "low" | "medium" | "quartile" | "high" | "L" | "M" | "Q" | "H";
    margin?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  };

  const QRCode: {
    toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  };

  export default QRCode;
}
