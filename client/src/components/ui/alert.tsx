// src/components/ui/alert.tsx
import * as React from "react";
import MuiAlert from "@mui/material/Alert";
import type { AlertProps as MuiAlertProps } from "@mui/material";
import MuiAlertTitle, {
  type AlertTitleProps as MuiAlertTitleProps,
} from "@mui/material/AlertTitle";
import Typography, {
  type TypographyProps,
} from "@mui/material/Typography";

export interface AlertProps
  extends Omit<MuiAlertProps, "severity" | "variant"> {
  /**
   * Custom variant that maps to MUI severities:
   * - "default" -> "info"
   * - "destructive" -> "error"
   */
  variant?: "default" | "destructive";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = "default", children, ...props },
  ref
) {
  const severity: MuiAlertProps["severity"] =
    variant === "destructive" ? "error" : "info";

  return (
    <MuiAlert
      ref={ref}
      severity={severity}
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: 2,
        alignItems: "flex-start",
      }}
      {...props}
    >
      {children}
    </MuiAlert>
  );
});

function AlertTitle(props: MuiAlertTitleProps) {
  return (
    <MuiAlertTitle
      sx={{
        fontWeight: 600,
        lineHeight: 1.4,
      }}
      {...props}
    />
  );
}

function AlertDescription(props: TypographyProps) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 0.5 }}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
