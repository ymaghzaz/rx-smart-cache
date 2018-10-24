const {
  forkJoin,
  from,
  of,
  combineLatest,
  BehaviorSubject,
  Observable
} = require("rxjs");
const { map, filter, flatMap, mergeMap } = require("rxjs/operators");
const { callResources, initStreamCache, dispatch } = require("./index");
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
  new Observable(obs => {
    setTimeout(() => {
      obs.next(` data from partner3  ${params}`);
    }, 5000);
  });

const p10 = dispatch("partner1", partner1(0), 0);
const p20 = dispatch("partner2", partner2(0), 0);
const p11 = dispatch("partner1", partner1(1), 1);
const p21 = dispatch("partner2", partner2(1), 1);

const streamCache$ = initStreamCache();
callResources(streamCache$);

setTimeout(async () => {
  p10.subscribe(res => {
    if (res.state === "End") {
      console.log("partner1_data", res);
    }
  });
}, 2000);

setTimeout(async () => {
  p11.subscribe(res => {
    if (res.state === "End") {
      console.log("partner1_data with 1", res);
    }
  });
}, 2000);

setTimeout(() => {
  const start = Date.now();
  p20.subscribe(res => {
    if (res.state === "End") {
      const end = Date.now();
      console.log("after", (end - start) / 1000, " second");
      console.log("partner2_data", res);
    }
  });
}, 2200);

setTimeout(() => {
  const start = Date.now();
  p21.subscribe(res => {
    if (res.state === "End") {
      const end = Date.now();
      console.log("after", (end - start) / 1000, " second");
      console.log("partner2_data", res);
    }
  });
}, 2200);

setTimeout(() => {
  const start = Date.now();
  p10.subscribe(res => {
    if (res.state === "End") {
      const end = Date.now();
      console.log("after", (end - start) / 1000, " second");
      console.log("partner1_data", res);
    }
  });
}, 5000);
