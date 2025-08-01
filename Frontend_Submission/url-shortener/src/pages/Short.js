import { useState } from 'react';
import { TextField, Button, Grid, Typography, Box, Link, Divider, Snackbar, Alert } from '@mui/material';
import {
  isValidUrl,
  generateShortcode,
  isShortcodeTaken,
  getStoredData,
  saveStoredData
} from '../utils/urlUtils';
import Log from '../logging/logger';

function Short() {
  const [entries, setEntries] = useState([{ url: '', shortcode: '', expiry: '' }]);
  const [shortenedLinks, setShortenedLinks] = useState([]);
  const [errors, setErrors] = useState([{ url: '', shortcode: '', expiry: '' }]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (i, field, value) => {
    const updatedEntries = [...entries];
    updatedEntries[i][field] = value;
    setEntries(updatedEntries);

    // Clear error on input change
    const updatedErrors = [...errors];
    updatedErrors[i][field] = '';
    setErrors(updatedErrors);
  };

  const addEntry = () => {
    if (entries.length < 5) {
      setEntries([...entries, { url: '', shortcode: '', expiry: '' }]);
      setErrors([...errors, { url: '', shortcode: '', expiry: '' }]);
    }
  };

  const validateEntry = (entry, index, data) => {
    const entryErrors = { url: '', shortcode: '', expiry: '' };
    let hasError = false;

    if (!entry.url.trim()) {
      entryErrors.url = 'URL is required';
      hasError = true;
    } else if (!isValidUrl(entry.url.trim())) {
      entryErrors.url = 'Invalid URL';
      hasError = true;
    }

    if (entry.shortcode) {
      const code = entry.shortcode.trim();
      const alphanumeric = /^[a-z0-9]+$/i;
      if (!alphanumeric.test(code)) {
        entryErrors.shortcode = 'Shortcode must be alphanumeric';
        hasError = true;
      } else if (isShortcodeTaken(code, data)) {
        entryErrors.shortcode = 'Shortcode already taken';
        hasError = true;
      }
    }

    if (entry.expiry) {
      const num = Number(entry.expiry);
      if (isNaN(num) || num <= 0) {
        entryErrors.expiry = 'Expiry must be a positive number';
        hasError = true;
      }
    }

    return { entryErrors, hasError };
  };

  const validateAllEntries = () => {
    const data = getStoredData();
    let anyError = false;
    const newErrors = entries.map((entry, idx) => {
      const { entryErrors, hasError } = validateEntry(entry, idx, data);
      if (hasError) anyError = true;
      return entryErrors;
    });
    setErrors(newErrors);
    return !anyError;
  };

  const handleShorten = () => {
    if (!validateAllEntries()) {
      setSnackbar({ open: true, message: 'Please fix the errors before submitting.', severity: 'error' });
      return;
    }

    const data = getStoredData();
    const now = new Date();
    const newLinks = [];

    for (let i = 0; i < entries.length; i++) {
      const { url, shortcode, expiry } = entries[i];
      let code = shortcode?.trim();

      if (!code) {
        do {
          code = generateShortcode();
        } while (isShortcodeTaken(code, data));
      }

      const createdAt = now.toISOString();
      const minutes = expiry ? parseInt(expiry, 10) : 30;
      const expiresAt = new Date(now.getTime() + minutes * 60000).toISOString();

      data[code] = {
        originalUrl: url.trim(),
        createdAt,
        expiresAt,
        clicks: []
      };
      newLinks.push({ shortcode: code, originalUrl: url.trim(), expiresAt });
    }

    saveStoredData(data);
    Log('Short.js:handleShorten', 'info', 'url-shortener', 'Successfully shortened URLs');
    setShortenedLinks(newLinks);
    setEntries([{ url: '', shortcode: '', expiry: '' }]);
    setErrors([{ url: '', shortcode: '', expiry: '' }]);
    setSnackbar({ open: true, message: 'URLs shortened successfully!', severity: 'success' });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      {entries.map((entry, idx) => (
        <Grid container spacing={2} key={idx} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Original URL"
              value={entry.url}
              onChange={(e) => handleChange(idx, 'url', e.target.value)}
              error={Boolean(errors[idx]?.url)}
              helperText={errors[idx]?.url}
              required
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Expiry (mins)"
              value={entry.expiry}
              type="number"
              onChange={(e) => handleChange(idx, 'expiry', e.target.value)}
              error={Boolean(errors[idx]?.expiry)}
              helperText={errors[idx]?.expiry}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="Custom Shortcode"
              value={entry.shortcode}
              onChange={(e) => handleChange(idx, 'shortcode', e.target.value)}
              error={Boolean(errors[idx]?.shortcode)}
              helperText={errors[idx]?.shortcode}
            />
          </Grid>
        </Grid>
      ))}

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={addEntry} disabled={entries.length >= 5}>
          Add More
        </Button>
        <Button variant="contained" color="primary" onClick={handleShorten}>
          Shorten URLs
        </Button>
      </Box>

      {shortenedLinks.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6">Shortened Links</Typography>
          {shortenedLinks.map((link, idx) => (
            <Box key={idx} sx={{ my: 1 }}>
              <Link
                href={`http://localhost:3000/${link.shortcode}`}
                target="_blank"
                rel="noopener"
              >
                http://localhost:3000/{link.shortcode}
              </Link>
              <Typography variant="body2" color="text.secondary">
                Original: {link.originalUrl}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires at: {new Date(link.expiresAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Short;
