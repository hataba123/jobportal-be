import { EmailNotificationService } from './email-notification.service';

describe('EmailNotificationService', () => {
  const originalUrl = process.env.EMAIL_WEBHOOK_URL;
  const originalSecret = process.env.EMAIL_WEBHOOK_SECRET;
  const originalFrontend = process.env.FRONTEND_URL;

  afterEach(() => {
    if (originalUrl === undefined) delete process.env.EMAIL_WEBHOOK_URL;
    else process.env.EMAIL_WEBHOOK_URL = originalUrl;
    if (originalSecret === undefined) delete process.env.EMAIL_WEBHOOK_SECRET;
    else process.env.EMAIL_WEBHOOK_SECRET = originalSecret;
    if (originalFrontend === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontend;
    jest.restoreAllMocks();
  });

  it('does not call a provider when email delivery is not configured', async () => {
    delete process.env.EMAIL_WEBHOOK_URL;
    const fetchMock = jest.spyOn(global, 'fetch');
    const service = new EmailNotificationService();

    await service.sendApplicationConfirmation('candidate@example.com', 'Backend');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends a reset link through the configured provider', async () => {
    process.env.EMAIL_WEBHOOK_URL = 'https://mail.internal/send';
    process.env.EMAIL_WEBHOOK_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'https://jobportal.example';
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200 } as Response);
    const service = new EmailNotificationService();

    await service.sendPasswordReset('candidate@example.com', 'raw-token');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://mail.internal/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer test-secret' }),
        body: expect.stringContaining('raw-token'),
      }),
    );
  });
});
