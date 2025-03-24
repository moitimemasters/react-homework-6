import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Backdrop
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryModal from './category_modal';
import { RootState } from '../../store/store';
import { AppDispatch } from '../../store/store';
import { addCategory, updateCategory, deleteCategory, addNewCategory, updateExistingCategory, removeCategory } from '../../store/categoriesSlice';
import { Category } from '../../types';


type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

const CategoriesPage: React.FC = () => {
    const categories = useSelector((state: RootState) => state.categories.items);
    const categoriesStatus = useSelector((state: RootState) => state.categories.status);
    const products = useSelector((state: RootState) => state.goods.items);
    const dispatch = useDispatch<AppDispatch>();

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<Category | null>(null);

    const handleAddCategory = () => {
        setEditingCategory(null);
        setModalOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setModalOpen(true);
    };

    const handleDeleteCategory = (id: string) => {
        const isCategoryUsed = products.some((product) => product.categoryId === id);
        if (isCategoryUsed) {
            setErrorMessage('Невозможно удалить категорию – имеются товары, связанные с ней.');
            setErrorOpen(true);
            return;
        }

        setIsDeleting(true);
        dispatch(removeCategory(id))
            .finally(() => {
                setIsDeleting(false);
            });
    };

    const handleModalSubmit = (data: Optional<Category, "id">) => {
        setIsSubmitting(true);
        if (data.id != null && data.id != undefined) {
            dispatch(updateExistingCategory(data as Category))
                .finally(() => {
                    setIsSubmitting(false);
                    setModalOpen(false);
                });
        } else {
            dispatch(addNewCategory({ ...data, id: '' } as Category))
                .finally(() => {
                    setIsSubmitting(false);
                    setModalOpen(false);
                });
        }
    };

    const handleSnackbarClose = (
        _?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === 'clickaway') {
            return;
        }
        setErrorOpen(false);
    };

    // Показываем индикатор загрузки для всей страницы при начальной загрузке категорий
    if (categoriesStatus === 'loading' && categories.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                Управление категориями
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddCategory}
                disabled={isDeleting || categoriesStatus === 'loading'}
            >
                Добавить категорию
            </Button>
            {categories.length === 0 && categoriesStatus === 'succeeded' ? (
                <Typography variant="body1" mt={2}>
                    Категории отсутствуют. Создайте первую категорию.
                </Typography>
            ) : (
                <List>
                    {categories.map((category) => (
                        <ListItem
                            key={category.id}
                            secondaryAction={
                                <>
                                    <IconButton
                                        edge="end"
                                        aria-label="edit"
                                        onClick={() => handleEditCategory(category)}
                                        disabled={isDeleting || categoriesStatus === 'loading'}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => handleDeleteCategory(category.id)}
                                        disabled={isDeleting || categoriesStatus === 'loading'}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </>
                            }
                        >
                            <ListItemText
                                primary={category.name}
                                secondary={category.description}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            <CategoryModal
                open={modalOpen}
                onClose={() => !isSubmitting && setModalOpen(false)}
                initialCategory={editingCategory ? {
                    id: editingCategory.id,
                    name: editingCategory.name,
                    description: editingCategory.description || '',
                    allowedGroups: editingCategory.allowedGroups
                } : undefined}
                onSubmit={handleModalSubmit}
                isSubmitting={isSubmitting}
            />
            <Snackbar
                open={errorOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>

            {/* Полупрозрачный оверлей с лоадером при операциях удаления */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isDeleting || (categoriesStatus === 'loading' && categories.length > 0)}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default CategoriesPage;
