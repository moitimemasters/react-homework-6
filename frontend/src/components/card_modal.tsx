
import React from 'react';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { CardProps } from '../types';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Props extends CardProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialog-paper': {
    minWidth: '60vw',
    minHeight: '30vh',
  },
}));

const StyledImg = styled('img')({
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
});

const StyledTypography = styled(Typography)({
  margin: '20px 0',
});

const Modal: React.FC<Props> = ({ imageUrl, name, description, categoryId, count, units, open, onClose }) => {

  const category = useSelector((state: RootState) => state.categories.items.filter((value) => value.id == categoryId)[0])
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{name}</DialogTitle>
      <DialogContent>
        <StyledImg
          src={imageUrl ?? "static/no-image.svg"}
          alt={name}
        />
        <StyledTypography variant="body1">
          {description}
        </StyledTypography>
        <Typography variant="subtitle1" color="textSecondary">
          Category: {category.name} {category.description && "(" + category.description + ")"}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Count: {count} {units}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default Modal;
