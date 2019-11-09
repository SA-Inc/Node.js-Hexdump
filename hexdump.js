'use strict';

class Colors {
  reset(string) {
    return `\x1b[0m${string}\x1b[0m`;
  };

  black(string) {
    return `\x1b[30m${string}\x1b[0m`;
  };

  red(string) {
    return `\x1b[31m${string}\x1b[0m`;
  };

  green(string) {
    return `\x1b[32m${string}\x1b[0m`;
  };

  yellow(string) {
    return `\x1b[33m${string}\x1b[0m`;
  };

  blue(string) {
    return `\x1b[34m${string}\x1b[0m`;
  };

  purple(string) {
    return `\x1b[35m${string}\x1b[0m`;
  };

  cyan(string) {
    return `\x1b[36m${string}\x1b[0m`;
  };

  white(string) {
    return `\x1b[37m${string}\x1b[0m`;
  };
}

const fs = require('fs');
const color = new Colors();

const args = process.argv.slice(2);
const filename = args[0];

const hexColorMap = {
  control: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '0a', '0b', '0c', '0d', '0e', '0f', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '1a', '1b', '1c', '1d', '1e', '1f', '7f'],
  letter: ['41', '42', '43', '44', '45', '46', '47', '48', '49', '4a', '4b', '4c', '4d', '4e', '4f', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '5a', '61', '62', '63', '64', '65', '66', '67', '68', '69', '6a', '6b', '6c', '6d', '6e', '6f', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '7a'],
  number: ['30', '31', '32', '33', '34', '35', '36', '37', '38', '39'],
  punctuation: ['20', '21', '22', '23', '25', '26', '27', '28', '29', '2a', '2c', '2d', '2e', '2f', '3a', '3b', '3f', '40', '5b', '5c', '5d', '5f', '7b', '7d'],
  symbol: ['24', '2b', '3c', '3d', '3e', '5e', '60', '7c', '7e'],
  other: ['80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '8a', '8b', '8c', '8d', '8e', '8f', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '9a', '9b', '9c', '9d', '9e', '9f', 'a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'ca', 'cb', 'cc', 'cd', 'ce', 'cf', 'd0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'da', 'db', 'dc', 'dd', 'de', 'df', 'e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9', 'ea', 'eb', 'ec', 'ed', 'ee', 'ef', 'f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'fa', 'fb', 'fc', 'fd', 'fe', 'ff']
}

const parseArgsFlags = (args) => {
  let n, s;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-n': {
        n = Number(args[i + 1]);
        break;
      }
      case '-s': {
        s = Number(args[i + 1]);
        break;
      }
    }
  }

  return { n, s }
}

const lengthSkipArgs = (args) => {
  let n = Infinity, s = 0;

  if (args.n || args.s) {
    n = args.n - 1 || Infinity;
    s = args.s || 0;
  }

  if (args.n && args.s) {
    n = args.n + args.s - 1;
    s = args.s;
  }

  return { n, s };
}

const getColorByHexValue = (hex) => {
  if (hexColorMap.control.includes(hex)) {
    return 'red';
  }
  if (hexColorMap.letter.includes(hex)) {
    return 'green';
  }
  if (hexColorMap.number.includes(hex)) {
    return 'purple';
  }
  if (hexColorMap.punctuation.includes(hex)) {
    return 'blue';
  }
  if (hexColorMap.symbol.includes(hex)) {
    return 'yellow';
  }
  if (hexColorMap.other.includes(hex)) {
    return 'reset';
  }
}

const paintValue = (val, col) => {
  if (col  === 'purple') {
    return color.purple(val);
  }
  if (col  === 'blue') {
    return color.blue(val);
  }
  if (col  === 'red') {
    return color.red(val);
  }
  if (col  === 'green') {
    return color.green(val);
  }
  if (col  === 'yellow') {
    return color.yellow(val);
  }
  if (col  === 'reset') {
    return color.reset(val);
  }
}

// start - skip
// end - length

const lengthAndSkipArgs = parseArgsFlags(args);
const { n, s } = lengthSkipArgs(lengthAndSkipArgs);
const readStreamOption = { highWaterMark: 16, start: s, end: n };

const readFileStream = fs.createReadStream(filename, readStreamOption);
let offset = s || 0;

const hexdump = (buffer) => {
  for (let i = 0; i < buffer.length; i += 16) {
    let address = offset.toString(16).padStart(8, '0'); // address
    let block = buffer.slice(i, i + 16); // cut buffer into blocks of 16
    let hexArray = [];
    let asciiArray = [];
    let padding = '';
    offset += 16;

    for (let value of block) {
      let hex = value.toString(16).padStart(2, '0');
      let ascii = value >= 0x20 && value < 0x7f ? String.fromCharCode(value) : '.';
      let color = getColorByHexValue(hex);
      hexArray.push(paintValue(hex, color));
      asciiArray.push(paintValue(ascii, color));
    }

    // if block is less than 16 bytes, calculate remaining space
    if (hexArray.length < 16) {
      let space = 16 - hexArray.length;
      padding = ' '.repeat(space * 2 + space + (hexArray.length < 9 ? 1 : 0)); // calculate extra space if 8 or less
    }

    let hexString = hexArray.length > 8 ? hexArray.slice(0, 8).join(' ') + '  ' + hexArray.slice(8).join(' ') : hexArray.join(' ');

    let asciiString = asciiArray.join('');
    let line = `${address}  ${hexString}  ${padding}|${asciiString}|`;

    return line;
  }
}

readFileStream.on('data', (chunk) => {
  console.log(hexdump(chunk));
})
