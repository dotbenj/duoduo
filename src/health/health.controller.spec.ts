import { HealthController } from './health.controller';
import { HealthService, type HealthResponse } from './health.service';

describe('HealthController', () => {
  it('delegates to HealthService', () => {
    const response: HealthResponse = { status: 'ok' };
    const healthService: Pick<HealthService, 'getHealth'> = {
      getHealth: jest.fn(() => response)
    };

    const controller = new HealthController(healthService as HealthService);

    expect(controller.getHealth()).toEqual(response);
    expect(healthService.getHealth).toHaveBeenCalledTimes(1);
  });
});

