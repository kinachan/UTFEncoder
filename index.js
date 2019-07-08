const fs = require('fs');
const iconvLite = require('iconv-lite');
const jschardet = require('jschardet');
const Iconv = require('iconv').Iconv;

const srcDirectiory = './data';
const distDirectory = './dist';

/**
 * 各ディレクトリをセットアップします。
 */
const setUpDirectories = () => {
  if (!fs.existsSync(distDirectory)) {
    fs.mkdirSync(distDirectory);
  }
  
  if (!fs.existsSync(srcDirectiory)) {
    fs.mkdirSync(srcDirectiory);
  }

  const deleteTargets = fs.readdirSync(distDirectory);
  deleteTargets.forEach(fileName => {
    fs.unlinkSync(`${distDirectory}/${fileName}`);
  });
}

/**
 * SHIFT-JISにエンコードします。
 */
const encodeSToShitJis = (buffer) => iconvLite.decode(buffer, 'Shift_JIS');

/**
 * ファイルを書き込みます。
 * @param {*} fileName 
 * @param {*} data 
 */
const writeFile = (fileName, data) => fs.writeFileSync(`${distDirectory}/${fileName}`, data);

const readFileToBuffer = (fileName) => {
  const file = fs.readFileSync(`${srcDirectiory}/${fileName}`);
  const buffer = new Buffer(file, 'binary');
  return buffer;
};

/**
 * スクリプトを実行します。
 */
const run = () => {
  setUpDirectories();
  // ディレクトリの中身をすべて取得。
  const fileNames = fs.readdirSync(srcDirectiory);

  // ループ処理で1つずつファイルを読み取り
  fileNames.forEach(fileName => {
    const buffer = readFileToBuffer(fileName);
    const encodeResult = jschardet.detect(buffer);
    
    // エンコード判定
    // distファイルに格納
    if (encodeResult.encoding === 'SHIFT_JIS' || encodeResult.encoding === 'ISO-8859-2') {
      // SHIFTJISからUTF-8に変換。
      const file = encodeSToShitJis(buffer);
      writeFile(fileName, file);
    } else if (encodeResult.encoding === 'UTF-8') {
      writeFile(fileName, buffer);
    } else {
      const iconv = new Iconv(encodeResult.encoding,'UTF-8//TRANSLIT//IGNORE');
      const data = iconv.convert(buffer);

      console.log(fileName, encodeResult.encoding);

      fs.writeFileSync(`${distDirectory}/${fileName}`, data);
    }
  });
}

run();

