import { AppNotification } from '../types';

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'Recycler Accepted Consignment',
    message: 'EcoTech E-Waste Recyclers accepted LOT-2026-103.',
    timestamp: '10 mins ago',
    read: false,
    type: 'lot',
    lot_id: 'LOT-2026-103',
  },
  {
    id: 'NOTIF-02',
    title: 'New Offer Received',
    message: 'GreenCircle Refurbishers sent a competitive offer for LOT-2026-104.',
    timestamp: '45 mins ago',
    read: false,
    type: 'lot',
    lot_id: 'LOT-2026-104',
  },
  {
    id: 'NOTIF-03',
    title: 'Payout Disbursed',
    message: 'Payment of ₹10,200 marked as completed via Direct Bank/UPI.',
    timestamp: 'Yesterday',
    read: true,
    type: 'payment',
  },
  {
    id: 'NOTIF-04',
    title: 'Market Rate Update',
    message: 'Price update: PCB rates increased today to ₹480 – ₹560/kg.',
    timestamp: 'Today, 10:30 AM',
    read: true,
    type: 'price',
  },
];
