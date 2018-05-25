import { Observable, Observer } from 'rxjs';
import { filter } from 'rxjs/operators';

export class NumberStream {
  constructor() {}

  numberStream$ = Observable.create((observer: Observer<number>) => {
    let value = 1;
    let interval = setInterval(() => {
      observer.next(value);
      value == 10 && observer.complete();
      value++;
    }, 10);
    return () => {
      clearInterval(interval);
    };
  });
  evenNumberStream$ = this.numberStream$.pipe(filter((x: number) => x % 2 === 0));
  oddNumberStream$ = this.numberStream$.pipe(filter((x: number) => x % 2 === 1));
}
