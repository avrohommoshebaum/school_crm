// src/components/ui/label.tsx
import FormLabel, { type FormLabelProps } from "@mui/material/FormLabel";

const Label = ({ className, ...props }: FormLabelProps) => {
  return (
    <FormLabel
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: "0.875rem",
        fontWeight: 500,
        userSelect: "none",
        "&.Mui-disabled": {
          opacity: 0.5,
          pointerEvents: "none",
        },
      }}
      className={className}
      {...props}
    />
  );
}



export default Label;
export { Label };