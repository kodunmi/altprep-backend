import { User } from '@base/api/models/User';
import { SmtpProvider, EmailNotificationTemplateEnum } from '@base/infrastructure/services/mail/Providers/SmtpProvider';
import { EventSubscriber, On } from 'event-dispatch';
import { Transaction } from '@base/api/models/Payments/Transaction';

@EventSubscriber()
export class PaymentEvent {
  /**
   * Fired when a payment is successful
   */
  @On('onPaymentSuccess')
  public async onPaymentSuccess(data: { transaction: Transaction; user: User }) {
    console.log('[PaymentEvent] Payment successful:', {
      transactionId: data.transaction.id,
      userId: data.user.id,
      amount: data.transaction.amount,
    });

    // Format amount with thousand separators
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(data.transaction.amount));

    // Format date
    const transactionDate = new Date(data.transaction.createdAt).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Capitalize payment method
    const paymentMethod = data.transaction.paymentMethod 
      ? data.transaction.paymentMethod.charAt(0).toUpperCase() + data.transaction.paymentMethod.slice(1)
      : 'N/A';

    // Capitalize status
    const status = data.transaction.status 
      ? data.transaction.status.charAt(0).toUpperCase() + data.transaction.status.slice(1)
      : 'Completed';

    await new SmtpProvider()
      .to(data.user.email)
      .subject('Payment Receipt - Transaction Successful')
      .htmlView(EmailNotificationTemplateEnum.paymentReceipt, {
        userName: data.user.first_name || data.user.email.split('@')[0],
        amount: formattedAmount,
        transactionRef: data.transaction.transactionRef,
        paymentMethod: paymentMethod,
        description: data.transaction.description || 'Payment',
        status: status,
        date: transactionDate,
        year: new Date().getFullYear(),
      })
      .send();

    console.log('[PaymentEvent] Payment receipt email sent to:', data.user.email);
  }
}