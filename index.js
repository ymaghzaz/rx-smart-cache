const {
  forkJoin,
  from,
  of,
  combineLatest,
  BehaviorSubject,
  Observable
} = require("rxjs");
const { map, filter, flatMap, mergeMap } = require("rxjs/operators");

const partner1 = params =>
  new Observable(obs => {
    setTimeout(() => {
      obs.next(` data from partner1  ${params}`);
    }, 1000);
  });

const partner2 = params =>
  new Observable(obs => {
    setTimeout(() => {
      obs.next(` data from partner2  ${params}`);
    }, 10000);
  });

const partner3 = params =>
  from(
    new Promise((resolve, reject) =>
      setTimeout(() => {
        resolve(` data from partner3  ${params}`);
      }, 5000)
    )
  );

const store = {};
const notification = {};

const startResolve = (promise, promiseId) => {
  if (!store[promiseId]) {
    store[promiseId] = promise;
    notification[promiseId] = new BehaviorSubject({
      data: null,
      state: "Init"
    });
  }
};

const resolvePromise = () => {
  const startSubscibtion = {};
  const startProcessing$ = (key, obs) => {
    return obs.pipe(
      map(data => {
        return { key, data };
      })
    );
  };
  return of(store).pipe(
    map(data => {
      const keys = Object.keys(data);
      let StreamToBeResolved = {};
      keys.map(key => {
        if (!startSubscibtion[key]) {
          startSubscibtion[key] = true;
          StreamToBeResolved[key] = startProcessing$(key, data[key]);
        }
      });
      return StreamToBeResolved;
    })
  );
};

const startRequest = dataStream$ => {
  dataStream$.subscribe(datam => {
    const keys = Object.keys(datam);
    console.log(datam, keys);
    keys.map(key => {
      datam[key].subscribe(info => {
        notification[key].next({ data: info, state: "End" });
      });
    });
  });
};
startResolve(partner1(), "partner1");
startResolve(partner2(), "partner2");
startResolve(partner1(), "partner1");
startResolve(partner2(), "partner2");

const dataStream$ = resolvePromise();
startRequest(dataStream$);

setTimeout(async () => {
  notification.partner1.subscribe(b => {
    console.log("b", b);
  });
}, 2000);

setTimeout(() => {
  const start = Date.now();
  notification.partner2.subscribe(sss => {
    const end = Date.now();
    console.log("after", (end - start) / 1000, " second");
    console.log("sss 2", sss);
  });
}, 2200);

setTimeout(() => {
  const start = Date.now();
  notification.partner1.subscribe(sss => {
    const end = Date.now();
    console.log("after", (end - start) / 1000, " second");
    console.log("sss 3 ", sss);
  });
}, 5000);
