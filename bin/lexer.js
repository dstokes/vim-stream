process.stdin
  .pipe(require('../')())
  .pipe(process.stdout);
