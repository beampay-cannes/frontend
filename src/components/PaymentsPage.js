import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    productId: '',
    amount: '',
    customerName: '',
    customerEmail: '',
    status: 'pending',
  });

  useEffect(() => {
    const savedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setPayments(savedPayments);
    setProducts(savedProducts);
  }, []);

  const handleAddPayment = () => {
    if (!newPayment.productId || !newPayment.amount || !newPayment.customerName) {
      alert('Please fill in all required fields');
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(newPayment.productId));
    
    const payment = {
      id: Date.now(),
      ...newPayment,
      amount: parseFloat(newPayment.amount),
      productTitle: selectedProduct?.title || 'Unknown Product',
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    setNewPayment({
      productId: '',
      amount: '',
      customerName: '',
      customerEmail: '',
      status: 'pending',
    });
    setOpenDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success.main';
      case 'pending': return 'warning.main';
      case 'failed': return 'error.main';
      default: return 'text.secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Paid';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ mr: 1 }}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Payments
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Payment
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Revenue
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  ₽{String(totalRevenue || 0).toLocaleString()}
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Payments
                </Typography>
                <Typography variant="h4" component="div">
                  {String(payments.length || 0)}
                </Typography>
                <PaymentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Successful Payments
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {String(completedPayments || 0)}
                </Typography>
                <PaymentIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell>{String(payment.productTitle || '')}</TableCell>
                    <TableCell>{String(payment.customerName || '')}</TableCell>
                    <TableCell>{String(payment.customerEmail || '')}</TableCell>
                    <TableCell align="right">
                      ₽{String(payment.amount || '0').toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: getStatusColor(payment.status) }}
                      >
                        {getStatusText(payment.status)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {payments.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No payments found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{ mt: 2 }}
            >
              Add First Payment
            </Button>
          </Box>
        )}
      </Container>

      {/* Add Payment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Payment</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Product *"
            value={newPayment.productId}
            onChange={(e) => setNewPayment(prev => ({ ...prev, productId: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={product.id}>
                {product.title} - ₽{product.price}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Amount (₽) *"
            type="number"
            value={newPayment.amount}
            onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Customer Name *"
            value={newPayment.customerName}
            onChange={(e) => setNewPayment(prev => ({ ...prev, customerName: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Customer Email"
            type="email"
            value={newPayment.customerEmail}
            onChange={(e) => setNewPayment(prev => ({ ...prev, customerEmail: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Status"
            value={newPayment.status}
            onChange={(e) => setNewPayment(prev => ({ ...prev, status: e.target.value }))}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Paid</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddPayment} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PaymentsPage; 