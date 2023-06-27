export const mapParamsToOptionsArray = (params, regex) =>
  Object.keys(params)
    .filter(key => key.match(regex) && typeof params[key] === 'string')
    .map(key => ({
      label: params[key],
      value: params[key]
    }));

export const mapParamsToStringArray = (params, regex) =>
  Object.keys(params)
    .filter(key => key.match(regex) && typeof params[key] === 'string')
    .map(key => params[key]);

export const removeParams = (params, regex) => {
  const newParams = {};
  for (const key in params) if (!regex.test(key)) newParams[key] = params[key];
  return newParams;
};
