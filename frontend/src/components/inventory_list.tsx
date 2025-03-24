import React, { useMemo } from 'react';
import { Typography, Box, Grid2, Button, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import Card from './card';
import Modal from './card_modal';
import { CardProps } from '../types';
import { useInView } from 'react-intersection-observer';
import { styled } from '@mui/system';
import { RootState } from '../store/store';
import AddProductModal from './add_card_modal';
import { useNavigate } from 'react-router';
import { ALL_CATEGORIES } from '../store/goodsSlice';

const Container = styled(Box)({
    maxWidth: '1200px',
    margin: '0 auto',
});

const InventoryList: React.FC = () => {
    const items = useSelector((
        state: RootState
    ) => state.goods.items)
    const goodsStatus = useSelector((state: RootState) => state.goods.status);
    const [openAddModal, setOpenAddModal] = React.useState(false);

    const navigate = useNavigate();


    const { search, nonZeroStock, category } = useSelector(
        (state: RootState) => state.goods.filter
    );

    const filteredItems = useMemo(() =>
        items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesStock = !nonZeroStock || item.count > 0;
            const matchesCategory = category === ALL_CATEGORIES || item.categoryId === category;
            return matchesSearch && matchesStock && matchesCategory;
        }),
        [items, search, nonZeroStock, category]
    );

    const { ref, inView } = useInView({
        threshold: 0.1,
    });

    const itemsPerPage = 20;
    const [visibleCount, setVisibleCount] = React.useState(itemsPerPage);

    React.useEffect(() => {
        if (inView && visibleCount < filteredItems.length) {
            setVisibleCount((prevCount) => prevCount + itemsPerPage);
        }
    }, [inView, filteredItems.length, visibleCount]);

    const handleCardClick = (item: CardProps) => {
        navigate(`/products/${item.id}`)
    };



    const handleOpenAddModal = () => {
        setOpenAddModal(true);
    };

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
    };


    return (
        <Box
            height="100vh"
            overflow="auto"
            sx={{
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            }}
        >
            <Button variant="contained" color="primary" onClick={handleOpenAddModal}>
                Добавить товар
            </Button>

            <AddProductModal open={openAddModal} onClose={handleCloseAddModal} />

            {goodsStatus === 'loading' ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            ) : filteredItems.length === 0 ? (
                <Typography variant="h6" gutterBottom>
                    Нет товаров, соответствующих фильтрам.
                </Typography>
            ) : (
                <Container>
                    <Grid2 container spacing={2} padding={2}>
                        {filteredItems.slice(0, visibleCount).map((item, index) => (
                            <Grid2
                                container
                                justifyContent="center"
                                ref={index === visibleCount - 1 ? ref : null}
                                size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                key={index}
                            >
                                <Card {...item} onClick={() => handleCardClick(item)} />
                            </Grid2>
                        ))}
                    </Grid2>
                </Container>
            )}
        </Box>
    );
};

export default InventoryList;
