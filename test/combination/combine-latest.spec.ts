import { combineLatest, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

describe(`Combine latest from observables`, () => {
  it(`Should only emit after all observables emit at least one value`, done => {
    let stream1$ = interval(10).pipe(map(v => v * 100));
    let stream2$ = interval(20).pipe(map(v => v * 1000));
    let stream3$ = interval(30).pipe(map(v => v * 10000));
    let combined$ = combineLatest(stream1$, stream2$, stream3$);

    let result: number[][] = [];

    let sub: Subscription = combined$.subscribe(([one, two, three]) => {
      result.push([one, two, three]);
    });

    setTimeout(_ => {
      // should not emit until all three observables have emitted at least once
      expect(result.length).toEqual(0);
    }, 20);

    setTimeout(_ => {
      // should have emissions with latest values every time an observable emitted
      // The following expectations can fail sometimes, need to use proper testing framework for
      // observables
      expect(result.length >= 6).toEqual(true);
      let last = result[result.length - 1];
      expect(last[0]).toBeGreaterThanOrEqual(400);
      expect(last[1]).toBeGreaterThanOrEqual(2000);
      expect(last[2]).toBeGreaterThanOrEqual(1000);
    }, 65);

    setTimeout(_ => {
      expect(sub.closed).toBeFalsy();
      done();
    }, 400);
  });
});
