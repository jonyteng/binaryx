module.exports = function getSuitableBody(body, maxLengthLimit = false) {
  const safeBody = String(body);
  if (!safeBody) {
    return '';
  }

  // safeBody = safeBody.replace(/\n/g, '\\n');

  if (maxLengthLimit && safeBody.length > 1000) {
    return `${safeBody.substr(0, 1000)}...`;
  }

  return safeBody;
};
