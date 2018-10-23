const {
  forkJoin,
  from,
  of,
  combineLatest,
  BehaviorSubject,
  Observable
} = require("rxjs");
const { map, filter, flatMap, mergeMap } = require("rxjs/operators");
const generateID = require("./generateID");

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

const getId = (obsId, params) => {
  return generateID({ obsId, params });
};

const dispatch = (obsId, obs, params) => {
  const id = getId(obsId, params);
  if (!store[id]) {
    store[id] = obs;
    notification[id] = new BehaviorSubject({
      data: null,
      error: null,
      state: "Init"
    });
  }
};

const buildCache = () => {
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

const processStreamCache = dataStream$ => {
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
dispatch("partner1", partner1(1), 1);
dispatch("partner2", partner2(1), 1);
dispatch("partner1", partner1());
dispatch("partner2", partner2());
dispatch("partner1", partner1());
dispatch("partner2", partner2());
dispatch("partner1", partner1());
dispatch("partner2", partner2());

const streamCache$ = buildCache();
processStreamCache(streamCache$);

setTimeout(async () => {
  notification[getId("partner1")].subscribe(partner1_data => {
    if (partner1_data.state === "End") {
      console.log("partner1_data", partner1_data);
    }
  });
}, 2000);

setTimeout(async () => {
  notification[getId("partner1", 1)].subscribe(partner1_data => {
    if (partner1_data.state === "End") {
      console.log("partner1_data with 1", partner1_data);
    }
  });
}, 2000);

setTimeout(() => {
  const start = Date.now();
  notification[getId("partner2")].subscribe(partner2_data => {
    if (partner2_data.state === "End") {
      const end = Date.now();
      console.log("after", (end - start) / 1000, " second");
      console.log("partner2_data", partner2_data);
    }
  });
}, 2200);

setTimeout(() => {
  const start = Date.now();
  notification[getId("partner1")].subscribe(partner1_data => {
    if (partner1_data.state === "End") {
      const end = Date.now();
      console.log("after", (end - start) / 1000, " second");
      console.log("partner1_data", partner1_data);
    }
  });
}, 5000);
