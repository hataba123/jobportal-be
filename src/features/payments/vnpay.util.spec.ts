import { buildVnpaySignData, signVnpay, verifyVnpay } from './vnpay.util';

describe('VNPAY signature helper', () => {
  const params = {
    vnp_Amount: '1000000',
    vnp_Command: 'pay',
    vnp_OrderInfo: 'Thanh toán gói cơ bản',
    vnp_TxnRef: 'order-123',
  };

  it('sắp xếp và mã hóa dữ liệu trước khi ký', () => {
    expect(buildVnpaySignData(params)).toBe(
      'vnp_Amount=1000000&vnp_Command=pay&vnp_OrderInfo=Thanh+to%C3%A1n+g%C3%B3i+c%C6%A1+b%E1%BA%A3n&vnp_TxnRef=order-123',
    );
  });

  it('xác thực đúng chữ ký và từ chối dữ liệu bị thay đổi', () => {
    const secret = 'sandbox-secret';
    const signature = signVnpay(params, secret);

    expect(verifyVnpay(params, signature, secret)).toBe(true);
    expect(verifyVnpay({ ...params, vnp_Amount: '2000000' }, signature, secret)).toBe(false);
    expect(verifyVnpay(params, `${signature}x`, secret)).toBe(false);
  });
});
