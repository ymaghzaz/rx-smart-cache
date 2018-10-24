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
  return notification[id];
};

const initStreamCache = () => {
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

const callResources = dataStream$ => {
  dataStream$.subscribe(datam => {
    const keys = Object.keys(datam);
    keys.map(key => {
      datam[key].subscribe(info => {
        notification[key].next({ data: info, state: "End" });
      });
    });
  });
};

module.exports = {
  callResources,
  initStreamCache,
  dispatch
};
