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
const Background = {
  blue: "\x1b[44m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  red: "\x1b[41m"
};
const store = {};
const notification = {};

const getId = (obsId, params) => {
  return generateID({ obsId, params });
};

const dispatch = ({ resourceName: obsId, stream: obs, params }) => {
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

const rxRequest = (partnerFunction, partnerResource, params) => {
  return new Observable(obs => {
    console.log(Background.red, "Called ");
    console.log(Background.yellow, partnerResource);
    partnerFunction(partnerResource, params, data => {
      console.log("partnerResource", data);
      obs.next(data);
    });
  });
};

const buildPartnerRequest = (partnerFunction, resourceName, params) => {
  return {
    resourceName,
    stream: rxRequest(partnerFunction, resourceName, params),
    params
  };
};

module.exports = {
  callResources,
  initStreamCache,
  buildPartnerRequest,
  dispatch
};
