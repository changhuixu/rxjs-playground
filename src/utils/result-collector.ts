export class ResultCollector<T> {
  private result: T[];
  private error: any;
  private completed: boolean;

  constructor() {
    this.result = [];
  }

  setError(err: any) {
    this.error = err;
  }

  collectValue(v: T) {
    this.result.push(v);
  }

  setCompleted() {
    this.completed = true;
  }

  get values() {
    return this.result;
  }
}
