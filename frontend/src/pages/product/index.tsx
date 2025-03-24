import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress
} from '@mui/material';
import { Box, styled } from '@mui/system';
import { RootState } from '../../store/store';
import { CardProps } from '../../types';
import EditProductModal from './edit_product_modal';
import { removeProduct, removeExistingProduct } from '../../store/goodsSlice';
import { AppDispatch } from '../../store/store';

const StyledContainer = styled('div')({
    maxWidth: '60vw',
    margin: '2rem auto'
});

const StyledImg = styled('img')({
    width: '100%',
    height: 'auto',
    borderRadius: '8px'
});

const ProductPage: React.FC = () => {
    const { id } = useParams();
    const productId = id;
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false);

    const product = useSelector((state: RootState) =>
        state.goods.items.find((item: CardProps) => item.id === productId)
    );

    const goodsStatus = useSelector((state: RootState) => state.goods.status);

    const category = useSelector((state: RootState) =>
        state.categories.items.find((cat) => cat.id === (product ? product.categoryId : ''))
    );

    const [editModalOpen, setEditModalOpen] = useState(false);

    const handleEditOpen = () => {
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
    };

    const handleDelete = () => {
        if (product) {
            setIsDeleting(true);
            dispatch(removeExistingProduct(product.id))
                .then(() => {
                    navigate('/products');
                })
                .catch((error) => {
                    console.error("Ошибка при удалении товара:", error);
                    setIsDeleting(false);
                });
        }
    };

    if (!product) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                {goodsStatus === 'loading' ? (
                    <CircularProgress />
                ) : (
                    <Typography variant="h6">
                        Продукт не найден
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <StyledContainer>
            <Box>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogContent dividers>
                    <StyledImg
                        src={product.imageUrl ? product.imageUrl : 'static/no-image.svg'}
                        alt={product.name}
                    />
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        {product.description}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                        Категория:{' '}
                        {category ? `${category.name}${category.description ? ' (' + category.description + ')' : ''}` : product.categoryId}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                        Количество: {product.count} {product.units}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
                        Цена: {product.price}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditOpen} color="primary" variant="contained"
                            disabled={isDeleting}>
                        Редактировать товар
                    </Button>
                    <Button
                        onClick={handleDelete}
                        color="secondary"
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isDeleting ? 'Удаление...' : 'Удалить товар'}
                    </Button>
                    <Button onClick={() => navigate('/products')} color="inherit" disabled={isDeleting}>
                        Назад
                    </Button>
                </DialogActions>
            </Box>
            {editModalOpen && (
                <EditProductModal
                    open={editModalOpen}
                    onClose={handleEditClose}
                    product={product}
                />
            )}
        </StyledContainer>
    );
};

export default ProductPage;
