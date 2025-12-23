import { userService } from "../db/services/userService.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export const startMfaSetup = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: "Nachlas School App",
  });

  const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

  const userId = req.user._id || req.user.id;
  await userService.update(userId, { mfaTempSecret: secret.base32 });

  res.json({ 
    qrCodeDataUrl,
    secret: secret.base32 
  });
};

export const verifyMfaSetup = async (req, res) => {
  const { token } = req.body;
  const userId = req.user._id || req.user.id;
  const user = await userService.findById(userId);

  if (!user || !user.mfaTempSecret) {
    return res.status(400).json({ message: "MFA setup not started" });
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaTempSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!verified) {
    return res.status(400).json({ message: "Invalid MFA code" });
  }

  await userService.update(userId, {
    mfaSecret: user.mfaTempSecret,
    mfaEnabled: true,
    mfaTempSecret: null,
  });

  res.json({ message: "MFA Enabled" });
};

export const disableMfa = async (req, res) => {
  const userId = req.user._id || req.user.id;
  
  await userService.update(userId, {
    mfaEnabled: false,
    mfaSecret: null,
    mfaTempSecret: null,
  });

  res.json({ message: "MFA disabled" });
};
