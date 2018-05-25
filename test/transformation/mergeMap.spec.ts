import { interval, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

xdescribe(`mergeMap tests`, () => {
  it(`should emit the value from the observable being merged with, 
    a new subscription is made to second$ every time the first$ emits, hence the result contains repeated values
    from $second`, done => {
    let result: string[] = [];
    let result1: string[] = [];

    let first$ = interval(100).pipe(map(_ => 'A' + _));
    let second$ = interval(200).pipe(map(_ => 'B' + _));
    let merge$ = first$.pipe(
      mergeMap(val => {
        result1.push(val);
        return second$;
      })
    );

    let sub: Subscription = merge$.subscribe(value => {
      result.push(value);
    });

    setTimeout(_ => {
      expect(result).toEqual([]);
      expect(result1).toEqual(['A0']);
    }, 150);

    setTimeout(_ => {
      // Remember the new subscription to the second$ observable on every merge, hence repeated emissions ..
      expect(result).toEqual(['B0', 'B0', 'B0', 'B1']);
      expect(result1).toEqual(['A0', 'A1', 'A2', 'A3', 'A4']);
      done();
    }, 550);
  });
});
