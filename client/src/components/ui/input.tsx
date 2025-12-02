// src/components/ui/input.tsx
import TextField, { type TextFieldProps } from "@mui/material/TextField";

export interface InputProps
  extends Omit<TextFieldProps, "variant" | "fullWidth" | "margin"> {}


export function Input({ className, sx, ...props }: InputProps) {
  return (
    <TextField
      className={className}
      variant="outlined"
      size="small"
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 1, // ~8px
        },
        "& .MuiOutlinedInput-input": {
          fontSize: "0.9rem",
          paddingTop: 0.75,
          paddingBottom: 0.75,
        },
        ...sx,
      }}
      {...props}
    />
  );
}
