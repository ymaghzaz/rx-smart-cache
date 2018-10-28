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
const bigStore = {};
const notification = {};

const getId = (obsId, params) => {
  return generateID({ obsId, params });
};

const dispatch = ({ resourceName: obsId, stream: obs, params }) => {
  const id = getId(obsId, params);
  if (!store[id]) {
    store[id] = obs;
    bigStore[id] = { stream: obs, called: false };
    notification[id] = new BehaviorSubject({
      data: null,
      error: null,
      state: "Init"
    });
  }
  return {
    subscribe: call => {
      if (!bigStore[id].called) {
        console.log("called : obsId", obsId);
        bigStore[id].called = true;
        bigStore[id].unsubscribe = bigStore[id].stream.subscribe(info => {
          notification[id].next({ data: info, state: "End" });
        });
      } else {
        console.log("node called : obsId", obsId);
      }

      return notification[id].subscribe(call);
    },
    unsubscribe: () => {
      return bigStore[id].unsubscribe.unsubscribe();
    }
  };
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
  buildPartnerRequest,
  dispatch
};
