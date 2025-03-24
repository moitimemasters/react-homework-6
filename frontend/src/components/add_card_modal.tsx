import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    TextField,
    Box,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, addNewProduct, ALL_CATEGORIES } from '../store/goodsSlice';
import { CardProps, Category } from '../types';
import { RootState } from '../store/store';
import { AppDispatch } from '../store/store';

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
}

const StyledDialog = styled(Dialog)(() => ({
    '& .MuiDialog-paper': {
        minWidth: '60vw',
        minHeight: '30vh',
        padding: '16px',
    },
}));

const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector((state: RootState) => state.categories.items) as Category[];
    const goodsStatus = useSelector((state: RootState) => state.goods.status);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [localCategory, setLocalCategory] = useState<string>('');
    const [count, setCount] = useState<number | ''>('');
    const [price, setPrice] = useState<number | ''>('');
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        if (!name.trim()) errors.name = 'Название обязательно';
        if (!description.trim()) errors.description = 'Описание обязательно';
        if (!localCategory) errors.category = 'Категория обязательна';
        if (count === '' || Number(count) < 0) errors.count = 'Количество обязательно и должно быть неотрицательным';
        if (price === '' || Number(price) < 0) errors.price = 'Цена обязательна и должна быть неотрицательной';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm() || isSubmitting) return;

        const newProduct: CardProps = {
            id: Date.now().toString(), // Временный ID, который будет заменен на ID с сервера
            name: name.trim(),
            description: description.trim(),
            categoryId: localCategory,
            count: Number(count),
            price: Number(price),
            units: "шт",
        };

        // Используем thunk для создания через API
        setIsSubmitting(true);
        dispatch(addNewProduct(newProduct))
            .then(() => {
                // Очистка формы
                setName('');
                setDescription('');
                setLocalCategory('');
                setCount('');
                setPrice('');
                setFormErrors({});
                onClose();
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <StyledDialog open={open} onClose={() => !isSubmitting && onClose()} fullWidth maxWidth="sm">
            <DialogTitle>Добавить новый товар</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        label="Название товара"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
                        disabled={isSubmitting}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        multiline
                        rows={3}
                        label="Описание"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                        disabled={isSubmitting}
                    />
                    <TextField
                        select
                        margin="normal"
                        fullWidth
                        label="Категория"
                        value={localCategory}
                        onChange={(e) => setLocalCategory(e.target.value)}
                        error={!!formErrors.category}
                        helperText={formErrors.category}
                        disabled={isSubmitting}
                    >
                        {categories.map((category: Category) => (
                            <MenuItem key={category.id} value={category.id}>
                                {category.name}
                            </MenuItem>
                        ))}
                    </TextField>


                    <TextField
                        margin="normal"
                        fullWidth
                        type="number"
                        label="Количество на складе"
                        value={count}
                        onChange={(e) => setCount(e.target.value === '' ? '' : Number(e.target.value))}
                        error={!!formErrors.count}
                        helperText={formErrors.count}
                        disabled={isSubmitting}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        type="number"
                        label="Цена"
                        value={price}
                        onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                        error={!!formErrors.price}
                        helperText={formErrors.price}
                        disabled={isSubmitting}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
                    Отмена
                </Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'Добавление...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default AddProductModal;
