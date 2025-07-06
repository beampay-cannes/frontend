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
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const OrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/orders.json')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
      try {
        const response = await fetch(`/orders/${orderId}/delete`, {
          method: 'POST'
        });
        
        if (response.ok) {
          // Обновляем список заказов
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        } else {
          alert('Ошибка при удалении заказа');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Ошибка при удалении заказа');
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)', pt: 8, pb: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#fff', fontWeight: 700, mb: 4 }}>
          Orders
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 8px 40px 0 #7C4DFF22', background: '#181A20' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Product</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Address</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Quantity</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Network</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ color: '#7C4DFF', fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.slice().reverse().map(order => (
                <TableRow
                  key={order.id}
                  hover
                  sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#2d2d3a' } }}
                >
                  <TableCell 
                    sx={{ color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.id)}
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.productTitle || '')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.name || '')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.address || '')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.quantity || '')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: order.status === 'paid' ? '#4CAF50' : order.status === 'unpaid' ? '#f44336' : '#fff', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {order.status === 'не оплачен' ? 'unpaid' : order.status === 'оплачен' ? 'paid' : String(order.status || '')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: order.paidNetwork === 'base' ? '#00E5FF' : order.paidNetwork === 'ethereum' ? '#7C4DFF' : '#fff', fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {String(order.paidNetwork || '-')}
                  </TableCell>
                  <TableCell 
                    sx={{ color: '#fff', cursor: 'pointer' }}
                    onClick={() => navigate(`/order/${order.id}/pay`)}
                  >
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Удалить заказ">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': { 
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            color: '#d32f2f'
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default OrderListPage; 