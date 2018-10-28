var request = require("request");
const { Observable } = require("rxjs");
const { dispatch, buildPartnerRequest } = require("./index");
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

var partner1$ = dispatch(partner1);

var duplicateCallPartner1$ = dispatch(partner1);

var partner2$ = dispatch(partner2);

var partner3 = buildPartnerRequest(
  partnerRequest,
  "https://api.github.com/repos/ysfmag/amplify-js",
  {}
);

var partner3$ = dispatch(partner3);
partner3$.subscribe(e => {
  console.log("parnter3");
  console.log(Background.blue, JSON.stringify(e));
});

partner1$.subscribe(e => {
  console.log("parnter1");
  console.log(Background.blue, JSON.stringify(e));
});

duplicateCallPartner1$.subscribe(e => {
  console.log(Background.blue, JSON.stringify(e));
});

partner2$.subscribe(e => {
  console.log(Background.blue, JSON.stringify(e));
});
