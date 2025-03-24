import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    Typography,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Checkbox, FormControlLabel, Box, IconButton, styled } from '@mui/material';
import { updateFilterCriteria, resetFilterCriteria, ALL_CATEGORIES } from '../store/goodsSlice';
import { Category } from '../types';
import { useNavigate } from 'react-router';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { RootState } from '../store/store';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

// Styled component for the header
const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(3),
}));

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.group === 'admin';

    // Получаем текущие значения фильтров из goods slice
    const { search, nonZeroStock, category } = useSelector(
        (state: RootState) => (state.goods as any).filter
    );

    // Получаем категории из категорийного slice
    const categories = useSelector((state: RootState) => (state.categories as any).items);
    const dispatch = useDispatch();

    // Обработчики для изменения фильтров
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateFilterCriteria({
            search: event.target.value,
            nonZeroStock,
            category
        }));
    };

    const handleNonZeroStockChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateFilterCriteria({
            search,
            nonZeroStock: event.target.checked,
            category
        }));
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(updateFilterCriteria({
            search,
            nonZeroStock,
            category: event.target.value
        }));
    };

    const handleResetFilters = () => {
        dispatch(resetFilterCriteria());
        toggleSidebar();
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        toggleSidebar();
    };

    return (
        <Drawer
            anchor="left"
            open={isOpen}
            onClose={toggleSidebar}
        >
            <Box sx={{ width: 300 }}>
                <Header>
                    <Typography variant="h6">Фильтры</Typography>
                    <IconButton onClick={toggleSidebar}>
                        <CloseIcon />
                    </IconButton>
                </Header>
                <List>
                    <ListItemButton onClick={() => handleNavigation('/products')}>
                        <ListItemIcon>
                            <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Товары" />
                    </ListItemButton>
                    <ListItemButton onClick={() => handleNavigation('/categories')}>
                        <ListItemIcon>
                            <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Категории" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton onClick={() => handleNavigation('/profile')}>
                        <ListItemIcon>
                            <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Профиль" />
                    </ListItemButton>

                    {isAdmin && (
                        <ListItemButton onClick={() => handleNavigation('/admin')}>
                            <ListItemIcon>
                                <AdminPanelSettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Администрирование" />
                        </ListItemButton>
                    )}
                    <ListItem>
                        <TextField
                            fullWidth
                            label="Поиск"
                            variant="outlined"
                            value={search}
                            onChange={handleSearchChange}
                            size="small"
                            margin="dense"
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            select
                            fullWidth
                            label="Категория"
                            value={category}
                            onChange={handleCategoryChange}
                            variant="outlined"
                            size="small"
                            margin="dense"
                        >
                            <MenuItem value={ALL_CATEGORIES}>Все категории</MenuItem>
                            {categories.map((category: Category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </ListItem>
                    <ListItem>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={nonZeroStock}
                                    onChange={handleNonZeroStockChange}
                                    name="nonZeroStock"
                                    color="primary"
                                />
                            }
                            label="Только в наличии"
                        />
                    </ListItem>
                    <ListItem>
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
                            <ListItemButton onClick={handleResetFilters} sx={{ justifyContent: 'center' }}>
                                <Typography variant="button">Сбросить фильтры</Typography>
                            </ListItemButton>
                        </Box>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
}

export default Sidebar;
