import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmation({
  email,
  orderNumber,
  total,
  items,
}: {
  email: string;
  orderNumber: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}) {
  try {
    const itemsList = items
      .map((item) => `<li>${item.name} x${item.quantity} - C$ ${(item.price * item.quantity).toFixed(2)}</li>`)
      .join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b77904;">Tu pedido ha sido confirmado</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#${orderNumber}</strong> ha sido recibido y estamos procesándolo.</p>
        
        <h3>Detalle del pedido:</h3>
        <ul style="border: 1px solid #ddd; padding: 20px; background: #f9f9f9;">
          ${itemsList}
        </ul>
        
        <p style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          Total: C$ ${total.toFixed(2)}
        </p>
        
        <p>Recibirás más actualizaciones sobre tu pedido pronto.</p>
        <p>¡Gracias por tu compra!</p>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Rich Shakes - Bebidas y Pasteles Nicaragüenses</p>
        </footer>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'noreply@richshakes.ni',
      to: email,
      subject: `Tu pedido #${orderNumber} ha sido confirmado`,
      html,
    });

    return result;
  } catch (error) {
    console.error('[Email] Error sending order confirmation:', error);
    throw error;
  }
}

export async function sendShippingNotification({
  email,
  orderNumber,
  trackingNumber,
  estimatedDelivery,
}: {
  email: string;
  orderNumber: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b77904;">Tu pedido está en camino</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#${orderNumber}</strong> ha sido enviado.</p>
        
        ${
          trackingNumber
            ? `<p style="margin: 20px 0;">
                <strong>Número de rastreo:</strong> ${trackingNumber}
              </p>`
            : ''
        }
        
        ${
          estimatedDelivery
            ? `<p style="margin: 20px 0;">
                <strong>Entrega estimada:</strong> ${estimatedDelivery}
              </p>`
            : ''
        }
        
        <p><a href="https://richshakes.ni/pedidos" style="color: #b77904; text-decoration: none; font-weight: bold;">
          Ver estado de mi pedido
        </a></p>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Rich Shakes - Bebidas y Pasteles Nicaragüenses</p>
        </footer>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'noreply@richshakes.ni',
      to: email,
      subject: `Tu pedido #${orderNumber} está en camino`,
      html,
    });

    return result;
  } catch (error) {
    console.error('[Email] Error sending shipping notification:', error);
    throw error;
  }
}

export async function sendDeliveryNotification({
  email,
  orderNumber,
}: {
  email: string;
  orderNumber: string;
}) {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b77904;">Tu pedido ha sido entregado</h1>
        <p>Hola,</p>
        <p>Tu pedido <strong>#${orderNumber}</strong> ha sido entregado satisfactoriamente.</p>
        
        <p>¡Esperamos que disfrutes tu compra!</p>
        
        <p style="margin-top: 20px;">
          <a href="https://richshakes.ni/productos" style="color: #b77904; text-decoration: none; font-weight: bold;">
            Continuar comprando
          </a>
        </p>
        
        <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>Rich Shakes - Bebidas y Pasteles Nicaragüenses</p>
        </footer>
      </div>
    `;

    const result = await resend.emails.send({
      from: 'noreply@richshakes.ni',
      to: email,
      subject: `Tu pedido #${orderNumber} ha sido entregado`,
      html,
    });

    return result;
  } catch (error) {
    console.error('[Email] Error sending delivery notification:', error);
    throw error;
  }
}
