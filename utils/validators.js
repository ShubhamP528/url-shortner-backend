const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const validateAlias = (alias) => {
  const aliasRegex = /^[a-zA-Z0-9-_]{3,}$/;
  return aliasRegex.test(alias);
};

module.exports = {
  validateUrl,
  validateAlias,
};
