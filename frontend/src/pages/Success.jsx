import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  HourglassEmpty as PendingIcon,
  QrCode2 as QrIcon,
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const Success = () => {
  const { requestId } = useParams();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(requestId || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create QR Code URL using public QR Server API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${requestId || 'SC-UNKNOWN'}&color=0f172a`;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', py: 4 }}>
      <Container maxWidth="xs">
        <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden', textAlign: 'center' }}>
          <Box sx={{ bgcolor: '#10B981', py: 4, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SuccessIcon sx={{ fontSize: 64, mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Registration Successful
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Your request has been submitted
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Request ID Display */}
            <Typography variant="caption" color="textSecondary" display="block" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Request ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 0.5 }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 800, letterSpacing: '1px' }}>
                {requestId}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy Request ID"}>
                <IconButton onClick={handleCopy} color={copied ? "success" : "primary"} size="small">
                  {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Status Pill */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 5, bgcolor: '#FEF3C7', color: '#D97706', mt: 2, mb: 3 }}>
              <PendingIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Pending Approval
              </Typography>
            </Box>

            {/* Frontdesk Wait Info Alert/Message */}
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, fontWeight: 500, px: 1, lineHeight: 1.5 }}>
              Your pass request has been submitted. Please wait at the front desk for your gate pass to be printed and issued. Please inform the front desk after registering.
            </Typography>

            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                display: 'inline-flex',
                bgcolor: '#FFFFFF',
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                mb: 3
              }}
            >
              <Box
                component="img"
                src={qrUrl}
                alt="Gate Pass Request QR Code"
                sx={{ width: 160, height: 160, display: 'block' }}
              />
            </Paper>

            <Divider sx={{ mb: 3 }} />

            {/* Back to Home Button */}
            <Button
              component={Link}
              to="/register"
              variant="outlined"
              fullWidth
              startIcon={<BackIcon />}
              sx={{ borderRadius: 2, py: 1.25, fontWeight: 600 }}
            >
              New Registration
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Success;
