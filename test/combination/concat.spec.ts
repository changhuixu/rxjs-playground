import { concat, interval, Subscription } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

describe(`Concat observables`, () => {
    it(`Second subscription only starts after the first one completes`, done => {
        let stream1$ = interval(10).pipe(takeWhile(value => value <= 5));
        let stream2$ = interval(10).pipe(takeWhile(value => value < 10), filter(v => v > 5));

        let concatStream = concat(stream1$, stream2$);
        let result: number[] = [];
        let sub: Subscription = concatStream.subscribe((value: number) => {
            result.push(value);
            expect(sub.closed).toBeFalsy();
        });

        setTimeout(_ => {
            expect(sub.closed).toBeTruthy();
            expect(result.join(',')).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].join(','));
            done();
        }, 4000);
    });

    it(`Second subscription should not start until the first one is completed`, done => {
        let stream1$ = interval(10);
        let stream2$ = interval(10).pipe(map(v => 'From Second Stream: ' + v));
        let concat$ = concat(stream1$, stream2$);
        let result: any[] = [];
        let sub: Subscription = concat$.subscribe(v => result.push(v));

        setTimeout(_ => {
            expect(sub.closed).toBeFalsy();
            expect(result.filter(v => v <= 5).join(',')).toEqual([0, 1, 2, 3, 4, 5].join(','));
            expect(result.filter(v => (typeof v === 'string') && v.indexOf('From Second') > -1).length).toEqual(0);
            done();
        }, 4000);
    });
});
