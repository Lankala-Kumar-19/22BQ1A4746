import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString();
}

export default function Stats() {
  const [data, setData] = useState({});
  const [openRows, setOpenRows] = useState({}); // track which rows are expanded

  useEffect(() => {
    const stored = localStorage.getItem('shortenedUrls');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  const toggleRow = (shortcode) => {
    setOpenRows((prev) => ({
      ...prev,
      [shortcode]: !prev[shortcode],
    }));
  };

  if (Object.keys(data).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6">No shortened URLs found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        URL Shortener Statistics
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Shortcode</TableCell>
              <TableCell>Original URL</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Clicks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(data).map(([shortcode, info]) => (
              <React.Fragment key={shortcode}>
                <TableRow>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleRow(shortcode)}>
                      {openRows[shortcode] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`http://localhost:3000/${shortcode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortcode}
                    </a>
                  </TableCell>
                  <TableCell>
                    <a href={info.originalUrl} target="_blank" rel="noopener noreferrer">
                      {info.originalUrl}
                    </a>
                  </TableCell>
                  <TableCell>{formatDateTime(info.createdAt)}</TableCell>
                  <TableCell>{formatDateTime(info.expiresAt)}</TableCell>
                  <TableCell>{info.clicks?.length || 0}</TableCell>
                </TableRow>

                
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openRows[shortcode]} timeout="auto" unmountOnExit>
                      <Box margin={1}>
                        <Typography variant="subtitle1" gutterBottom component="div">
                          Click Details
                        </Typography>
                        {info.clicks && info.clicks.length > 0 ? (
                          <Table size="small" aria-label="click details">
                            <TableHead>
                              <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Referrer</TableCell>
                                <TableCell>Geo Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {info.clicks.map((click, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{formatDateTime(click.timestamp)}</TableCell>
                                  <TableCell>{click.referrer}</TableCell>
                                  <TableCell>{click.geo}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography>No clicks recorded yet.</Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
