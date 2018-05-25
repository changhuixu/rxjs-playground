import { interval, merge, Observable, Subscription } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';

describe(`Merging two observables`, () => {
  it(
    `Merging two observables should result in a combined observable`,
    done => {
      const evenStrem$: Observable<number> = interval(10).pipe(
        filter(n => n % 2 === 0)
      );
      const oddStrem$: Observable<number> = interval(10).pipe(
        filter(n => n % 2 === 1)
      );

      const mergedStream$ = merge(evenStrem$, oddStrem$);

      let result: any[] = [];
      const sub: Subscription = mergedStream$.subscribe(value => {
        result.push(value);
      });

      setTimeout(() => {
        expect(result.join(',').substr(0, 5)).toEqual('0,1,2');
        done();
      }, 5000);
    },
    6000
  );

  it(
    `Merging two observables should result in a combined observable in the order they emit`,
    done => {
      const evenStrem$: Observable<number> = interval(10).pipe(
        filter(n => n % 2 === 0)
      );
      const oddStrem$: Observable<number> = interval(20).pipe(
        filter(n => n % 2 === 1)
      );

      const mergedStream$ = merge(evenStrem$, oddStrem$);

      let result: any[] = [];
      const sub: Subscription = mergedStream$.subscribe(value => {
        result.push(value);
      });

      setTimeout(() => {
        expect(result.join(',').substr(0, 11)).toEqual('0,2,1,4,6,3');
        done();
      }, 5000);
    },
    6000
  );
});
