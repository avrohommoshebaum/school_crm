import User from "../db/models/user.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export const startMfaSetup = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: "Nachlas School App",
  });

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  req.user.mfaTempSecret = secret.base32;
  await req.user.save();

  res.json({ 
    qrCodeDataUrl,
    secret: secret.base32 
  });
};

export const verifyMfaSetup = async (req, res) => {
  const { token } = req.body;

  const verified = speakeasy.totp.verify({
    secret: req.user.mfaTempSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ message: "Invalid MFA code" });
  }

  req.user.mfaSecret = req.user.mfaTempSecret;
  req.user.mfaEnabled = true;
  req.user.mfaTempSecret = undefined;

  await req.user.save();

  res.json({ message: "MFA Enabled" });
};

export const disableMfa = async (req, res) => {
  req.user.mfaEnabled = false;
  req.user.mfaSecret = undefined;
  req.user.mfaTempSecret = undefined;

  await req.user.save();

  res.json({ message: "MFA disabled" });
};
