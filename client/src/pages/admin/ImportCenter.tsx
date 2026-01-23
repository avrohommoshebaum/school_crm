import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PeopleIcon from "@mui/icons-material/People";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroom";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";

export default function ImportCenter() {
  const navigate = useNavigate();

  const importOptions = [
    {
      title: "Students",
      description: "Bulk import students with grade and class assignments",
      icon: PeopleIcon,
      color: "primary",
      path: "/business-office/import",
      type: "students",
    },
    {
      title: "Families & Students",
      description: "Import families with students, parents, and relationships",
      icon: FamilyRestroomIcon,
      color: "success",
      path: "/business-office/import",
      type: "families-students",
    },
    {
      title: "Staff",
      description: "Bulk import staff members with positions",
      icon: BusinessIcon,
      color: "warning",
      path: "/admin/staff",
      type: "staff",
    },
    {
      title: "Classes",
      description: "Import classes with grade assignments",
      icon: ClassIcon,
      color: "info",
      path: "/classes",
      type: "classes",
    },
  ];

  const handleImport = (option: typeof importOptions[0]) => {
    if (option.type === "families-students") {
      navigate("/business-office/import");
    } else if (option.type === "students") {
      navigate("/business-office/import?type=students");
    } else if (option.type === "staff") {
      navigate("/admin/staff?import=true");
    } else if (option.type === "classes") {
      navigate("/classes?import=true");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Import Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bulk import data into the system. All imports include validation and matching to prevent duplicates.
          </Typography>
        </Box>

        <Divider />

        <Grid container spacing={3}>
          {importOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={option.title}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          bgcolor: `${option.color}.light`,
                          color: `${option.color}.main`,
                        }}
                      >
                        <Icon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="contained"
                      color={option.color as any}
                      fullWidth
                      startIcon={<UploadFileIcon />}
                      onClick={() => handleImport(option)}
                    >
                      Import {option.title}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Paper sx={{ p: 3, bgcolor: "info.light", color: "info.contrastText" }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Import Features
          </Typography>
          <Stack spacing={1} component="ul" sx={{ m: 0, pl: 3 }}>
            <Typography component="li" variant="body2">
              Automatic duplicate detection and matching
            </Typography>
            <Typography component="li" variant="body2">
              Cross-reference matching (e.g., students to families by name)
            </Typography>
            <Typography component="li" variant="body2">
              Column mapping for flexible spreadsheet formats
            </Typography>
            <Typography component="li" variant="body2">
              Validation with error review before import
            </Typography>
            <Typography component="li" variant="body2">
              Merge or update options for existing records
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
