import { interval } from 'rxjs';
import { filter, buffer, bufferTime } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

xdescribe(`BufferTime tests`, () => {
  it(`Should keep collecting values for the duration of buffer interval and emit at the end of every
    buffer interval`, done => {
    let stream$ = interval(10);
    let bufferred$ = stream$.pipe(filter((x: number) => x !== 0), bufferTime(35));
    let result: number[][] = [];
    bufferred$.subscribe((v: number[]) => {
      result = [...result, v];
    });
    setTimeout(_ => {
      // TODO may not always be true, again use a proper testing framework for observables!!
      //expect(result).toEqual([[1, 2], [3, 4, 5], [6, 7, 8, 9]]);
      expect(result).toEqual([[1], [2, 3], [4, 5, 6], [7, 8, 9, 10]]);
      done();
    }, 110);
  });
});
