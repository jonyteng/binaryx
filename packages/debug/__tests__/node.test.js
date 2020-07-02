const { debugEnabled } = require('..');

const testLog = debugEnabled('test');

testLog('test %o', 2, { a: 1, b: 2 }, { 1: 1111111 });

// describe('debug', () => {
//     it('needs tests');
// });
