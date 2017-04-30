export class Notification {
      title: string;
      text?: string;
      level: NotificationLevel;
      buttons: Button[];
      closable: boolean;
}

export class Button {
      key: String;
      text?: String;
}

export const enum NotificationLevel {
      Standard,
      Information,
      Success,
      Warning,
      Error
}

