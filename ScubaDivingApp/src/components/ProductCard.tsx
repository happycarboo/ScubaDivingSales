import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Product } from '../patterns/factory/ProductFactory';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || 'https://via.placeholder.com/200'}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 2 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.brand}
        </Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.type}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard; 