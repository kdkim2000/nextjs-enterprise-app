'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Paper
} from '@mui/material';
import { ArrowBack, Home } from '@mui/icons-material';
import Link from 'next/link';
import { componentCategories } from '../../../constants/componentData';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Find category by converting name to slug
  const category = componentCategories.find(
    (cat) => cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );

  if (!category) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Category not found</Typography>
      </Box>
    );
  }

  const CategoryIcon = category.icon;

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component={Link}
          href="/dev"
          underline="hover"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Home fontSize="small" />
          Dev
        </MuiLink>
        <MuiLink
          component={Link}
          href="/dev/components"
          underline="hover"
          color="inherit"
        >
          Components
        </MuiLink>
        <Typography color="text.primary">{category.category}</Typography>
      </Breadcrumbs>

      {/* Category Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
          borderLeft: `4px solid ${category.color}`
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <CategoryIcon sx={{ fontSize: 48, color: category.color }} />
          <Box>
            <Typography variant="h4" gutterBottom>
              {category.category}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {category.description}
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={`${category.components.length} Components`}
          size="small"
          sx={{ bgcolor: category.color, color: 'white' }}
        />
      </Paper>

      {/* Components Grid */}
      <Grid container spacing={3}>
        {category.components.map((component, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea
                onClick={() => router.push(component.path)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {component.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 40 }}
                  >
                    {component.description}
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {component.tags.map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
