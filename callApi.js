var request = require("request");
const { Observable } = require("rxjs");
const { callResources, initStreamCache, dispatch } = require("./index");
const Background = {
  blue: "\x1b[44m%s\x1b[0m",
  yellow: "\x1b[33m%s\x1b[0m",
  red: "\x1b[41m"
};

const partnerRequest = (partner, params, notify) => {
  request.get(
    partner,
    {
      headers: {
        accept: "application/vnd.github.v3+json",
        "user-agent": "not v1.2.3" // v1.2.3 will be current version
      },
      params
    },
    (error, response, body) => {
      const { id, node_id: nodeId } = JSON.parse(body);

      notify({
        id,
        nodeId
      });
    }
  );
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

//
const buildPartnerRequest = (partnerFunction, resourceName, params) => {
  return {
    resourceName,
    stream: rxRequest(partnerFunction, resourceName, params),
    params
  };
};

const partner1 = buildPartnerRequest(
  partnerRequest,
  "https://api.github.com/repos/ysfmag/advanced-react",
  {}
);

const partner2 = buildPartnerRequest(
  partnerRequest,
  "https://api.github.com/repos/ysfmag/amplify-js",
  {}
);

var partner1$ = dispatch(
  partner1.resourceName,
  partner1.stream,
  partner1.params
);

var duplicateCallPartner1$ = dispatch(
  partner1.resourceName,
  partner1.stream,
  partner1.params
);

var partner2$ = dispatch(
  partner2.resourceName,
  partner2.stream,
  partner2.params
);

const streamCache$ = initStreamCache();
callResources(streamCache$);

partner1$.subscribe(e => {
  console.log(Background.blue, JSON.stringify(e));
});

duplicateCallPartner1$.subscribe(e => {
  console.log(Background.blue, JSON.stringify(e));
});

partner2$.subscribe(e => {
  console.log(Background.blue, JSON.stringify(e));
});
