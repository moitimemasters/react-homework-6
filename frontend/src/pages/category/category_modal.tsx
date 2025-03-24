import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    OutlinedInput,
    Checkbox,
    ListItemText,
    FormHelperText,
    SelectChangeEvent
} from '@mui/material';

// Доступные группы пользователей
const USER_GROUPS = ['user', 'admin'];

interface CategoryModalProps {
    open: boolean;
    onClose: () => void;
    initialCategory?: { id?: string; name: string; description: string; allowedGroups?: string[] };
    onSubmit: (category: { id?: string; name: string; description: string; allowedGroups?: string[] }) => void;
    isSubmitting?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    open,
    onClose,
    initialCategory,
    onSubmit,
    isSubmitting = false,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedGroups, setAllowedGroups] = useState<string[]>(['admin']);

    useEffect(() => {
        if (initialCategory) {
            setName(initialCategory.name);
            setDescription(initialCategory.description);
            setAllowedGroups(initialCategory.allowedGroups || ['admin']);
        } else {
            setName('');
            setDescription('');
            setAllowedGroups(['admin']);
        }
    }, [initialCategory, open]);

    const handleSubmit = () => {
        if (isSubmitting) return;

        // Убедимся, что admin всегда добавлен
        let groups = [...allowedGroups];
        if (!groups.includes('admin')) {
            groups.push('admin');
        }

        onSubmit({
            id: initialCategory?.id,
            name,
            description,
            allowedGroups: groups
        });
    };

    const handleGroupsChange = (event: SelectChangeEvent<typeof allowedGroups>) => {
        const {
            target: { value },
        } = event;

        // При выборе admin, проверяем наличие необходимой группы
        const selectedGroups = typeof value === 'string' ? value.split(',') : value;
        setAllowedGroups(selectedGroups);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {initialCategory ? 'Редактировать категорию' : 'Добавить категорию'}
            </DialogTitle>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Название категории"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                />
                <TextField
                    margin="dense"
                    label="Описание"
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isSubmitting}
                    sx={{ mb: 2 }}
                />

                <FormControl fullWidth margin="dense">
                    <InputLabel id="allowed-groups-label">Группы с доступом</InputLabel>
                    <Select
                        labelId="allowed-groups-label"
                        id="allowed-groups"
                        multiple
                        value={allowedGroups}
                        onChange={handleGroupsChange}
                        input={<OutlinedInput label="Группы с доступом" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip
                                        key={value}
                                        label={value === 'admin' ? 'Администратор' : 'Пользователь'}
                                        color={value === 'admin' ? 'primary' : 'default'}
                                    />
                                ))}
                            </Box>
                        )}
                        disabled={isSubmitting}
                    >
                        {USER_GROUPS.map((group) => (
                            <MenuItem
                                key={group}
                                value={group}
                                disabled={group === 'admin'} // Админ всегда имеет доступ
                            >
                                <Checkbox checked={allowedGroups.indexOf(group) > -1} />
                                <ListItemText
                                    primary={group === 'admin' ? 'Администратор' : 'Пользователь'}
                                />
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        Группа "Администратор" всегда имеет доступ к категории
                    </FormHelperText>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting
                        ? (initialCategory ? 'Сохранение...' : 'Добавление...')
                        : (initialCategory ? 'Сохранить' : 'Добавить')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryModal;
