import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { PlayArrow, Stop, Refresh } from '@mui/icons-material';

const ScannerControl = () => {
  const [scannerStatus, setScannerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:4000/scanner/status');
      const data = await response.json();
      if (data.success) {
        setScannerStatus(data.status);
      }
    } catch (err) {
      console.error('Failed to fetch scanner status:', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Обновляем каждые 5 секунд
    return () => clearInterval(interval);
  }, []);

  const startScanner = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/scanner/start', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to start scanner');
      }
    } catch (err) {
      setError('Failed to start scanner');
    } finally {
      setLoading(false);
    }
  };

  const stopScanner = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/scanner/stop', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        await fetchStatus();
      } else {
        setError(data.error || 'Failed to stop scanner');
      }
    } catch (err) {
      setError('Failed to stop scanner');
    } finally {
      setLoading(false);
    }
  };

  if (!scannerStatus) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading scanner status...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Network Scanner Control
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Scanner Status: 
          <Chip 
            label={scannerStatus.isScanning ? 'Running' : 'Stopped'}
            color={scannerStatus.isScanning ? 'success' : 'default'}
            size="small"
            sx={{ ml: 1 }}
          />
        </Typography>
      </Box>

      {scannerStatus.lastScannedBlock && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last Scanned Blocks:
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Chip 
              label={`Base: ${scannerStatus.lastScannedBlock.base}`}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Ethereum: ${scannerStatus.lastScannedBlock.ethereum}`}
              size="small"
            />
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<PlayArrow />}
          onClick={startScanner}
          disabled={loading || scannerStatus.isScanning}
        >
          Start Scanner
        </Button>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<Stop />}
          onClick={stopScanner}
          disabled={loading || !scannerStatus.isScanning}
        >
          Stop Scanner
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchStatus}
          disabled={loading}
        >
          Refresh Status
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary">
        The scanner monitors Base and Ethereum networks for contract events and automatically marks orders as paid when transactions are detected.
      </Typography>
    </Paper>
  );
};

export default ScannerControl; 