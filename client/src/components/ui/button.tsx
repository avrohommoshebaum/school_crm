// src/components/ui/button.tsx
import * as React from "react";
import MuiButton, {
  type ButtonProps as MuiButtonProps,
} from "@mui/material/Button";

type CustomVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type CustomSize = "default" | "sm" | "lg" | "icon";

export interface AppButtonProps
  extends Omit<MuiButtonProps, "variant" | "color" | "size"> {
  variant?: CustomVariant;
  size?: CustomSize;
}

/**
 * AppButton – MUI-based replacement for the previous Tailwind/cva button.
 */
 const Button = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  function Button(
    {
      variant = "default",
      size = "default",
      children,
      sx,
      ...props
    },
    ref
  ) {
    // Map your custom variants to MUI's color/variant
    const muiVariant: MuiButtonProps["variant"] =
      variant === "ghost" || variant === "link" ? "text"
      : variant === "outline" ? "outlined"
      : "contained";

    const muiColor: MuiButtonProps["color"] =
      variant === "destructive" ? "error"
      : variant === "secondary" ? "secondary"
      : "primary";

    const muiSize: MuiButtonProps["size"] =
      size === "sm" ? "small"
      : size === "lg" ? "medium" // keep default as medium, icon handled via sx
      : "medium";

    const isIconOnly = size === "icon";

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={muiColor}
        size={muiSize}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          textTransform: "none",
          borderRadius: 1, // 8px-ish
          fontWeight: 500,
          whiteSpace: "nowrap",

          // Sizes
          ...(size === "sm" && {
            minHeight: 32,
            px: 1.5,
            py: 0.5,
          }),
          ...(size === "default" && {
            minHeight: 36,
            px: 2,
            py: 0.75,
          }),
          ...(size === "lg" && {
            minHeight: 40,
            px: 3,
            py: 1,
          }),
          ...(isIconOnly && {
            minWidth: 36,
            minHeight: 36,
            px: 0,
          }),

          // Link look
          ...(variant === "link" && {
            textDecoration: "underline",
            textUnderlineOffset: "0.2em",
            "&:hover": {
              textDecoration: "underline",
              backgroundColor: "transparent",
            },
          }),

          // Ghost look
          ...(variant === "ghost" && {
            backgroundColor: "transparent",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }),

          // Allow consumers to override via sx
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiButton>
    );
  }
);

export default Button;
export { Button };
