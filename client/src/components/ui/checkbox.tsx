// src/components/ui/checkbox.tsx
import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import type { SxProps } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";

export interface AppCheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  sx?: SxProps;
}

const AppCheckbox: React.FC<AppCheckboxProps> = ({
  className,
  sx,
  ...props
}) => {
  return (
    <Checkbox
      checkedIcon={<CheckIcon />}
      sx={{
        width: 20,
        height: 20,
        padding: 0.5,
        borderRadius: "4px",
        color: "grey.400",
        border: "2px solid",
        borderColor: "grey.400",
        backgroundColor: "transparent",
        "&.Mui-checked": {
          color: "primary.main",
          borderColor: "primary.main",
          backgroundColor: "primary.main",
          "& .MuiSvgIcon-root": {
            color: "white",
          },
        },
        "&:hover": {
          borderColor: "grey.600",
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        "&.Mui-disabled": {
          color: "grey.300",
          borderColor: "grey.300",
        },
        ...sx,
      }}
      className={className}
      {...props}
    />
  );
};

export default AppCheckbox;
export { AppCheckbox };

