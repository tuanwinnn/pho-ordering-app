import PusherServer from 'pusher';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

export const pusherServer =
  appId && key && secret && cluster
    ? new PusherServer({ appId, key, secret, cluster, useTLS: true })
    : null;

export function orderChannelName(orderId: string) {
  return `order-${orderId}`;
}

export const ORDER_STATUS_EVENT = 'status-updated';

export async function publishOrderStatus(
  orderId: string,
  status: string,
  updatedAt: string | Date
) {
  if (!pusherServer) return;
  try {
    await pusherServer.trigger(orderChannelName(orderId), ORDER_STATUS_EVENT, {
      status,
      updatedAt,
    });
  } catch (error) {
    console.error('Pusher publish error:', error);
  }
}
