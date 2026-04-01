// Minimal process polyfill for browser environments
module.exports = {
    env: {},
    argv: [],
    platform: 'browser',
    version: '',
    versions: {},
    on: function () { },
    once: function () { },
    off: function () { },
    emit: function () { },
    cwd: function () { return '/'; },
    chdir: function () { },
    nextTick: function (fn) { setTimeout(fn, 0); }
};
