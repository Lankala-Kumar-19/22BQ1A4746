import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import Log from '../logging/logger'; 


function getStoredData() {
  try {
    const data = localStorage.getItem('shortenedUrls');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}


function saveStoredData(data) {
  localStorage.setItem('shortenedUrls', JSON.stringify(data));
}


function getGeoLocation() {
  try {
    
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  } catch {
    return 'unknown';
  }
}

export default function Redirect() {
  const { shortcode } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'error', 'redirecting'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!shortcode) {
      setErrorMsg('Invalid shortcode.');
      setStatus('error');
      return;
    }

    const data = getStoredData();
    const linkData = data[shortcode];

    if (!linkData) {
      setErrorMsg('Shortcode not found.');
      setStatus('error');
      Log('Redirect.js', 'error', 'url-shortener', `Shortcode ${shortcode} not found`);
      return;
    }

    const now = new Date();
    const expiresAt = new Date(linkData.expiresAt);

    if (now > expiresAt) {
      setErrorMsg('Link has expired.');
      setStatus('error');
      Log('Redirect.js', 'error', 'url-shortener', `Shortcode ${shortcode} expired`);
      return;
    }

    
    const clickEvent = {
      timestamp: now.toISOString(),
      referrer: document.referrer || 'direct',
      geo: getGeoLocation(),
    };

    
    linkData.clicks = linkData.clicks || [];
    linkData.clicks.push(clickEvent);
    data[shortcode] = linkData;
    saveStoredData(data);

    Log('Redirect.js', 'info', 'url-shortener', `Redirecting shortcode ${shortcode}`);

    setStatus('redirecting');

   
    setTimeout(() => {
      window.location.href = linkData.originalUrl;
    }, 1000);
  }, [shortcode]);

  if (status === 'loading' || status === 'redirecting') {
    return (
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {status === 'loading' ? 'Loading...' : 'Redirecting...'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h5" color="error" gutterBottom>
        {errorMsg}
      </Typography>
      <Button href="/" variant="contained">
        Go Home
      </Button>
    </Box>
  );
}
