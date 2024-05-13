const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const rsc = require('./rsc');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { spawn, exec } = require('child_process');
const os = require('os');
//const ProgressBar = require('progress')
let errormessage = false;

function check_rust() {
  return new Promise((resolve, reject) => {
    let rustinstall = true;
    const rundir = path.parse(process.argv[0]).dir;
    const rscrecordpath = path.join(rundir, 'rscrecord.json');
    const hasrscrecord = fs.existsSync(rscrecordpath);
    const inst = () => {
      if (os.type() == 'Windows_NT') {
        /*
        console.log('\x1b[32m开始下载 Rust 安装程序...\x1b[m');
        if (os.arch() == 'x64')
          var url = 'https://0832.ink/rsc/rustup/rustup-init-x64.exe';
        else if (os.arch() == 'ia32')
          var url = 'https://0832.ink/rsc/rustup/rustup-init-i386.exe';
        https.get(url, (response) => {
          let data = [];
          response.on('data', (chunk) => {
            data.push(chunk);
          }).on('end', () => {
            data = Buffer.concat(data);
            fs.writeFile(path.join(rundir, "rustup-init.exe"), data, (err) => {
              if (err) throw err;
            });
            console.log('\x1b[32mRust 安装程序下载完成. 开始安装 Rust...\x1b[m');
            exec(path.join(rundir, "rustup-init.exe"), function (error, stdout, stderr) {
              if (error) {
                console.log('\x1b[31mRust 安装失败\x1b[m', error);
                reject(error);
              }
              rustinstall == true;
              console.log('\x1b[32mRust 安装成功.\x1b[m');
              if (hasrscrecord) {
                let rscrecord = JSON.parse(fs.readFileSync(rscrecordpath));
                rscrecord.rust = true;
                fs.writeFileSync(rscrecordpath, JSON.stringify(rscrecord));
              }
              else
                fs.writeFileSync(rscrecordpath, JSON.stringify({ rust: true }));
              resolve(true);
            });
          });
        }).on('error', (error) => {
          reject(error);
        });
        */
        console.log('\x1b[31mRust未安装\x1b[m Rust 是 rCompiler 最关键的依赖，请安装 Rust 以使用 rCompiler');
        if (os.arch() == 'x64')
          console.log('\x1b[32m请下载\x1b[m https://0832.ink/rsc/rustup/rustup-init-x64.exe \x1b[32m以安装\x1b[m');
        else if (os.arch() == 'ia32')
          console.log('\x1b[32m请下载\x1b[m https://0832.ink/rsc/rustup/rustup-init-i386.exe \x1b[32m以安装\x1b[m');
        console.log('\x1b[32m还需要下载Visual Studio\x1b[m https://visualstudio.microsoft.com/downloads/ \x1b[32m选择“使用 C++ 进行桌面开发”安装。\x1b[m');
        reject('请安装Rust');
      }
      else {
        console.log('\x1b[32m开始安装 Rust...\x1b[m');
        exec('curl --proto \'=https\' --tlsv1.2 -sSf https://0832.ink/rsc/rustup/rustup-init.sh | sh -s -- -y', function (error) {
          if (error) {
            console.error('\x1b[31mRust 安装失败\x1b[m' + error);
            reject(error);
          }
          console.log('\x1b[32mRust 安装成功.\x1b[m');
          if (hasrscrecord) {
            let rscrecord = JSON.parse(fs.readFileSync(rscrecordpath));
            rscrecord.rust = true;
            fs.writeFileSync(rscrecordpath, JSON.stringify(rscrecord));
          }
          else
            fs.writeFileSync(rscrecordpath, JSON.stringify({ rust: true }));
          resolve(true);
        });
      }
    }
    if (!hasrscrecord) {
      exec('cargo -V', (error) => {
        if (error) {
          inst();
        }
        else {
          rustinstall = true;
          fs.writeFileSync(rscrecordpath, JSON.stringify({ rust: true }));
        }
      });
    }
    else {
      let rscrecord = JSON.parse(fs.readFileSync(rscrecordpath));
      if (!rscrecord.hasOwnProperty('rust'))
        rustinstall = false;
      else if (!rscrecord.rust)
        rustinstall = false;
      else
        resolve(true);
      if (rustinstall == false)
        inst();
    }
    /*
    if (rustinstall == false) {
      console.log('\x1b[32mRust未安装\x1b[m');
      if (os.type() == 'Windows_NT') {
        if (os.arch() == 'x64')
          console.log('\x1b[32m请下载\x1b[m https://0832.ink/rsc/rustup/rustup-init-x64.exe \x1b[32m以安装\x1b[m');
        else if (os.arch() == 'ia32')
          console.log('\x1b[32m请下载\x1b[m https://0832.ink/rsc/rustup/rustup-init-i386.exe \x1b[32m以安装\x1b[m');
      }
      else
        console.log('\x1b[32m请在控制台输入\x1b[m curl --proto \'=https\' --tlsv1.2 -sSf https://0832.ink/rsc/rustup/rustup-init.sh | sh -s -- -y \x1b[32m以安装\x1b[m');
    }
    */
  })
}

async function rf(zipFilePath) {
  try {
    if (path.extname(zipFilePath) === '.json') {
      const data = fs.readFileSync(zipFilePath);
      return JSON.parse(data.toString('utf-8'));
    } else {
      const data = fs.readFileSync(zipFilePath);
      const zip = new JSZip();
      await zip.loadAsync(data);

      const projectJson = await zip.file('project.json').async("string");
      if (!projectJson) {
        throw new Error('不是有效的Scratch项目文件');
      }
      return JSON.parse(projectJson);
    }
  } catch (error) {
    throw error;
  }
}
async function comp(argv, mode) {
  const zipFilePath = argv.path;
  try {
    const jsonData = await rf(zipFilePath);
    const pathto = path.resolve(argv.to);

    switch (mode) {
      case 't': {
        function createDirectory(path) {
          if (fs.existsSync(path)) {
            return;
          }
          fs.mkdirSync(path, { recursive: true });
        }
        createDirectory(pathto);
        break;
      }
      case 'n': {
        function createDirectory(path) {
          if (fs.existsSync(path))
            return;
          console.log('\x1b[32m正在构建项目\x1b[m');
          fs.mkdirSync(path, { recursive: true });
        }
        createDirectory(pathto);
        break;
      }
      case 'c': {
        function createDirectory(path) {
          if (fs.existsSync(path))
            fs.rmdirSync(path, { recursive: true });
          console.log('\x1b[32m正在构建项目\x1b[m');
          fs.mkdirSync(path, { recursive: true });
        }
        createDirectory(pathto);
        break;
      }
    }

    const compiler = new rsc();
    if (mode == 't') var { deplist } = await compiler.compile(jsonData, path.join(pathto, 'src'), path.parse(zipFilePath).name, true);
    else var { deplist } = await compiler.compile(jsonData, path.join(pathto, 'src'), path.parse(zipFilePath).name, false);

    const cargotoml = [
      `# By r-Scratch-Compiler ${new Date().toISOString()} 🍥 v${compiler.version()}-${compiler.compilertype()}`,
      '[package]',
      `name = "${argv.name}"`,
      `version = "${argv.ver}"`,
      'edition = "2021"',
      '[dependencies]'
    ];

    deplist.forEach(item => {
      cargotoml.push(item);
    });

    fs.writeFileSync(path.join(pathto, 'Cargo.toml'), cargotoml.join('\n'));
  } catch (error) {
    console.error('\x1b[31m编译出错\x1b[m', error.message);
    errormessage = true;;
  }
}
yargs(hideBin(process.argv))
  .locale('zh_CN')
  .usage('用法：rsc <命令> [选项]')
  .command('$0 <path>', '执行程序', (yargs) => {
    return yargs
      .positional('path', {
        describe: '程序源文件的路径',
        type: 'string'
      })
  }, async (argv) => {
    const extra_args = argv._;
    await comp({ path: argv.path, to: 'rmake', name: path.parse(argv.path).name, ver: '1.0.0' }, 'n');
    if (errormessage) {
      return;
    }
    check_rust().then((result) => {
      switch (os.type()) {
        case 'Windows_NT': {
          const args = ['build'];
          const child = spawn('cargo', args, { cwd: path.resolve('./rmake') });
          child.on('close', (e) => {
            if (e == 0) spawn(path.resolve(`./rmake/target/debug/${path.parse(argv.path).name}.exe`), extra_args, { stdio: 'inherit' });
            else
              console.error('\x1b[31m编译器错误\x1b[m', e);
          });
          break;
        }
        case 'Linux': {
          const args = ['build'];
          const child = spawn('cargo', args, { cwd: path.resolve('./rmake'), stdio: 'inherit' });
          child.on('close', (e) => {
            if (e == 0) spawn(path.resolve(`./rmake/target/debug/${path.parse(argv.path).name}`), extra_args, { stdio: 'inherit' });
            else
              console.error('\x1b[31m编译器错误\x1b[m', e);
          });
          break;
        }
        default: {
          console.error('\x1b[31m你的设备平台不受支持\x1b[m', '请安装Cargo执行rmake目录下的文件 (cargo run)');
        }
      }
    }, (reject) => {
      console.error('\x1b[31m安装Rust错误 \x1b[m', reject);
    });
  })
  .command('o <path> <to> <name> <ver>', '编译为可执行文件，指定路径和目标', (yargs) => {
    return yargs
      .positional('path', {
        describe: '源路径',
        type: 'string'
      })
      .positional('to', {
        describe: '目标路径',
        type: 'string'
      })
      .positional('name', {
        describe: '程序的名称',
        type: 'string'
      })
      .positional('ver', {
        describe: '程序的版本',
        type: 'string'
      });
  }, async (argv) => {
    await comp({ path: argv.path, to: 'rmake', name: argv.name, ver: argv.ver }, 'c');
    if (errormessage) {
      return;
    }
    if (await check_rust())
      switch (os.type()) {
        case 'Windows_NT': {
          const args = ['build', '--release'];
          const child = spawn('cargo', args, { cwd: path.resolve('./rmake') });
          child.on('close', (e) => {
            if (e == 0) {
              createDirectory(path.resolve(argv.to));
              fs.copyFile(`${path.resolve('./rmake')}/target/release/${argv.name}.exe`, `${path.resolve(argv.to)}/${argv.name}.exe`, (err) => {
                if (err) {
                  console.error('\x1b[31m复制构建文件时出错\x1b[m', err);
                }
                else {
                  console.log(`\x1b[32m构建完成，至 ${argv.to} 目录\x1b[m`);
                }
              });
            }
            else
              console.error('\x1b[31m编译器错误\x1b[m', e);
          });
          break;
        }
        case 'Linux': {
          const args = ['build', '--release'];
          const child = spawn('cargo', args, { cwd: path.resolve('./rmake') });
          child.on('close', () => {
            createDirectory(path.resolve(argv.to));
            fs.copyFile(`${path.resolve('./rmake')}/target/release/${argv.name}`, `${path.resolve(argv.to)}/${argv.name}`, (err) => {
              if (err) {
                console.error('复制构建文件时出错：', err);
              }
              else {
                console.log(`\x1b[32m构建完成，至 ${argv.to} 目录\x1b[m`);
              }
            });
          });
          break;
        }
        default: {
          console.error('\x1b[31m你的设备平台不受支持\x1b[m', '请安装Cargo编译rmake目录下的文件 (cargo build --release)');
        }
      }
  })
  .command('t <path>', '测试命令，指定路径', (yargs) => {
    return yargs
      .positional('path', {
        describe: '需要测试的源程序路径',
        type: 'string'
      });
  }, async (argv) => {
    await comp({ path: argv.path, to: 'rmake', name: path.parse(argv.path).name, ver: '1.0.0' }, 't');
  })
  .command('b <path> <to> <name> <ver>', '构建命令，指定源路径和目标路径', (yargs) => {
    return yargs
      .positional('path', {
        describe: '用于构建的源路径',
        type: 'string'
      })
      .positional('to', {
        describe: '构建输出目标路径',
        type: 'string'
      })
      .positional('name', {
        describe: '程序的名称',
        type: 'string'
      })
      .positional('ver', {
        describe: '程序的版本',
        type: 'string'
      });
  }, async (argv) => {
    await comp(argv, 'c');
  })
  /*
  .command('Blockly <path>', '编译至Blockly', (yargs) => {
    return yargs
      .positional('path', {
        describe: '需要编译的源程序路径',
        type: 'string'
      });
  }, async (argv) => {
    const compiler = new rscBlockly();
    console.log(compiler.compile(await rf(argv.path)));
  })
  .command('js <path>', '编译至可执行JavaScript', (yargs) => {
    return yargs
      .positional('path', {
        describe: '需要编译的源程序路径',
        type: 'string'
      });
  }, async (argv) => {
    const zipFilePath = argv.path;
    try {
      const jsonData = await rf(zipFilePath);
      const pathto = path.resolve('rmake');
      function createDirectory(path) {
        if (fs.existsSync(path)) {
          return;
        }
        fs.mkdirSync(path, { recursive: true });
      }
      createDirectory(pathto);
      const compiler = new rscIR();
      var { deplist } = compiler.compile(jsonData, path.join(pathto, 'src'), path.parse(zipFilePath).name, true);

      const cargotoml = [
        `# By r-Scratch-Compiler ${new Date().toISOString()} 🍥 v${compiler.version()}-${compiler.compilertype()}`,
        '[package]',
        `name = "${path.parse(argv.path).name}"`,
        `version = "1.0.0"`,
        'edition = "2021"',
        '[dependencies]'
      ];

      deplist.forEach(item => {
        cargotoml.push(item);
      });

      fs.writeFileSync(path.join(pathto, 'Cargo.toml'), cargotoml.join('\n'));
    } catch (error) {
      console.error('\x1b[31m编译出错\x1b[m', error.message);
      errormessage = true;;
    }
  })
  */
  .version(new rsc().version())
  .alias('version', 'v')
  .help()
  .alias('help', 'h')
  .demandCommand(1, '您必须至少使用一个命令')
  .recommendCommands()
  .strictCommands()
  .strictOptions()
  .argv;