import { INotificationProvider } from './INotificationProvider';
import { FcmProvider } from './providers/FcmProvider';

export class NotificationProviderFactory {
  private static fcmProviderInstance: INotificationProvider = new FcmProvider();

  static getProvider(providerType = 'FCM'): INotificationProvider {
    switch (providerType.toUpperCase()) {
      case 'FCM':
      default:
        return this.fcmProviderInstance;
    }
  }
}
