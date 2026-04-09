import React from 'react';
import Card from '../components/Card';
import { COLORS, FONTS, SPACING } from '../constants/theme';

// Simple grouped imports - This works best with Vite
import { BiCube } from 'react-icons/bi';
import { 
  AiOutlineInfoCircle, 
  AiOutlineWarning, 
  AiOutlineAlert, 
  AiOutlineClose 
} from 'react-icons/ai';

const NOTIFICATIONS = [
  { id: '1', type: 'info',     title: 'New Material Added',     time: '2026-04-08 10:15', project: 'NH-44' },
  { id: '2', type: 'warning',  title: 'Low Stock Alert',        time: '2026-04-09 09:00', project: 'Block A' },
  { id: '3', type: 'critical', title: 'Critical Stock Alert',   time: '2026-04-09 08:45', project: 'Colony Ph2' },
];

const ICONS = {
  info:     <AiOutlineInfoCircle color={COLORS.info || '#3b82f6'} size={24} />,
  warning:  <AiOutlineWarning color={COLORS.warning} size={24} />,
  critical: <AiOutlineAlert color={COLORS.danger} size={24} />,
};

export default function NotificationsScreen() {
  return (
    <div style={{ padding: SPACING.lg, backgroundColor: COLORS.background, minHeight: '100vh' }}>
      <h1 style={{ 
        fontSize: FONTS.sizes.xl, 
        fontWeight: 800, 
        marginBottom: SPACING.md, 
        color: COLORS.text 
      }}>
        Notifications
      </h1>

      {NOTIFICATIONS.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 80, color: COLORS.textLight }}>
          <BiCube size={60} />
          <p>No notifications</p>
        </div>
      )}

      {NOTIFICATIONS.map((notif) => (
        <Card
          key={notif.id}
          shadow="sm"
          style={{
            marginBottom: SPACING.sm,
            padding: SPACING.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
            {ICONS[notif.type]}
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: COLORS.text }}>{notif.title}</p>
              <p style={{ margin: 0, fontSize: FONTS.sizes.xs, color: COLORS.textLight }}>
                {notif.project} • {notif.time}
              </p>
            </div>
          </div>

          <AiOutlineClose 
            color={COLORS.textLight} 
            size={20} 
            style={{ cursor: 'pointer' }} 
          />
        </Card>
      ))}
    </div>
  );
}