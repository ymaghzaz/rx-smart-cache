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
  red: "\x1b[41m%s\x1b[0m"
};
const store = {};

const notification = {};

const getId = (obsId, params) => {
  return generateID({ obsId, params });
};

const dispatch = ({ resourceName: obsId, stream: obs, params }) => {
  const id = getId(obsId, params);
  if (!store[id]) {
    store[id] = { stream: obs, called: false };
    notification[id] = new BehaviorSubject({
      data: null,
      error: null,
      state: "INIT"
    });
  }
  const callRessource = () => {
    if (!store[id].called) {
      console.log("called : obsId", obsId);
      store[id].called = true;
      store[id].unsubscribe = store[id].stream.subscribe(
        info => {
          notification[id].next({ data: info, state: "END" });
        },
        error => console.log("Error: ", error),
        () => {
          console.log("complete");
        }
      );
    }
  };
  return {
    then: call => {
      callRessource();
      return new Promise((resolve, reject) => {
        notification[id].asObservable().subscribe(
          result => {
            if (result.state === "END") {
              resolve(result.data);
            }
          },
          error => {
            reject(error);
          }
        );
      }).then(call);
    },
    subscribe: (call, errorHandler) => {
      callRessource();
      return notification[id].subscribe(
        result => {
          if (result.error) {
            return errorHandler(result.error);
          }
          if (result.state === "END") {
            return call(result.data);
          }
        },
        error => {
          errorHandler(error);
        }
      );
    },
    unsubscribe: () => {
      return store[id].unsubscribe.unsubscribe();
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
