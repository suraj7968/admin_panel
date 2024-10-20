module.exports = function override(config) {
    config.module.rules.forEach(rule => {
      if (rule.oneOf) {
        rule.oneOf.forEach(oneOf => {
          if (oneOf.use) {
            oneOf.use.forEach(use => {
              if (use.loader && use.loader.includes('source-map-loader')) {
                use.options = {
                  ...use.options,
                  filterSourceMappingUrl: (url) => !/antd/.test(url), // Ignore Ant Design source maps
                };
              }
            });
          }
        });
      }
    });
    return config;
  };
  