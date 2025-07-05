import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Home as HomeIcon, Delete as DeleteIcon } from '@mui/icons-material';

const OrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/orders.json')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      const response = await fetch(`http://localhost:4000/orders/${orderId}/delete`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setOrders(orders => orders.filter(order => order.id !== orderId));
      } else {
        alert('Failed to delete order');
      }
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => navigate('/')} sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Order List
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
          Orders
        </Typography>
        {orders.length === 0 ? (
          <Typography variant="h6" color="text.secondary" align="center">
            No orders found
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.slice().reverse().map(order => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(order.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.productTitle}</TableCell>
                    <TableCell>{order.name}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      <span style={{
                        color: order.status === 'paid' ? 'green' : order.status === 'unpaid' ? 'red' : 'inherit',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}>
                        {order.status === 'не оплачен' ? 'unpaid' : order.status === 'оплачен' ? 'paid' : order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.paidNetwork ? (
                        <span style={{
                          color: order.paidNetwork === 'base' ? '#0052ff' : order.paidNetwork === 'ethereum' ? '#627eea' : 'inherit',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}>
                          {order.paidNetwork}
                        </span>
                      ) : (
                        <span style={{ color: 'gray', fontStyle: 'italic' }}>-</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  );
};

export default OrderListPage; 