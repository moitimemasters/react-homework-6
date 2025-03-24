import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Menu, MenuItem, Box, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeToggle } from '../context/MyThemeProvider';
import { useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logoutUser } from '../redux/authSlice';

interface NavBarProps {
    toggleSidebar: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ toggleSidebar }) => {
    const toggleTheme = useThemeToggle();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [mainMenuAnchorEl, setMainMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMainMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setMainMenuAnchorEl(event.currentTarget);
    };

    const handleMainMenuClose = () => {
        setMainMenuAnchorEl(null);
    };

    const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logoutUser() as any);
        handleUserMenuClose();
    };

    const renderMenuItems = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <MenuItem onClick={() => { handleMainMenuClose(); navigate("/login"); }}>Войти</MenuItem>
                    <MenuItem onClick={() => { handleMainMenuClose(); navigate("/register"); }}>Регистрация</MenuItem>
                    <MenuItem onClick={toggleTheme}>Переключить тему</MenuItem>
                </>
            );
        }

        return (
            <>
                <MenuItem onClick={() => { handleMainMenuClose(); navigate("/products"); }}>Инвентарь</MenuItem>
                <MenuItem onClick={() => { handleMainMenuClose(); toggleSidebar(); }}>Фильтры</MenuItem>
                <MenuItem onClick={() => { handleMainMenuClose(); navigate("/categories"); }}>Категории</MenuItem>
                <MenuItem onClick={() => { handleMainMenuClose(); navigate("/profile"); }}>Личная страница</MenuItem>
                <MenuItem onClick={toggleTheme}>Переключить тему</MenuItem>
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
            </>
        );
    };

    // Функция для отображения кнопок и меню в desktop режиме
    const renderDesktopItems = () => {
        if (!isAuthenticated) {
            return (
                <>
                    <Button color="inherit" onClick={() => navigate("/login")}>
                        Войти
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/register")}>
                        Регистрация
                    </Button>
                    <Button color="inherit" onClick={toggleTheme}>
                        Переключить тему
                    </Button>
                </>
            );
        }

        return (
            <>
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
                    <MenuIcon />
                </IconButton>
                <Button onClick={() => navigate("/products")} sx={{ flexGrow: 1 }} color="inherit">
                    Инвентарь
                </Button>

                <Button color="inherit" sx={{ flexGrow: 1 }} onClick={() => navigate("/categories")}>
                    Категории
                </Button>
                {user?.group === 'admin' && (
                    <Button color="inherit" sx={{ flexGrow: 1 }} onClick={() => navigate("/admin")}>
                        Администрирование
                    </Button>
                )}
                <Button color="inherit" onClick={toggleTheme}>
                    Переключить тему
                </Button>

                <IconButton
                    onClick={handleUserMenuClick}
                    size="small"
                    sx={{ ml: 2 }}
                >
                    <Avatar
                        alt={user?.username}
                        src={user?.avatarUrl}
                        sx={{ width: 32, height: 32 }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                </IconButton>
                <Menu
                    anchorEl={userMenuAnchorEl}
                    open={Boolean(userMenuAnchorEl)}
                    onClose={handleUserMenuClose}
                >
                    <MenuItem onClick={() => { handleUserMenuClose(); navigate("/profile"); }}>Профиль</MenuItem>
                    <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                </Menu>
            </>
        );
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {isMobile ? (
                    <>
                        <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMainMenuClick}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Inventory App
                        </Typography>
                        <Menu anchorEl={mainMenuAnchorEl} open={Boolean(mainMenuAnchorEl)} onClose={handleMainMenuClose}>
                            {renderMenuItems()}
                        </Menu>
                    </>
                ) : (
                    <Box display="flex" alignItems="center" flexGrow={1} gap={2}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Inventory App
                        </Typography>
                        {renderDesktopItems()}
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
