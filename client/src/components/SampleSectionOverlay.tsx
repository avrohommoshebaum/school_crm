import { Box, Typography } from "@mui/material";

export default function SampleSectionOverlay({
  text = "SAMPLE",
}: {
  text?: string;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}
    >
      <Typography
        sx={{
          fontSize: 64,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          opacity: 0.08,
          transform: "rotate(-25deg)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
