import {readFileSync, writeFileSync} from "fs";

const lessComments = (file) => {
  const content = readFileSync(file).toString();
  const drop = ''.replace.call(Math.random(), '\D', '-');
  const known = new Set;
  return content
          .replace(/\/\*![^\1]*?(\*\/)/g, comment => {
            if (known.has(comment))
              return '\x00' + drop;
            known.add(comment);
            return comment;
          })
          .replace(new RegExp('^\\x00' + drop + '[\r\n]+', 'gm'), '');
};

writeFileSync('min.js', lessComments('min.js'));
writeFileSync('poly.js', lessComments('poly.js'));
