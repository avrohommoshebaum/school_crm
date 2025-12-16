import { Box } from "@mui/material";
import SampleSectionOverlay from "./SampleSectionOverlay";

export function SampleWrapper({
  children,
  disabled = true,
  label = "Sample",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Box sx={{ position: "relative" }}>
      <Box
        sx={{
          opacity: 0.6,
          filter: "grayscale(40%)",
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        {children}
      </Box>

      <SampleSectionOverlay text={label} />
    </Box>
  );
}
