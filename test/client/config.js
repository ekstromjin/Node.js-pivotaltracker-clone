var config = {
    api:{
        host: "",
        port: 80,
        secure: false,
        version: "v1"
    },
    cdn: {
        hostname: "",
        domain: "",
        env : "development"
    },
    siteAnalytics: false,
    env: "development"
};

window.config = window.btoa(JSON.stringify(config));