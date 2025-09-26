import React from 'react';
import { Button } from '@mui/material';

export default function FileDownload({ url, label }) {
  return (
    <Button href={url} target="_blank" variant="outlined" sx={{ m: 1 }}>
      {label}
    </Button>
  );
} 