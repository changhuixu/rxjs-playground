import { Observable, Observer, Subscription } from 'rxjs';
import { NumberStream } from '../../src/utils/number-stream-observable';
import { ResultCollector } from '../../src/utils/result-collector';

describe(`Observable Creation Examples - Providing your own observer - also showing that  
          Observable.create is synchronous`, () => {
  beforeEach(() => {
    // No setup needed ..
  });
  it('Should be able to create observables by providing your own producer', () => {
    const stream$ = Observable.create((observer: Observer<number>) => {
      observer.next(1);
      observer.next(2);
      observer.complete();
    });
    let result: number[] = [];
    let completed = false;
    let error;
    stream$.subscribe(
      (val: number) => {
        result.push(val);
      },
      (err: Error) => {
        error = err;
      },
      () => {
        completed = true;
      }
    );
    expect(result.join(',')).toEqual('1,2');
    expect(completed).toEqual(true);
    expect(error).toBeFalsy();
  });

  it('Should be able to emit error and subscriber should be able to handle it', () => {
    const stream$ = Observable.create((observer: Observer<number>) => {
      observer.next(1);
      observer.error('error');
      observer.next(2);
      observer.complete();
    });
    let result: number[] = [];
    let completed = false;
    let error;
    stream$.subscribe(
      (val: number) => {
        result.push(val);
      },
      (err: Error) => {
        error = err;
      },
      () => {
        completed = true;
      }
    );
    expect(result.join(',')).toEqual('1');
    expect(completed).toEqual(false);
    expect(error).toBeTruthy();
  });

  it(`Should not listen to the observable after unsubscribe is called`, done => {
    let resultCollector = new ResultCollector<number>();
    spyOn(resultCollector, 'setError').and.callThrough();
    spyOn(resultCollector, 'collectValue').and.callThrough();
    spyOn(resultCollector, 'setCompleted').and.callThrough();

    let stream$ = new NumberStream().evenNumberStream$;
    let sub: Subscription = stream$.subscribe(
      (t: number) => {
        resultCollector.collectValue(t);
      },
      (err: Error) => {
        resultCollector.setError(err);
      },
      () => {
        resultCollector.setCompleted();
      }
    );
    setTimeout(() => {
      sub.unsubscribe();
    }, 50);

    setTimeout(() => {
      expect(resultCollector.setCompleted).not.toHaveBeenCalled();
      expect(resultCollector.values.join(',')).toEqual('2,4');
      done();
    }, 900);
  });

  it(`Should automatically close subscription when observable is completed`, done => {
    let resultCollector = new ResultCollector<number>();
    spyOn(resultCollector, 'setError').and.callThrough();
    spyOn(resultCollector, 'collectValue').and.callThrough();
    spyOn(resultCollector, 'setCompleted').and.callThrough();

    let stream$ = new NumberStream().evenNumberStream$;
    let sub: Subscription = stream$.subscribe(
      (t: number) => {
        expect(sub.closed).toEqual(false);
        resultCollector.collectValue(t);
      },
      (err: Error) => {
        resultCollector.setError(err);
      },
      () => {
        resultCollector.setCompleted();
      }
    );

    setTimeout(() => {
      expect(resultCollector.setCompleted).toHaveBeenCalled();
      expect(resultCollector.setError).not.toHaveBeenCalled();
      expect(resultCollector.values.join(',')).toEqual('2,4,6,8,10');
      expect(sub.closed).toEqual(true);
      done();
    }, 120);
  });
});
