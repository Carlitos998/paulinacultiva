// src/components/NotificationsButton.jsx
import React, { memo } from 'react';
import { IconButton, Badge } from '@mui/material';
import { Bell } from 'lucide-react';
import { COLORS } from '../utils/colors';

const NotificationsButton = memo(({ unreadCount, onClick }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        color: COLORS.mutedText,
        position: 'relative'
      }}
    >
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.65rem',
            height: 16,
            minWidth: 16
          }
        }}
      >
        <Bell className="w-5 h-5" />
      </Badge>
    </IconButton>
  );
});

NotificationsButton.displayName = 'NotificationsButton';

export default NotificationsButton;