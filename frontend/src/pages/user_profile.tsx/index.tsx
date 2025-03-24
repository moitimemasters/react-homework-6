import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';

const UserProfilePage: React.FC = () => {
    const user = {
        username: 'Иван Песня',
        email: 'iapesnya_1@edu.hse.ru',
        group: 'Студент',
        avatar: 'https://img.freepik.com/free-photo/nature-animals_1122-1999.jpg?t=st=1731095114~exp=1731098714~hmac=457db4c3df4375d2a7cd629488b710e1d6cde6d1bd86733215f5791a43a54482&w=2000'
    };

    return (
        <Box display="flex" justifyContent="center" p={4}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                        src={user.avatar}
                        alt={user.username}
                        sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <Typography variant="h5" gutterBottom>
                        {user.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Email: {user.email}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Группа: {user.group}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserProfilePage;
