import { Observable, Observer, of, Subject, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

const testObservable: Observable<number> = Observable.create(
  (observer: Observer<number>) => {
    let value: number = 1;
    setInterval(_ => {
      if (value % 5 === 0) {
        observer.error('Error occurred for value: ' + value);
      } else {
        observer.next(value++);
      }
    }, 100);
  }
);

function service(param: number): Observable<number> {
  let resp: Observable<number> = Observable.create(
    (observer: Observer<number>) => {
      if (param % 5 === 0) {
        observer.error('Can not process multiples of 5');
      } else {
        observer.next(param * 100);
        observer.complete();
      }
    }
  );
  return resp;
}

describe(`Error handling examples`, () => {
  it(`Should cancel subscription when error occurs`, done => {
    let res: number[] = [];
    let sub: Subscription = testObservable.subscribe(
      val => {
        res.push(val);
      },
      error => {
        console.log(`Error: ` + error);
      },
      () => {
        console.log(`Completed`);
      }
    );

    setTimeout(_ => {
      expect(res).toEqual([1, 2, 3, 4]);
      expect(sub.closed).toBeTruthy();
      done();
    }, 1500);
  });

  it(`Should still close the subscription but complete called if error handled at the source observable`, done => {
    let res: number[] = [];
    let errorHandled$ = testObservable.pipe(catchError(() => of(0)));
    let sub: Subscription = errorHandled$.subscribe(
      val => {
        res.push(val);
      },
      error => {
        console.log(`Error: ` + error);
      },
      () => {
        console.log(`Completed`);
      }
    );

    setTimeout(_ => {
      expect(res.filter(v => v < 12)).toEqual([1, 2, 3, 4, 0]);
      expect(sub.closed).toBeTruthy();
      done();
    }, 1500);
  });

  it(`Should close subscription when error occurs and not handled at the source observable`, done => {
    let subject: Subject<number> = new Subject<number>();

    let stream$: Observable<number> = subject.pipe(
      switchMap(value => service(value))
    );

    let res: number[] = [];
    let sub: Subscription = stream$.subscribe(
      value => {
        res.push(value);
      },
      error => {
        console.log(error);
      },
      () => {
        console.log('Completed ..');
      }
    );
    subject.next(1);
    subject.next(2);
    subject.next(5);
    subject.next(7);
    setTimeout(_ => {
      expect(res).toEqual([100, 200]);
      expect(sub.closed).toBeTruthy();
      done();
    }, 2000);
  });

  it(`Should keep subscription alive when error occurs if handled at the source observable - FIXED`, done => {
    let subject: Subject<number> = new Subject<number>();

    let stream$: Observable<number> = subject.pipe(
      switchMap(value => service(value).pipe(catchError(_ => of(0))))
    );
    let res: number[] = [];

    let sub: Subscription = stream$.subscribe(
      value => {
        res.push(value);
      },
      error => {
        console.log(error);
      },
      () => {
        console.log('Completed ..');
      }
    );
    subject.next(1);
    subject.next(2);
    subject.next(5);
    subject.next(7);
    subject.next(8);
    subject.next(9);
    setTimeout(_ => {
      expect(res).toEqual([100, 200, 0, 700, 800, 900]);
      expect(sub.closed).toBeFalsy();
      done();
    }, 2000);
  });
});
