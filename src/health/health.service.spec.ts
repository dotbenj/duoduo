import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok', () => {
    const service = new HealthService();
    expect(service.getHealth()).toEqual({ status: 'ok' });
  });
});

