import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { CardProps } from '../../types';
import { useDispatch, useSelector } from 'react-redux';
import { editProduct } from '../../store/goodsSlice';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';

interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    product: CardProps;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
    open,
    onClose,
    product
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [formValues, setFormValues] = useState<CardProps>(product);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const categories = useSelector((state: RootState) => state.categories.items);
    const goodsStatus = useSelector((state: RootState) => state.goods.status);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: name === 'count' || name === 'price' ? Number(value) : value
        });
    };

    const handleSubmit = () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        dispatch(editProduct(formValues))
            .then(() => {
                onClose();
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <Dialog open={open} onClose={() => !isSubmitting && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle>Редактировать товар</DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Название"
                    name="name"
                    fullWidth
                    value={formValues.name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="Описание"
                    name="description"
                    fullWidth
                    multiline
                    value={formValues.description}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                <TextField
                    label="Категория"
                    select
                    name="categoryId"
                    value={formValues.categoryId}
                    onChange={handleChange}
                    margin="dense"
                    fullWidth
                    disabled={isSubmitting}
                >
                    {categories.map((category) => <MenuItem value={category.id} key={category.id}>{category.name}</MenuItem>)}
                </TextField>
                <TextField
                    margin="dense"
                    label="Количество"
                    name="count"
                    type="number"
                    fullWidth
                    value={formValues.count}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="Цена"
                    name="price"
                    type="number"
                    fullWidth
                    value={formValues.price}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="Единицы измерения"
                    name="units"
                    fullWidth
                    value={formValues.units}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="URL изображения"
                    name="imageUrl"
                    fullWidth
                    value={formValues.imageUrl}
                    onChange={handleChange}
                    disabled={isSubmitting}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProductModal;
