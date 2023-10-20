/* eslint-disable import/prefer-default-export */
import Bottleneck from 'bottleneck';

export const indexLimiter = new Bottleneck({
  maxConcurrent: 1,
  strategy: Bottleneck.strategy.LEAK,
  minTime: 1000,
});
