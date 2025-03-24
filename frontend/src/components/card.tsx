import React from 'react';
import { Card as MuiCard, CardContent, CardMedia, Typography, Tooltip, Box } from '@mui/material';
import { CardProps } from "../types";
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const CardContainer = styled(MuiCard)(({ theme }) => ({
    transition: 'transform 0.4s',
    height: 250,
    '&:hover': {
        transform: 'scale(1.1)',
        cursor: 'pointer',
    },
    width: 280,
    [theme.breakpoints.down('sm')]: {
        '&:hover': {
            transform: 'scale(1.05)',
        },
    },
}));

const CardTitle = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const CardDescription = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

interface Props extends Omit<CardProps, "price | id"> {
    onClick: () => void;
}

function findCategoryNameById(categories: any[], id: string): string {
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'Unknown';
}

const Card: React.FC<Props> = ({ name, description, categoryId, count, units, imageUrl, onClick }) => {
    const category = useSelector((state: RootState) =>
        state.categories.items.find((category) => String(category.id) === String(categoryId))
    )
    return (
        <Tooltip title={description ?? 'No description available'} placement="top">
            <CardContainer onClick={onClick}>
                <CardMedia
                    component="img"
                    alt={name}
                    height="150"
                    image={imageUrl ?? "static/no-image.svg"}
                    sx={{ height: { xs: 120, sm: 150 } }}
                />
                <CardContent>
                    <CardTitle variant="h5">
                        {name}
                    </CardTitle>
                    <CardDescription variant="body2" color="text.secondary">
                        {description}
                    </CardDescription>
                    <Typography variant="body2" color="text.secondary">
                        {category?.name || 'Категория не найдена'}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" marginTop={1}>
                        <Typography variant="body2" color="text.primary">
                            {count} {units}
                        </Typography>
                    </Box>
                </CardContent>
            </CardContainer>
        </Tooltip>
    );
};

export default Card;
