// Lingba Saner 🍥 24502-*
const isLocal = typeof window === 'undefined';
const crc32 = require('crc32');
const JSZip = require('jszip');
if (isLocal) {
  var fs = require('fs');
  var path = require('path');
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

class rsc {
  version() {
    return '1';
  }
  compilertype() {
    return 'stl';
  }
  async compile(jsonData, folderPath, fileName, iflog) {
    let rscStorage = null;
    if (jsonData.extensionStorage)
      if (jsonData.extensionStorage.rsc)
        rscStorage = jsonData.extensionStorage.rsc;
    const notRepeatCloneList = rscStorage?.project?.notRepeatCloneList?.split(',');
    let extrablocks = [];
    var structs = [];
    var funcs = [];
    var out = '';
    let targetID = -1;
    var compileEvents = [
      'rsc_import',
      'procedures_definition',
      'event_whenbroadcastreceived',
      'event_whenflagclicked',
      'event_whenkeypressed',
      'rsc_setmain',
      'rsc_setruntime'
    ];
    var inputlist = [
      'sensing_answer',
      'operator_equals',
      'operator_subtract',
      'operator_add',
      'operator_divide',
      'operator_multiply',
      'operator_join',
      'operator_random',
      'operator_gt',
      'operator_lt',
      'operator_and',
      'operator_or',
      'operator_not',
      'operator_contains',
      'operator_letter_of',
      'operator_length',
      'operator_mod',
      'operator_round',
      'operator_mathop',
      'sensing_timer',
      'argument_reporter_string_number',
      'argument_reporter_boolean',
      'procedures_prototype',
      'data_itemoflist',
      'data_itemnumoflist',
      'data_lengthoflist',
      'data_listcontainsitem',
      'control_create_clone_of_menu',
      'control_run_as_sprite_menu',
      'rsc_user',
      'rsc_compilerversion',
      'rsc_varget',
      'rsc_typeas',
      'rsc_typeis',
      'rsc_typechoose',
      'rsc_typeof',
      'procedures_call'
    ];
    var operatorlist = [
      'operator_equals',
      'operator_subtract',
      'operator_add',
      'operator_divide',
      'operator_multiply',
      'operator_join',
      'operator_gt',
      'operator_lt',
      'operator_and',
      'operator_or',
      'operator_not',
      'operator_mod'
    ];
    var uselist = [];
    var deplist = [];
    var runtimelist = [];
    var starteventlist = [];
    var clones = {};
    var globalvarlist = [];
    var noglobalvarids = [];
    var noglobalvarlist = [];
    var nogloballistids = [];
    var flagcount = 0;
    var clonecount = 0;
    var proccount = 0;
    var presscount = 0;
    var broadcastfuncs = {};
    var procnamelist = [];
    var procparselist = [];
    var proctypelist = [];
    var proctypelistbackup = [];
    var procpublist = [];
    var procpubrealnamelist = [];
    var inuselist = [];
    var mainlist = [];
    var isclone = false;
    var hasreturn = false;
    var hasCommandBlock = false;
    var selfmut = false;
    var clonevarlist = [];
    var rscfunc = '';
    var globalextrablocks = [];
    var foreachcount = 0;
    var keywordcount = 0;
    var keywords = {};
    var keywordonlys = {};
    var procUsingArgList = [];
    var ignore = false;
    var diagnosis = '';
    var usingvars = {};
    var usedvars = [];
    var structnames = [];
    var haverscfunc = false;
    var reqlist = [];
    var Tools = {
      setlibrary(library) {
        const itemsToAdd = library;
        itemsToAdd.forEach(item => {
          if (!uselist.includes(item)) {
            uselist.push(item);
          }
        });
      },
      setmain(main) {
        const itemsToAdd = main;
        itemsToAdd.forEach(item => {
          if (!mainlist.includes(item)) {
            mainlist.push(item);
          }
        });
      },
      setdepend(depend) {
        const itemsToAdd = depend;
        itemsToAdd.forEach(item => {
          if (!deplist.includes(item)) {
            deplist.push(item);
          }
        });
      },
      setruntime(runtime) {
        const itemsToAdd = runtime;
        itemsToAdd.forEach(item => {
          if (!runtimelist.includes(item)) {
            runtimelist.push(item);
          }
        });
      },
      setfunc(func) {
        const itemsToAdd = func;
        itemsToAdd.forEach(item => {
          if (!funcs.includes(item)) {
            funcs.push(item);
          }
        });
      },
      setstruct(struct) {
        const itemsToAdd = struct;
        itemsToAdd.forEach(item => {
          if (!structnames.includes(item[0])) {
            structs.push(item);
            structnames.push(item[0]);
          }
        });
      },
      setreq(req) {
        const itemsToAdd = req;
        itemsToAdd.forEach(item => {
          if (!reqlist.includes(item[0])) {
            reqlist.push(item);
          }
        });
      },
      setinuse(use) {
        const itemsToAdd = use;
        itemsToAdd.forEach(item => {
          if (!inuselist.includes(item)) {
            inuselist.push(item);
          }
        });
      },
      setclonevar(vari) {
        const itemsToAdd = vari;
        itemsToAdd.forEach(item => {
          if (!clonevarlist.includes(item)) {
            clonevarlist.push(item);
          }
        });
      },
      setextrablockcompile(extin) {
        const register = (ext) => {
          if ((!ext.blocks || !ext.id) || !ext.getInfo)
            return;
          if ((!ext.blocks || !ext.id)) {
            const { id, blocks } = ext.getInfo();
            ext = { ...ext, id, blocks };
          }
          ext.blocks.forEach(block => {
            if (block.blockType != 'u') {
              const func = ext[block.opcode];
              const opcode = ext.id + '_' + block.opcode;
              const type = block.blockType;
              const startornot = block.blockStart;
              extrablocks.push(opcode);
              if (block.isOperator) {
                operatorlist.push(opcode);
              }
              switch (type) {
                case 'm': {
                  compiles[opcode] = func;
                  break;
                }
                case 'r': {
                  inputscompiles[opcode] = func;
                  inputlist.push(opcode);
                  break;
                }
              }
              if (startornot)
                compileEvents.push(opcode);
            }
          });
        }
        const BlockType = {
          COMMAND: 'm',
          CONDITIONAL: 'm',
          LOOP: 'm',
          HAT: 'm',
          REPORTER: 'r',
          BOOLEAN: 'r',
          LABEL: 'u',
          XML: 'u',
          BUTTON: 'u'
        };
        const extensions = { register };
        const isCompiler = true;
        const ext = new Function(extin);
        const ThrowError = (err) => {
          throw new Error(err)
        }
        if (rscStorage?.config?.AllowThis)
          ext.call({ rsc: this, fs, JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
        else
          ext.call({ JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
      }
    }
    var TypeInput = {
      Any: class {
        constructor(input) {
          this.input = input;
          this.type = 'Any';
        }
        Num() {
          return this.input;
        }
        Usize() {
          return this.input;
        }
        i32() {
          return this.input;
        }
        Str() {
          return this.input;
        }
        Stri() {
          return this.input;
        }
        Stu() {
          return this.input;
        }
      },
      Num: class {
        constructor(input) {
          this.input = input;
          this.type = 'Num';
        }
        Num() {
          return this.input;
        }
        Usize() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_usize';
          return `(${this.input}) as usize`;
        }
        i32() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_i32';
          return `(${this.input}) as i32`;
        }
        Str() {
          return `&((${this.input}).to_string())`;
        }
        Stri() {
          return `(${this.input}).to_string()`;
        }
        Stu() {
          return `(${this.input}).to_string()`;
        }
      },
      Usize: class {
        constructor(input) {
          this.input = input;
          this.type = 'Usize';
        }
        Num() {
          return `(${this.input}) as f64`;
        }
        Usize() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_usize';
          return this.input;
        }
        i32() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_i32';
          return `(${this.input}) as i32`;
        }
        Str() {
          return `&((${this.input}).to_string())`;
        }
        Stri() {
          return `(${this.input}).to_string()`;
        }
        Stu() {
          return `(${this.input}).to_string()`;
        }
      },
      i32: class {
        constructor(input) {
          this.input = input;
          this.type = 'i32';
        }
        Num() {
          return `(${this.input}) as f64`;
        }
        Usize() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_usize';
          return `(${this.input}) as usize`;
        }
        i32() {
          if (Number(this.input))
            return Math.round(this.input).toString() + '_i32';
          return this.input;
        }
        Str() {
          return `&((${this.input}).to_string())`;
        }
        Stri() {
          return `(${this.input}).to_string()`;
        }
        Stu() {
          return `(${this.input}).to_string()`;
        }
      },
      Str: class {
        constructor(input) {
          this.input = input;
          this.type = 'Str';
        }
        Num() {
          Tools.setruntime([
            `fn get_f64_string<T: AsRef<str>>(toget:T)->f64 {\nlet num:Result<f64, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0.0\n}\n}`
          ]);
          return `get_f64_string(${this.input})`;
        }
        Usize() {
          Tools.setruntime([
            `fn get_usize_string<T: AsRef<str>>(toget:T)->usize {\nlet num:Result<usize, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
          ]);
          return `get_usize_string(${this.input})`;
        }
        i32() {
          Tools.setruntime([
            `fn get_i32_string<T: AsRef<str>>(toget:T)->i32 {\nlet num:Result<i32, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
          ]);
          return `get_i32_string(${this.input})`;
        }
        Str() {
          return this.input;
        }
        Stri() {
          return `String::from(${this.input})`;
        }
        Stu() {
          return this.input;
        }
      },
      Stri: class {
        constructor(input) {
          this.input = input;
          this.type = 'Stri';
        }
        Num() {
          Tools.setruntime([
            `fn get_f64_string<T: AsRef<str>>(toget:T)->f64 {\nlet num:Result<f64, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0.0\n}\n}`
          ]);
          return `get_f64_string(${this.input.endsWith('.clone()') ? this.input : this.input + '.clone()'})`;
        }
        Usize() {
          Tools.setruntime([
            `fn get_usize_string<T: AsRef<str>>(toget:T)->usize {\nlet num:Result<usize, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
          ]);
          return `get_usize_string(${this.input.endsWith('.clone()') ? this.input : this.input + '.clone()'})`;
        }
        i32() {
          Tools.setruntime([
            `fn get_i32_string<T: AsRef<str>>(toget:T)->i32 {\nlet num:Result<i32, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
          ]);
          return `get_i32_string(${this.input.endsWith('.clone()') ? this.input : this.input + '.clone()'})`;
        }
        Str() {
          return '&*(' + this.input + ')';
        }
        Stri() {
          return this.input;
        }
        Stu() {
          return this.input;
        }
      },
      Bool: class {
        constructor(input) {
          this.input = input;
          this.type = 'Bool';
        }
        Bool() {
          return this.input;
        }
        Num() {
          return `(${this.input}) as f64`;
        }
        Usize() {
          return `(${this.input}) as usize`;
        }
        i32() {
          return `(${this.input}) as i32`;
        }
        Str() {
          return `&(${this.input}).to_string())`;
        }
        Stri() {
          return `(${this.input}).to_string()`;
        }
        Stu() {
          return `(${this.input}).to_string()`;
        }
      },
      Var: rscStorage?.project?.UnuseTokio ?
        class {
          constructor(input) {
            this.input = input;
            this.type = 'Var';
          }
          Num() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `self.vf_${varin}`;
            }
            else {
              return `self.vf_${targetID}_${varin}`;
            }
          }
          Usize() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `self.vf_${varin} as usize`;
            }
            else {
              return `self.vf_${targetID}_${varin} as usize`;
            }
          }
          i32() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `self.vf_${varin} as i32`;
            }
            else {
              return `self.vf_${targetID}_${varin} as i32`;
            }
          }
          Str() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `&*self.vs_${varin}`;
            }
            else {
              return `&*self.vs_${targetID}_${varin}`;
            }
          }
          Stri() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `self.vs_${varin}.clone()`;
            }
            else {
              return `self.vs_${targetID}_${varin}.clone()`;
            }
          }
          Stu() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              return `self.vs_${varin}.clone()`;
            }
            else {
              return `self.vs_${targetID}_${varin}.clone()`;
            }
          }
        } :
        class {
          constructor(input) {
            this.input = input;
            this.type = 'Var';
          }
          Num() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_global_num_${varin}()`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${targetID}_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_${targetID}_num_${varin}()`;
            }
          }
          Usize() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_global_num_${varin}() as usize`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${targetID}_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_${targetID}_num_${varin}() as usize`;
            }
          }
          i32() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_global_num_${varin}() as i32`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_num_${varin}(&self) -> f64 {\nlet globalvar = *self.vf_${targetID}_${varin}.lock().unwrap();\nglobalvar\n}`]);
              return `self.get_${targetID}_num_${varin}() as i32`;
            }
          }
          Str() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `&*self.get_global_str_${varin}()`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${targetID}_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `&*self.get_${targetID}_str_${varin}()`;
            }
          }
          Stri() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `self.get_global_str_${varin}()`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${targetID}_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `self.get_${targetID}_str_${varin}()`;
            }
          }
          Stu() {
            const varin = this.input;
            if (globalvarlist.includes(varin)) {
              Tools.setfunc([`fn get_global_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `self.get_global_str_${varin}()`;
            }
            else {
              Tools.setfunc([`fn get_${targetID}_str_${varin}(&self) -> String {\nlet globalvar = self.vs_${targetID}_${varin}.lock().unwrap().clone();\nglobalvar\n}`]);
              return `self.get_${targetID}_str_${varin}()`;
            }
          }
        }
    }
    var Cast = {
      toNum(str) {
        if (!str) return '0.0';
        if (typeof str == 'number') str = str.toString();
        if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
        if (str == "") return '0.0';
        if (Number.isInteger(Number(str))) return String(Number(str)) + '.0';
        return str;
      },
      toUsize(str) {
        if (!str) return '0';
        if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
        if (str === "") return '0';
        if (str.includes('.')) return '(' + str + ') as usize';
        if (!Number.isInteger(Number(str))) return '(' + str + ') as usize';
        return str;
      },
      toi32(str) {
        if (!str) return '0';
        if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
        if (str === "") return '0';
        if (str.includes('.')) return '(' + str + ') as i32';
        if (!Number.isInteger(Number(str))) return '(' + str + ') as i32';
        return str;
      },
      toStr(num) {
        if (!num) return '""';
        if (Number(num) || num == 0) return '"' + num + '"';
        if (!(num.startsWith('"') && num.endsWith('"'))) return '&' + num;
        return num;
      },
      toStri(str) {
        if (!str) return 'String::new()';
        if (Cast.isNum(str)) return '(' + str + ').to_string()';
        if (str.startsWith('"') && str.endsWith('"')) str = '(' + str + ').to_string()';
        if (str.startsWith('(') && str.endsWith(')')) str = '(' + str + ').to_string()';
        if (str.startsWith('_')) str = '(' + str + ').to_string()';
        return str;
      },
      isNum(classinput) {
        return classinput.type == 'f64' || classinput.type == 'i32' || classinput.type == 'usize';
      },
      NumTest(str) {
        if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
        return /^\s*(-?\d+(\s*[\+\-\*\/%]\s*-?\d+)*)\s*$/.test(str);
      },
      toBool(str) {
        if (!str) return 'false';
        if (str == '') return 'false';
        return str;
      },
      toChar(str) {
        return "'" + str + "'";
      },
      toKeyword(str) {
        if (typeof str == 'string') return str.slice(1, -1);
        return '';
      },
      toPress(pressfield, block) {
        let pressing = '';
        switch (pressfield) {
          case 'space': {
            pressing = ' ';
            break;
          }
          case 'up arrow': {
            pressing = 'Up';
            break;
          }
          case 'down arrow': {
            pressing = 'Down';
            break;
          }
          case 'right arrow': {
            pressing = 'Right';
            break;
          }
          case 'left arrow': {
            pressing = 'Left';
            break;
          }
          case 'enter': {
            pressing = 'Enter';
            break;
          }
          case 'any': {
            pressing = 'Char(c)';
            break;
          }
          case 'backspace': {
            pressing = 'Backspace';
            break;
          }
          case 'delete': {
            pressing = 'Delete';
            break;
          }
          case 'shift': {
            pressing = 'Null';
            break;
          }
          case 'caps lock': {
            pressing = 'CapsLock';
            break;
          }
          case 'scroll lock': {
            pressing = 'ScrollLock';
            break;
          }
          case 'control': {
            pressing = 'Null';
            break;
          }
          case 'escape': {
            pressing = 'Esc';
            break;
          }
          case 'insert': {
            pressing = 'Insert';
            break;
          }
          case 'home': {
            pressing = 'Home';
            break;
          }
          case 'end': {
            pressing = 'End';
            break;
          }
          case 'page up': {
            pressing = 'PageUp';
            break;
          }
          case 'page down': {
            pressing = 'PageD';
            break;
          }
          default: {
            pressing = `Char(${Cast.toChar(block.fields.KEY_OPTION[0])})`;
            break;
          }
        }
        return pressing;
      },
      unParse(parsed) {
        return JSON.stringify(parsed);
      },
      keywordunParse(parsed) {
        if (keywords.hasOwnProperty(parsed))
          return keywords[parsed].toString();
        else {
          keywordcount++;
          keywords[parsed] = keywordcount;
          return keywords[parsed].toString();
        }
      },
      keywordOnly(parsed) {
        if (keywordonlys.hasOwnProperty(parsed))
          return keywordonlys[parsed];
        else {
          keywordonlys[parsed] = crc32(parsed);
          return keywordonlys[parsed];
        }
      },
      Safe(str) {
        if (!str) return '';
        return str;
      },
      SafeBool(str) {
        if (!str) return 'false';
        return str.Bool();
      },
      replaceParentheses(str) {
        if (!str) return;
        if (str.startsWith('(') && str.endsWith(')')) str = str.slice(1, -1);
        return str;
      }
    }
    const inputscompiles = {
      sensing_answer: rscStorage?.project?.UnuseTokio ?
        (args) => {
          Tools.setstruct([['sensing_answer', "String", `String::new()`]]);
          return new TypeInput.Stri('&self.sensing_answer.clone()');
        } :
        (args) => {
          Tools.setstruct([['sensing_answer', "Mutex<String>", `Mutex::new(String::new())`]]);
          return new TypeInput.Stri('&self.sensing_answer.lock().unwrap().clone()');
        },
      'operator_equals'(args) {
        return new TypeInput.Bool('(' + args.OPERAND1.Stri() + '==' + args.OPERAND2.Stri() + ')');
      },
      'operator_subtract'(args) {
        return new TypeInput.Num('(' + args.NUM1.Num() + '-' + args.NUM2.Num() + ')');
      },
      'operator_add'(args) {
        return new TypeInput.Num('(' + args.NUM1.Num() + '+' + args.NUM2.Num() + ')');
      },
      'operator_divide'(args) {
        return new TypeInput.Num('(' + args.NUM1.Num() + '/' + args.NUM2.Num() + ')');
      },
      'operator_multiply'(args) {
        return new TypeInput.Num('(' + args.NUM1.Num() + '*' + args.NUM2.Num() + ')');
      },
      'operator_join'(args) {
        return new TypeInput.Stri('(' + args.STRING1.Stu() + '.to_owned()+&' + args.STRING2.Stu() + '.to_owned())');
      },
      'operator_random'(args) {
        Tools.setdepend(['rand = "0.8"']);
        Tools.setlibrary(['use rand::Rng;']);
        Tools.setruntime([[`fn operator_random(num1: f64, num2: f64) -> f64 {`,
          `let mut rng = rand::thread_rng();`,
          `let are_both_integers = num1.fract() == 0.0 && num2.fract() == 0.0;`,
          `if are_both_integers {`,
          `let start = num1 as i64;`,
          `let end = num2 as i64;`,
          `if start > end {`,
          `return rng.gen_range(end..=start) as f64;`,
          `} else {`,
          `return rng.gen_range(start..=end) as f64;`,
          `}`,
          `} else {`,
          `if rng.gen_bool(0.5) {`,
          `return num1;`,
          `} else {`,
          `return num2;`,
          `}`,
          `}`,
          `}`].join('\n')])
        return new TypeInput.Num('operator_random(' + args.FROM.Num() + ',' + args.TO.Num() + ')');
      },
      'operator_gt'(args) {
        return new TypeInput.Bool('(' + args.OPERAND1.Num() + '>' + args.OPERAND2.Num() + ')');
      },
      'operator_lt'(args) {
        return new TypeInput.Bool('(' + args.OPERAND1.Num() + '<' + args.OPERAND2.Num() + ')');
      },
      'operator_and'(args) {
        return new TypeInput.Bool('(' + Cast.SafeBool(args.OPERAND1) + '&&' + Cast.SafeBool(args.OPERAND2) + ')');
      },
      'operator_or'(args) {
        return new TypeInput.Bool('(' + Cast.SafeBool(args.OPERAND1) + '||' + Cast.SafeBool(args.OPERAND2) + ')');
      },
      'operator_not'(args) {
        return new TypeInput.Bool('!(' + Cast.SafeBool(args.OPERAND) + ')');
      },
      'sensing_timer'(args) {
        return new TypeInput.Num('timer.get_timer()');
      },
      'argument_reporter_string_number'(args) {
        if (args.scope.block.shadow == true) {
          proctypelist.push('&str');
          return 'pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]);
        }
        procUsingArgList.push('pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]));
        return new TypeInput.Str('pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]));
      },
      'argument_reporter_boolean'(args) {
        if (args.scope.block.shadow == true) {
          proctypelist.push('bool');
          return 'pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]);
        }
        procUsingArgList.push('pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]));
        return new TypeInput.Bool('pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]));
      },
      'procedures_prototype'(args) {
        procnamelist.push(args.scope.block.mutation.proccode);
        const protos = args;
        delete protos.scope;
        class protoType {
          constructor(input) {
            this.input = input;
            this.type = 'protoType';
          }
          protoType() {
            return this.input;
          }
        }
        return new protoType(protos);
      },
      'data_itemoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        Tools.setfunc([[`fn get_item_${name}(&self,item: usize) -> String{`,
        `if let Some(value) = ${listin}.get(item) {`,
          `value.to_string()`,
          `} else {`,
          `String::new()`,
          `}`,
          `}`
        ].join('\n')]);
        return new TypeInput.Stri(`self.get_item_${name}(if let Some(result) = ${args.INDEX == '"last"' ?
          `${listin}.len()` : '(' + args.INDEX.Usize()}).checked_sub(1) {result} else {0})`);
      },
      'data_itemnumoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        Tools.setfunc([[`fn get_position_${name}(&self,value_to_find: &str) -> f64{`,
        `if let Some(position) = ${listin}.iter().position(|x| x == &value_to_find) {`,
          `position as f64 + 1.0`,
          `} else {`,
          `0.0`,
          `}`,
          `}`].join('\n')]);
        return new TypeInput.Num(`self.get_position_${name}(${args.ITEM.Str()})`);
      },
      'data_lengthoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        Tools.setfunc([[`fn get_leng_${name}(&self) -> f64{`,
        `${listin}.len() as f64`,
          `}`].join('\n')]);
        return new TypeInput.Num(`self.get_leng_${name}()`);
      },
      'data_listcontainsitem'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        Tools.setfunc([[`fn get_contains_${name}(&self,item: String) -> bool{`,
        `${listin}.contains(&item)`,
          `}`].join('\n')]);
        return new TypeInput.Bool(`self.get_contains_${name}(${args.ITEM.Stri()})`);
      },
      'control_create_clone_of_menu'(args) {
        return args.scope.block.fields.CLONE_OPTION[0];
      },
      'control_run_as_sprite_menu'(args) {
        return args.scope.block.fields.RUN_AS_OPTION[0];
      },
      'operator_contains'(args) {
        return new TypeInput.Bool(`${args.STRING1.Stu()}.contains(&${args.STRING2.Stu()})`);
      },
      'operator_letter_of'(args) {
        Tools.setruntime([
          `fn get_char_at<T: AsRef<str>>(s: T, index: f64) -> String {\ns.as_ref().chars().nth((index - 1.0) as usize).map(|c| c.to_string()).unwrap_or_default()\n}`
        ])
        return new TypeInput.Stri(`get_char_at(${args.STRING.Stu()},${args.LETTER.Num()})`);
      },
      'operator_length'(args) {
        return new TypeInput.Num(`${args.STRING.Stu()}.chars().count() as f64`);
      },
      'operator_mod'(args) {
        return new TypeInput.Num('(' + args.NUM1.Num() + '%' + args.NUM2.Num() + ')');
      },
      'operator_round'(args) {
        Tools.setruntime([`fn numround(s: f64) -> f64 {\ns.round()\n}`
        ])
        return new TypeInput.Num(`numround(${args.NUM.Num()})`);
      },
      'operator_mathop'(args) {
        if (args.scope.block.fields.OPERATOR[0] == 'abs') {
          Tools.setruntime([`fn numabs(s: f64) -> f64 {\ns.abs()\n}`
          ])
          return new TypeInput.Num(`numabs(${args.NUM.Num()})`);
        }
      },
      'rsc_user'(args) {
        const name = args.scope.block.fields.from[0];
        const hsm = args.scope.block.fields.hsm[0];
        const Args = Object.keys(args).filter(key => key.startsWith("ADD")).map(key => args[key].Stri());
        if (name != '') {
          const from = 'm_' + Cast.keywordunParse(name);
          Tools.setstruct([[from, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}`, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}::new()`]]);
          return new TypeInput.Stri(`self.${from}.procpub${Cast.keywordOnly(hsm)}(${Args.join(',')})`);
        }
        else return new TypeInput.Stri(`self.procpub${Cast.keywordOnly(hsm)}(${Args.join(',')})`);
      },
      'rsc_compilerversion'(args) {//编译器版本
        return new TypeInput.Num(new rsc().version());
      },
      'rsc_varget'(args) {
        class ScopeVar {
          constructor(input) {
            this.input = input;
            this.type = 'ScopeVar';
          }
          Num() {
            Tools.setruntime([
              `fn get_f64_string<T: AsRef<str>>(toget:T)->f64 {\nlet num:Result<f64, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0.0\n}\n}`
            ]);
            return `get_f64_string(_scopevar_${this.input})`;
          }
          Usize() {
            Tools.setruntime([
              `fn get_usize_string<T: AsRef<str>>(toget:T)->usize {\nlet num:Result<usize, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
            ]);
            return `get_usize_string(_scopevar_${this.input})`;
          }
          i32() {
            Tools.setruntime([
              `fn get_i32_string<T: AsRef<str>>(toget:T)->i32 {\nlet num:Result<i32, _> = toget.as_ref().parse();\nmatch num {\nOk(parsed_num) => parsed_num,\nErr(_) => 0\n}\n}`
            ]);
            return `get_i32_string(_scopevar_${this.input})`;
          }
          Str() {
            return `*_scopevar_${this.input}`;
          }
          Stri() {
            return `_scopevar_${this.input}`;
          }
          Stu() {
            return `_scopevar_${this.input}`;
          }
        }
        const varin = Cast.keywordunParse(args.scope.block.fields.HEADER[0]);
        return new ScopeVar(varin);
      },
      'rsc_typeas'(args) {
        const type = args.scope.block.fields.type[0];
        return new TypeInput[type](args.thing[type]());
      },
      'rsc_typeis'(args) {
        const type = args.scope.block.fields.type[0];
        return new TypeInput[type](args.thing.input);
      },
      'rsc_typechoose'(args) {
        const type = args.scope.block.fields.type[0];
        return new TypeInput.Bool(args.thing.type == type);
      },
      'rsc_typeof'(args) {
        return new TypeInput.Str(args.thing.type);
      },
      'procedures_call'(args) {
        var result = [];
        const inputs = { ...args };
        delete inputs.scope;
        delete inputs.compiler;
        var types = proctypelistbackup[procnamelist.indexOf(args.scope.block.mutation.proccode)];
        let i = -1;
        let funccount = 0;
        for (const key in inputs) {
          i++;
          if (inputs.hasOwnProperty(key)) {
            if (types[i] == 'F') {
              funccount++;
              inputs.compiler += `let func${funccount} = || {\n${inputs[key]}};\n`;
              result.push(`func${funccount}`);
            }
            else {
              result.push(types[i] == '&str' ? inputs[key].Str() : Cast.SafeBool(inputs[key]));
            }
          }
        }
        let procname = procparselist[procnamelist.indexOf(args.scope.block.mutation.proccode)];
        const ispubproc = procpublist.includes(procname);
        if (ispubproc) {
          procname = procpubrealnamelist[procpublist.indexOf(procname)];
        }
        return new TypeInput.Stri(`self.${procname}(${result.join(',')})${args.scope.block.mutation.hasOwnProperty('return') ? (args.scope.block.mutation.return == '1' ? '' : ';\n') : ';\n'}`);//aaa
      }
    }
    const compiles = {
      async 'event_whenflagclicked'(args) {
        flagcount++;
        starteventlist.push("flag" + flagcount);
        var comp = '';
        if (args.scope.block.next) {
          comp = await compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        if (rscStorage?.project?.UnuseTokio)
          args.compiler += `fn flag${flagcount}(${selfmut ? '&mut self' : '&self'}){${inuselist.length == 0 ? '' : '\n'}${inuselist.join('\n') + '\n'}`;
        else
          args.compiler += `async fn flag${flagcount}(${selfmut ? '&mut self' : '&self'}){${inuselist.length == 0 ? '' : '\n'}${inuselist.join('\n') + '\n'}`;
        if (comp != '') {
          args.compiler += comp;
        }
        args.compiler += '}\n';
        Tools.setfunc([args.compiler]);
        return args.compiler;
      },
      async 'procedures_definition'(args) {
        proccount++;
        hasreturn = false;
        rscfunc = '';
        let comp = '';
        procUsingArgList = [];
        if (args.scope.block.next) {
          comp = await compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        let block_opcodes = [];
        procparselist.push(`proc${proccount}`);
        proctypelistbackup.push(proctypelist);
        let i = -1;
        const custom_block = args.custom_block.protoType();//procedures_prototype
        Object.keys(custom_block).forEach(function (key) {
          i++;
          if (procUsingArgList.includes(custom_block[key]))
            block_opcodes.push(custom_block[key] + ': ' + proctypelist[i]);
          else
            block_opcodes.push('_' + custom_block[key] + ': ' + proctypelist[i]);
        })
        if (rscfunc) {
          procpublist.push(`proc${proccount}`);
          procpubrealnamelist.push(`procpub${rscfunc}`);
        }
        args.compiler += `${rscfunc ? `pub fn procpub${rscfunc}` : `fn proc${proccount}`}${hasCommandBlock ? '<F: Fn()>' : ''}(${selfmut ? '&mut self' : '&self'}${block_opcodes.length != '0' ? ',' : ''}${block_opcodes.join(',')})${hasreturn ? '->Arc<String>' : ''}{\n`;
        hasCommandBlock = false;
        args.compiler += comp;
        if (hasreturn) {
          Tools.setlibrary(['use std::sync::Arc;']);
          const lines = args.compiler.split('\n');
          if (lines[lines.length - 2].substring(0, 6) != 'return')
            args.compiler += 'Arc::new(String::new())\n';
          else {
            lines[lines.length - 2] = lines[lines.length - 2].substring(7, lines[lines.length - 2].length - 1);;
            args.compiler = lines.join('\n');
          }
        }
        args.compiler += '}\n';
        Tools.setfunc([args.compiler]);
        return args.compiler;
      },
      'procedures_return'(args) {
        args.compiler += 'return Arc::new(' + args.VALUE.Stri() + ');\n';
        hasreturn = true;
        return args.compiler;
      },
      'procedures_call'(args) {
        var result = [];
        const inputs = { ...args };
        delete inputs.scope;
        delete inputs.compiler;
        var types = proctypelistbackup[procnamelist.indexOf(args.scope.block.mutation.proccode)];
        let i = -1;
        let funccount = 0;
        for (const key in inputs) {
          i++;
          if (inputs.hasOwnProperty(key)) {
            if (types[i] == 'F') {
              funccount++;
              inputs.compiler += `let func${funccount} = || {\n${inputs[key]}};\n`;
              result.push(`func${funccount}`);
            }
            else {
              result.push(types[i] == '&str' ? inputs[key].Str() : Cast.SafeBool(inputs[key]));
            }
          }
        }
        let procname = procparselist[procnamelist.indexOf(args.scope.block.mutation.proccode)];
        const ispubproc = procpublist.includes(procname);
        if (ispubproc) {
          procname = procpubrealnamelist[procpublist.indexOf(procname)];
        }
        args.compiler += `self.${procname}(${result.join(',')})${args.scope.block.mutation.hasOwnProperty('return') ? (args.scope.block.mutation.return == '1' ? '' : ';\n') : ';\n'}`;
        return args.compiler;//aaa
      },
      async 'control_start_as_clone'(args) {
        clonecount++;
        var comp = '';
        clonevarlist = [];
        if (args.scope.block.next) {
          comp = await compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        if (!notRepeatCloneList.includes(args.scope.target.name)) {
          Tools.setdepend([`async-recursion = "1.0.5"`]);
          Tools.setlibrary(['use async_recursion::async_recursion;']);
          args.compiler += '#[async_recursion]\n';
        }
        args.compiler += `async fn _${targetID}_clone${clonecount}(){${inuselist.length == 0 ? '' : '\n'}${inuselist.join('\n') + '\n'}`;
        args.compiler += clonevarlist.length == 0 ? '' : clonevarlist.join('\n') + '\n';
        if (comp != '') {
          args.compiler += comp;
        }
        args.compiler += '}\n';
        out += args.compiler;
        return args.compiler;
      },
      'control_create_clone_of'(args) {
        var fn = '';
        let foreachlist = [];
        if (args.CLONE_OPTION == '_myself_') {
          foreachlist = clones[targetID];
        }
        else {
          const specifiedName = args.CLONE_OPTION;
          let specifiedIndex = -1;
          const find = jsonData.targets;
          find.forEach((item, index) => {
            if (item.name === specifiedName) {
              specifiedIndex = index;
            }
          });
          foreachlist = clones[specifiedIndex];
        }
        if (foreachlist) {
          foreachlist.forEach(function (info) {
            fn += `tokio::spawn(${info}());\n`;
          });
        }
        args.compiler += fn;
        return args.compiler;
      },
      'control_delete_this_clone'(args) {
        args.compiler += 'return;\n'
        return args.compiler;
      },
      'control_forever'(args) {
        args.compiler += 'loop {\n';
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '}\n';
        return args.compiler;
      },
      'control_break'(args) {
        args.compiler += 'break;';
        return args.compiler;
      },
      'control_repeat'(args) {
        args.compiler += `let repeatto = ${args.TIMES.Usize()};\n`;
        args.compiler += `for _ in 0..repeatto{\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '}\n';
        return args.compiler;
      },
      'control_for_each'(args) {
        foreachcount++;
        const varin = Cast.keywordunParse(args.scope.block.fields.VARIABLE[0]);
        const numvar = getvar(varin, args.scope.block.fields.VARIABLE[1]).num();
        const strvar = getvar(varin, args.scope.block.fields.VARIABLE[1]).str();
        args.compiler += `let foreachvarnum${foreachcount} = ${numvar};\n`;
        args.compiler += `let foreachvarstr${foreachcount} = (${strvar}).clone();\n`;
        args.compiler += `${strvar} = String::from("0");\n`;
        args.compiler += `${numvar} = 0.0;\n`;
        args.compiler += `let foreachto${foreachcount} = ${args.VALUE.Usize()};\n`;
        args.compiler += `let mut foreachnum${foreachcount} = 1;\n`;
        args.compiler += `while foreachnum${foreachcount} <= foreachto${foreachcount} {\n`;
        args.compiler += `${numvar} = foreachnum${foreachcount} as f64;\n`;
        args.compiler += `${strvar} = foreachnum${foreachcount}.to_string();\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += `foreachnum${foreachcount} += 1;\n`;
        args.compiler += '}\n';
        args.compiler += `${numvar} = foreachvarnum${foreachcount};\n`;
        args.compiler += `${strvar} = foreachvarstr${foreachcount};\n`;
        return args.compiler;
      },
      'control_if'(args) {
        args.compiler += `if ${Cast.SafeBool(args.CONDITION)}{\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '};\n';
        return args.compiler;
      },
      'control_if_else'(args) {
        args.compiler += `if ${Cast.SafeBool(args.CONDITION)}{\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '}\n';
        args.compiler += 'else {\n';
        args.compiler += Cast.Safe(args.SUBSTACK2);
        args.compiler += '};\n'
        return args.compiler;
      },
      'control_while'(args) {
        args.compiler += `while ${Cast.SafeBool(args.CONDITION)}{\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '};\n'
        return args.compiler;
      },
      'control_wait_until'(args) {
        args.compiler += `while !(${Cast.SafeBool(args.CONDITION)}){};\n`;
        return args.compiler;
      },
      'control_repeat_until'(args) {
        args.compiler += `while !(${Cast.SafeBool(args.CONDITION)}){\n`;
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '};\n'
        return args.compiler;
      },
      'control_all_at_once'(args) {
        args.compiler += 'if true{\n';
        args.compiler += Cast.Safe(args.SUBSTACK);
        args.compiler += '}\n';
        return args.compiler;
      },
      sensing_askandwait: rscStorage?.project?.UnuseTokio ?
        (args) => {
          Tools.setlibrary(['use std::io;', 'use std::io::Write;']);
          Tools.setstruct([['sensing_answer', "String", `String::new()`]]);
          args.compiler += `print!("{}",${args.QUESTION.Stu()});\n`;
          args.compiler += `print!("\\n");\n`
          args.compiler += `io::stdout().flush().unwrap();\n`;
          args.compiler += `let mut sensing_answer = String::new();\n`;
          args.compiler += `io::stdin().read_line(&mut sensing_answer).unwrap();\n`;
          args.compiler += `self.sensing_answer = sensing_answer.trim().to_owned();\n`;
          if (rscStorage?.project?.UnuseTokio) selfmut = true;
          return args.compiler;
        } :
        (args) => {
          Tools.setlibrary(['use std::io;', 'use std::io::Write;', 'use std::sync::Mutex;']);
          Tools.setstruct([['sensing_answer', "Mutex<String>", `Mutex::new(String::new())`]]);
          args.compiler += `print!("{}",${args.QUESTION.Stu()});\n`;
          args.compiler += `print!("\\n");\n`
          args.compiler += `io::stdout().flush().unwrap();\n`;
          args.compiler += `let mut sensing_answer = String::new();\n`;
          args.compiler += `io::stdin().read_line(&mut sensing_answer).unwrap();\n`;
          args.compiler += `*self.sensing_answer.lock().unwrap() = sensing_answer.trim().to_owned();\n`;
          return args.compiler;
        },
      'looks_say'(args) {
        args.compiler += `println!("{}",${args.MESSAGE.Stu()});\n`;
        return args.compiler;
      },
      'looks_think'(args) {
        args.compiler += `println!("{}",${args.MESSAGE.Stu()});\n`;
        return args.compiler;
      },
      'control_wait'(args) {
        Tools.setlibrary(['use std::thread;', 'use std::time::Duration;']);
        args.compiler += `thread::sleep(Duration::from_secs_f64(${args.DURATION.Num()}));\n`
        return args.compiler;
      },
      'sensing_resettimer'(args) {
        Tools.setlibrary(['use std::time::Duration;', 'use tokio::time::Instant;']);
        Tools.setruntime([[`struct Timer {`,
          `start_time: Instant,`,
          `}`,
          `impl Timer {`,
          `fn new() -> Timer {`,
          `let start_time = Instant::now();`,
          `Timer { start_time }`,
          `}`,
          `fn get_timer(mut self) -> f64 {`,
          `let current_time = Instant::now();`,
          `let elapsed_time = current_time.duration_since(self.start_time);`,
          `let seconds_with_fraction = elapsed_time.as_secs_f64();`,
          `seconds_with_fraction`,
          `}\n}`].join('\n')]);
        Tools.setinuse([`let mut timer = Timer::new();`]);
        args.compiler += `timer = Timer::new();\n`;
        return args.compiler;
      },
      'data_setvariableto'(args) {
        const varin = Cast.keywordunParse(args.scope.block.fields.VARIABLE[0]);
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).num()} = ${args.VALUE.Num()};\n`;
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).str()} = ${args.VALUE.Stri()};\n`;
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_changevariableby'(args) {
        const varin = Cast.keywordunParse(args.scope.block.fields.VARIABLE[0]);
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).num()} += ${args.VALUE.Num()};\n`;
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).str()} = (${getvar(varin, args.scope.block.fields.VARIABLE[1]).num()}).to_string();\n`;
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_addtolist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let addin = ${args.ITEM.Stri()};\n`
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.push(addin);\n`;
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_deletealloflist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.clear();\n`;
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_deleteoflist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        const removein = args.INDEX == '"last"' ?
          `(${getlist(listin, args.scope.block.fields.LIST[1])}.len() as i32 - 1) as usize` : '(' + args.INDEX.i32() + ' - 1) as usize';
        args.compiler += `let removein = ${removein};\n`;
        args.compiler += `if removein != usize::MAX {\n`;
        args.compiler += `if removein < ${getlist(listin, args.scope.block.fields.LIST[1])}.len() {\n${getlist(listin, args.scope.block.fields.LIST[1])}.remove(removein);\n}\n`;
        args.compiler += '}\n';
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_insertatlist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let insertin = ${args.ITEM.Stri()};\n`
        args.compiler += `let insertin2 = ${args.INDEX.input == '"last"' ?
          `(${getlist(listin, args.scope.block.fields.LIST[1])}.len() as i32 - 1) as usize` : '(' + args.INDEX.i32() + ' - 1) as usize'};\n`;
        args.compiler += `if insertin2 != usize::MAX {\n`;
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.insert(insertin2,insertin);\n`;
        args.compiler += '}\n';
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'data_replaceitemoflist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let getin = ${args.INDEX == '"last"' ?
          `(${getlist(listin, args.scope.block.fields.LIST[1])}.len() as i32 - 1) as usize` : '(' + args.INDEX.i32() + ' - 1) as usize'};\n`;
        args.compiler += `let itemin = ${args.ITEM.Str()};\n`;
        args.compiler += `if getin != usize::MAX {\n`;
        args.compiler += `if let Some(item) = ${getlist(listin, args.scope.block.fields.LIST[1])}.get_mut(getin) {\n`;
        args.compiler += `*item = itemin.to_owned();\n`;
        args.compiler += `};\n`;
        args.compiler += `};\n`;
        if (rscStorage?.project?.UnuseTokio) selfmut = true;
        return args.compiler;
      },
      'control_stop'(args) {
        switch (args.scope.block.fields.STOP_OPTION[0]) {
          case 'all': {
            Tools.setlibrary(['use std::process;']);
            args.compiler += 'process::exit(0);\n';
            return args.compiler;
          }
          case 'this script': {
            args.compiler += 'return;\n';
            return args.compiler;
          }
          case 'other scripts in sprite': {
            Tools.setlibrary(['use std::process;']);
            args.compiler += 'process::exit(0);\n';
            return args.compiler;
          }
        }
        return args.compiler;
      },
      'control_run_as_sprite'(args) {
        args.compiler += Cast.Safe(args.SUBSTACK);
        return args.compiler;
      },
      'event_broadcast'(args) {
        if (!broadcastfuncs.hasOwnProperty(args.BROADCAST_INPUT))
          return args.compiler;
        const broadcastlist = broadcastfuncs[args.BROADCAST_INPUT];
        let broadcastin = '';
        broadcastlist.map(item => {
          broadcastin += 'tokio::spawn(async move {\n' + item + '});\n';
        });
        args.compiler += broadcastin;
        return args.compiler;
      },
      'event_broadcastandwait'(args) {
        if (!broadcastfuncs.hasOwnProperty(args.BROADCAST_INPUT))
          return args.compiler;
        const broadcastlist = broadcastfuncs[args.BROADCAST_INPUT];
        let broadcastin = [];
        broadcastlist.map(item => {
          broadcastin.push(`tokio::spawn(async move {\n` + item + '})\n');
        });
        args.compiler += `tokio::try_join!(${broadcastin.join(',')}).unwrap();`;
        return args.compiler;
      },
      async 'event_whenbroadcastreceived'(args) {
        var comp = '';
        const blockb = args.scope.block;
        if (args.scope.block.next) {
          comp = await compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
          if (broadcastfuncs.hasOwnProperty(Cast.unParse(blockb.fields.BROADCAST_OPTION[0])))
            broadcastfuncs[Cast.unParse(blockb.fields.BROADCAST_OPTION[0])].push(comp);
          else
            broadcastfuncs[Cast.unParse(blockb.fields.BROADCAST_OPTION[0])] = [comp]
        }
        return args.compiler;
      },
      async 'event_whenkeypressed'(args) {
        presscount++;
        var comp = '';
        var pressing = Cast.toPress(args.scope.block.fields.KEY_OPTION[0], args.scope.block);
        Tools.setlibrary(['use crossterm::event::{self, Event, KeyCode};']);
        Tools.setdepend(['crossterm = "0.27.0"']);
        if (args.scope.block.next) {
          comp = await compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        args.compiler += `async fn press${presscount}(){\n`;
        args.compiler += [`loop {`,
          `if event::poll(std::time::Duration::from_millis(1)).unwrap() {`,
          `if let Event::Key(event) = event::read().unwrap() {`,
          `match event.code {`,
          `KeyCode::${pressing} => {`,
          `${comp}},`,
          `_ => (),`,
          `},`,
          `},`,
          `},`,
          `},`,
          `}\n`].join('\n');
        Tools.setmain([`tokio::spawn(press${presscount}());`]);
        out += args.compiler;
        return args.compiler;
      },
      'rsc_outcompiler'(args) {
        args.compiler += args.scope.block.fields.HEADER[0];
        return args.compiler;
      },
      'rsc_outcompilerr'(args) {
        args.compiler += args.scope.block.fields.HEADER[0];
        return args.compiler;
      },
      'rsc_outcompileb'(args) {
        args.compiler += args.scope.block.fields.HEADER[0];
        return args.compiler;
      },
      'rsc_cloneandwait'(args) {
        var fn = '';
        let foreachlist = [];
        if (args.CLONE_OPTION == '_myself_') {
          foreachlist = clones[targetID];
        }
        else {
          const specifiedName = args.CLONE_OPTION;
          let specifiedIndex = -1;
          const find = jsonData.targets;
          find.forEach((item, index) => {
            if (item.name === specifiedName) {
              specifiedIndex = index;
            }
          });
          foreachlist = clones[specifiedIndex];
        }
        if (foreachlist) {
          foreachlist.forEach(function (info) {
            fn += `${info}().await;\n`;
          });
        }
        args.compiler += fn;
        return args.compiler;
      },
      'rsc_flaguse'(args){
        const name = args.scope.block.fields.from[0];
        if (name != '') {
          const from = 'm_' + Cast.keywordunParse(name);
          Tools.setstruct([[from, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}`, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}::new()`]]);
          args.compiler += `self.${from}.runflag();\n`;
        }
        else args.compiler += `self.runflag();\n`;
        return args.compiler;
      },
      rsc_import: isLocal ? async (args) => {
        const mod = args.scope.block.fields.HEADER[0];
        async function getSb3(data) {
          try {
            const zip = new JSZip();
            await zip.loadAsync(data);

            const projectJson = await zip.file('project.json').async("string");
            if (!projectJson) {
              throw new Error('不是有效的Scratch项目文件');
            }
            return JSON.parse(projectJson);
          } catch (error) {
            throw error;
          }
        }
        function pathtoMod(pathto) {
          if (pathto.startsWith('./')) {
            return pathto.slice(2, pathto.length).replace('/', '::');
          }
          if (pathto.startsWith('.') || pathto.endsWith('/') || pathto.endsWith('.sb3') || pathto.endsWith('.rs') || pathto.endsWith('.json') || pathto.endsWith('.js'))
            throw new Error('引入地址错误');
          let before = pathto.substring(0, pathto.indexOf('/'));
          before = 'super::'.repeat(before.split('.').length - 2);
          let after = pathto.substring(pathto.indexOf('/') + 1);
          after = after.replace('/', '::');
          const final = before + after;
          Tools.setreq([final.slice(7, final.length)]);
          return final;
        }
        function syncfetch(url, type) {
          var request = new XMLHttpRequest();
          request.open("GET", url, false);
          request.responseType = type;
          request.send(null);
          if (request.status === 200) {
            return request.responseText;
          }
          console.log(request);
          throw new Error('获取远程组件失败');
        }
        async function requireMod(name, type, from) {
          const modpath = pathtoMod(name);
          const filePath = name + type;
          Tools.setlibrary([`mod ${modpath};`]);
          Tools.setlibrary([`use ${modpath}::Default as md_${Cast.keywordunParse(name)};`]);
          const jsondata = from == 'local' ?
            type == '.sb3' ? await getSb3(fs.readFileSync(filePath)) : fs.readFileSync(filePath, 'utf-8') :
            type == '.sb3' ? await getSb3(syncfetch(filePath, 'arraybuffer')) : syncfetch(filePath, 'text');
          const { deplist, globalextrablocks, reqlist } = new rsc().compile(jsondata, folderPath, path.parse(filePath).name, iflog);
          let toreq = [];
          reqlist.forEach(item => { if (item.startsWith('super::')) toreq.push(item.slice(7, item.length)) });
          Tools.setreq(toreq);
          Tools.setlibrary(reqlist);
          Tools.setextrablockcompile(globalextrablocks);
          Tools.setdepend(deplist);
        }
        function requireJs(name, from) {
          const register = (ext) => {
            if ((!ext.blocks || !ext.id) || !ext.getInfo)
              return;
            if ((!ext.blocks || !ext.id)) {
              const { id, blocks } = ext.getInfo();
              ext = { ...ext, id, blocks };
            }
            ext.blocks.forEach(block => {
              if (block.blockType != 'u') {
                const func = ext[block.opcode];
                const opcode = ext.id + '_' + block.opcode;
                const type = block.blockType;
                const startornot = block.blockStart;
                extrablocks.push(opcode);
                if (block.isOperator) {
                  operatorlist.push(opcode);
                }
                switch (type) {
                  case 'm': {
                    compiles[opcode] = func;
                    break;
                  }
                  case 'r': {
                    inputscompiles[opcode] = func;
                    inputlist.push(opcode);
                    break;
                  }
                }
                if (startornot)
                  compileEvents.push(opcode);
              }
            });
          }
          const BlockType = {
            COMMAND: 'm',
            CONDITIONAL: 'm',
            LOOP: 'm',
            HAT: 'm',
            REPORTER: 'r',
            BOOLEAN: 'r',
            LABEL: 'u',
            XML: 'u',
            BUTTON: 'u'
          };
          const extensions = { register };
          const isCompiler = true;
          const ext = new Function(from == 'local' ? fs.readFileSync(name + '.js').toString() : syncfetch(name, 'text'));
          const ThrowError = (err) => {
            throw new Error(err)
          }
          if (rscStorage?.config?.AllowThis)
            ext.call({ rsc: this, fs, JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
          else
            ext.call({ JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
        }
        async function requireLibs(name) {
          if (name.startsWith('.')) {
            if (fs.existsSync(name + '.json')) {
              await requireMod(name, '.json', 'local');
            }
            else if (fs.existsSync(name + '.sb3')) {
              await requireMod(name, '.sb3', 'local');
            }
            else if (fs.existsSync(name + '.js')) {
              requireJs(name, 'local');
            }
          }
          else {
            if (name.startsWith('https://') || name.startsWith('http://')) {
              if (name.endsWith('.json')) {
                await requireMod(name, 'web');
              }
              else if (name.endsWith('.sb3')) {
                await requireMod(name, 'web');
              }
              else if (name.endsWith('.js')) {
                requireJs(name, 'web');
              }
            }
          }
        }
        requireLibs(mod);
        return args.compiler;
      } : async () => {
        const mod = args.scope.block.fields.HEADER[0];
        async function getSb3(data) {
          try {
            const zip = new JSZip();
            await zip.loadAsync(data);

            const projectJson = await zip.file('project.json').async("string");
            if (!projectJson) {
              throw new Error('不是有效的Scratch项目文件');
            }
            return JSON.parse(projectJson);
          } catch (error) {
            throw error;
          }
        }
        function pathtoMod(pathto) {
          if (pathto.startsWith('./')) {
            return pathto.slice(2, pathto.length).replace('/', '::');
          }
          if (pathto.startsWith('.') || pathto.endsWith('/') || pathto.endsWith('.sb3') || pathto.endsWith('.rs') || pathto.endsWith('.json') || pathto.endsWith('.js'))
            throw new Error('引入地址错误');
          let before = pathto.substring(0, pathto.indexOf('/'));
          before = 'super::'.repeat(before.split('.').length - 2);
          let after = pathto.substring(pathto.indexOf('/') + 1);
          after = after.replace('/', '::');
          const final = before + after;
          Tools.setreq([final.slice(7, final.length)]);
          return final;
        }
        function syncfetch(url, type) {
          var request = new XMLHttpRequest();
          request.open("GET", url, false);
          request.responseType = type;
          request.send(null);
          if (request.status === 200) {
            return request.responseText;
          }
          console.log(request);
          throw new Error('获取远程组件失败');
        }
        async function requireMod(name, type) {
          const modpath = pathtoMod(name);
          const filePath = name + type;
          Tools.setlibrary([`mod ${modpath};`]);
          Tools.setlibrary([`use ${modpath}::Default as md_${Cast.keywordunParse(name)};`]);
          const jsondata = type == '.sb3' ? await getSb3(syncfetch(filePath, 'arraybuffer')) : syncfetch(filePath, 'text');
          const { deplist, globalextrablocks, reqlist } = new rsc().compile(jsondata, folderPath, path.parse(filePath).name, iflog);
          let toreq = [];
          reqlist.forEach(item => { if (item.startsWith('super::')) toreq.push(item.slice(7, item.length)) });
          Tools.setreq(toreq);
          Tools.setlibrary(reqlist);
          Tools.setextrablockcompile(globalextrablocks);
          Tools.setdepend(deplist);
        }
        function requireJs(name) {
          const register = (ext) => {
            if ((!ext.blocks || !ext.id) || !ext.getInfo)
              return;
            if ((!ext.blocks || !ext.id)) {
              const { id, blocks } = ext.getInfo();
              ext = { ...ext, id, blocks };
            }
            ext.blocks.forEach(block => {
              if (block.blockType != 'u') {
                const func = ext[block.opcode];
                const opcode = ext.id + '_' + block.opcode;
                const type = block.blockType;
                const startornot = block.blockStart;
                extrablocks.push(opcode);
                if (block.isOperator) {
                  operatorlist.push(opcode);
                }
                switch (type) {
                  case 'm': {
                    compiles[opcode] = func;
                    break;
                  }
                  case 'r': {
                    inputscompiles[opcode] = func;
                    inputlist.push(opcode);
                    break;
                  }
                }
                if (startornot)
                  compileEvents.push(opcode);
              }
            });
          }
          const BlockType = {
            COMMAND: 'm',
            CONDITIONAL: 'm',
            LOOP: 'm',
            HAT: 'm',
            REPORTER: 'r',
            BOOLEAN: 'r',
            LABEL: 'u',
            XML: 'u',
            BUTTON: 'u'
          };
          const extensions = { register };
          const isCompiler = true;
          const ext = new Function(syncfetch(name, 'text'));
          const ThrowError = (err) => {
            throw new Error(err)
          }
          if (rscStorage?.config?.AllowThis)
            ext.call({ rsc: this, fs, JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
          else
            ext.call({ JSZip, path, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
        }
        if (mod.startsWith('https://') || mod.startsWith('http://')) {
          if (mod.endsWith('.json')) {
            await requireMod(mod, '.json');
          }
          else if (mod.endsWith('.sb3')) {
            await requireMod(mod, '.sb3');
          }
          else if (mod.endsWith('.js')) {
            requireJs(mod);
          }
        }
        return args.compiler;
      },
      'rsc_func'(args) {
        rscfunc = Cast.keywordOnly(args.scope.block.fields.HEADER[0]);
        haverscfunc = true;
        return args.compiler;
      },
      'rsc_use'(args) {
        const name = args.scope.block.fields.from[0];
        const hsm = args.scope.block.fields.hsm[0];
        const Args = Object.keys(args).filter(key => key.startsWith("ADD")).map(key => args[key].Stri());
        if (name != '') {
          const from = 'm_' + Cast.keywordunParse(name);
          Tools.setstruct([[from, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}`, `md_${Cast.keywordunParse(args.scope.block.fields.from[0])}::new()`]]);
          args.compiler += `self.${from}.procpub${Cast.keywordOnly(hsm)}(${Args.join(',')});\n`;
        }
        else args.compiler += `self.procpub${Cast.keywordOnly(hsm)}(${Args.join(',')});\n`;
        return args.compiler;
      },
      'rsc_setmain'(args) {
        mainlist.push(args.SUBSTACK);
        return args.compiler;
      },
      'rsc_setruntime'(args) {
        runtimelist.push(args.SUBSTACK);
        return args.compiler;
      },
      'rsc_setinuse'(args) {
        inuselist.push(args.SUBSTACK);
        return args.compiler;
      },
      'rsc_setdepend'(args) {
        Tools.setdepend([args.scope.block.fields.HEADER[0]]);
        return args.compiler;
      },
      'rsc_setlibrary'(args) {
        Tools.setlibrary([args.scope.block.fields.HEADER[0]]);
        return args.compiler;
      },
      'rsc_varcreate'(args) {
        const varin = Cast.keywordunParse(args.scope.block.fields.HEADER[0]);
        args.compiler += `let mut _scopevar_${varin} = String::new();\n`;
        return args.compiler;
      },
      'rsc_varset'(args) {
        const varin = Cast.keywordunParse(args.scope.block.fields.HEADER[0]);
        args.compiler += `_scopevar_${varin} = ${args.thing.Stri()};\n`;
        return args.compiler;
      },
      'rsc_ignore'(args) {
        ignore = false;
        return args.compiler;
      },
      'argument_command'(args) {
        if (args.scope.block.shadow == true) {
          proctypelist.push('F');
          hasCommandBlock = true;
          return 'pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]);
        }
        return 'pm_' + Cast.keywordunParse(args.scope.block.fields.VALUE[0]) + '();\n';
      }
    }
    if (rscStorage?.config?.RunAtCompile)
      compiles.rsc_compile = function (args) {
        eval(args.scope.block.fields.HEADER[0]);
        return args.compiler;
      }

    //入口
    find_vars();
    find_clones();
    for (const target of jsonData.targets) {
      targetID++;
      if (target.blocks) {
        await start_compile_from_events(target);
      }
    }
    out += compile_main();
    if (runtimelist.length != 0) {
      out = runtimelist.join('\n') + '\n' + out;
    }
    if (uselist.length != 0) {
      out = uselist.join('\n') + '\n' + out;
    }
    find_diagnosis();
    function find_diagnosis() {
      const usingvarids = Object.keys(usingvars);
      const usingvarnames = Object.values(usingvars);
      usingvarids.forEach((id, item) => {
        if (!usedvars.includes(id)) diagnosis += `🤔 不存在${usingvarnames[item]}的使用, 请手动删除此${id[0] == 'l' ? '列表' : '变量'}\n`;
      });
    }
    function getlist(listname, listid) {
      if (rscStorage?.project?.UnuseTokio) {
        if (nogloballistids.includes(listid)) {
          if (isclone) {
            Tools.setclonevar([`let mut cl_${listname} = self.l_${targetID}_${listname};`]);
            usedvars.push(`l_${targetID}_${listname}`);
            return `cl_${listname}`;
          }
          else {
            usedvars.push(`l_${targetID}_${listname}`);
            return `self.l_${targetID}_${listname}`;
          }
        }
        else {
          usedvars.push(`l_${listname}`);
          return `self.l_${listname}`;
        }
      }
      if (nogloballistids.includes(listid)) {
        if (isclone) {
          Tools.setclonevar([`let mut cl_${listname} = self.l_${targetID}_${listname}.lock().unwrap();`]);
          usedvars.push(`l_${targetID}_${listname}`);
          return `cl_${listname}`;
        }
        else {
          usedvars.push(`l_${targetID}_${listname}`);
          return `self.l_${targetID}_${listname}.lock().unwrap()`;
        }
      }
      else {
        usedvars.push(`l_${listname}`);
        return `self.l_${listname}.lock().unwrap()`;
      }
    }
    function getvar(varname, varid) {
      if (rscStorage?.project?.UnuseTokio) {
        if (noglobalvarids.includes(varid)) {
          if (isclone) {
            Tools.setclonevar([`let mut cv_str_${varname} = self.vs_${targetID}_${varname};`, `let mut cv_num_${varname} = *self.vf_${targetID}_${varname};`]);
            return {
              str: () => {
                usedvars.push(`vs_${targetID}_${varname}`);
                return `cv_str_${varname}`
              },
              num: () => {
                usedvars.push(`vf_${targetID}_${varname}`);
                return `cv_num_${varname}`
              }
            };
          }
          else {
            return {
              str: () => {
                usedvars.push(`vs_${targetID}_${varname}`);
                return `self.vs_${targetID}_${varname}`
              },
              num: () => {
                usedvars.push(`vf_${targetID}_${varname}`);
                return `self.vf_${targetID}_${varname}`
              }
            };
          }
        }
        else {
          return {
            str: () => {
              usedvars.push(`vs_${varname}`);
              return `self.vs_${varname}`
            },
            num: () => {
              usedvars.push(`vf_${varname}`);
              return `self.vf_${varname}`
            }
          };
        }
      }
      if (noglobalvarids.includes(varid)) {
        if (isclone) {
          Tools.setclonevar([`let mut cv_str_${varname} = self.vs_${targetID}_${varname}.lock().unwrap().clone();`, `let mut cv_num_${varname} = *self.vf_${targetID}_${varname}.lock().unwrap();`]);
          return {
            str: () => {
              usedvars.push(`vs_${targetID}_${varname}`);
              return `cv_str_${varname}`
            },
            num: () => {
              usedvars.push(`vf_${targetID}_${varname}`);
              return `cv_num_${varname}`
            }
          };
        }
        else {
          return {
            str: () => {
              usedvars.push(`vs_${targetID}_${varname}`);
              return `*self.vs_${targetID}_${varname}.lock().unwrap()`
            },
            num: () => {
              usedvars.push(`vf_${targetID}_${varname}`);
              return `*self.vf_${targetID}_${varname}.lock().unwrap()`
            }
          };
        }
      }
      else {
        return {
          str: () => {
            usedvars.push(`vs_${varname}`);
            return `*self.vs_${varname}.lock().unwrap()`
          },
          num: () => {
            usedvars.push(`vf_${varname}`);
            return `*self.vf_${varname}.lock().unwrap()`
          }
        };
      }
    }
    function compile_main() {
      var fn = `${haverscfunc ? 'pub ' : ''}struct Default{\n${structs.map(item => item[0] + ':' + item[1]).join(',\n') || ''}}\n`;
      fn += `impl Default{\n${haverscfunc ? 'pub ' : ''}fn new() -> Default{\nDefault{\n${structs.map(item => item[0] + ':' + item[2]).join(',\n') || ''}}\n}\n${funcs.join('\n')}`;
      haverscfunc ? fn += 'pub ' : fn += '';
      if (flagcount == 0) {
        fn += `fn runflag(){\n${mainlist.length == 0 ? '' : mainlist.join('\n')}}`;
      }
      else if (flagcount == 1) {
        if (rscStorage?.project?.UnuseTokio)
          fn += `fn runflag(){\nlet ${selfmut ? 'mut ' : ''}init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}init.flag1();\n}`;
        else {
          Tools.setdepend([`tokio = { version = "1", features = ["full"] }`]);
          fn += `async fn runflag(){\nlet ${selfmut ? 'mut ' : ''}init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}init.flag1().await;\n}`;
        }
      }
      else {
        if (rscStorage?.project?.UnuseTokio) {
          fn += `fn runflag(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}`;
          let i = -1;
          starteventlist.forEach(function (info) {
            i++;
            fn += `init.${info}();\n`;
          });
          fn += '}';
        }
        else {
          fn += `async fn runflag(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}`;
          let tasks = [];
          let i = -1;
          starteventlist.forEach(function (info) {
            i++;
            tasks.push('init.' + info + '()');
          });
          let task = tasks.join(',');
          fn += `tokio::join!(${task});\n`
          fn += '}';
        }
      }
      fn += '\n}\n';
      if (flagcount == 0) {
        fn += `fn main(){\n}`;
      }
      else if (flagcount == 1) {
        if (rscStorage?.project?.UnuseTokio)
          fn += `fn main(){\nDefault::runflag();\n}`;
        else {
          Tools.setdepend([`tokio = { version = "1", features = ["full"] }`]);
          fn += `#[tokio::main]\nasync fn main(){\nDefault::runflag().await;\n}`;
        }
      }
      return fn;
    }
    function find_vars() {
      const find = (element) => {
        const vars = jsonData.targets[element].variables;
        const lists = jsonData.targets[element].lists;
        if (JSON.stringify(vars) == '{}' && JSON.stringify(lists) == '{}') {
          return;
        }
        if (rscStorage?.project?.UnuseTokio) {
          for (const key in vars) {
            const variableRealname = vars[key][0];
            const variableName = Cast.keywordunParse(variableRealname);
            const variableContent = vars[key][1];
            if (element == 0) {
              if (typeof variableContent == 'number') {
                structs.push(['vf_' + variableName, 'f64', Cast.toNum(variableContent)]);
              }
              else {
                structs.push(['vf_' + variableName, 'f64', '0.0']);
              }
              structs.push(['vs_' + variableName, "String", `(${Cast.unParse(variableContent)}).to_string()`]);
              usingvars['vf_' + variableName] = variableRealname;
              usingvars['vs_' + variableName] = variableRealname;
              globalvarlist.push(variableName);
            }
            else {
              if (typeof variableContent == 'number') {
                structs.push(['vf_' + element + '_' + variableName, 'f64', Cast.toNum(variableContent)]);
              }
              else {
                structs.push(['vf_' + element + '_' + variableName, 'f64', '0.0']);
              }
              structs.push(['vs_' + element + '_' + variableName, "String", `(${Cast.unParse(variableContent)}).to_string()`]);
              usingvars['vf_' + element + '_' + variableName] = variableRealname;
              usingvars['vs_' + element + '_' + variableName] = variableRealname;
              noglobalvarids.push(key);
              noglobalvarlist.push(variableName);
            }
          }
          let listadds = [];
          for (const key in lists) {
            const listRealname = lists[key][0];
            const listName = Cast.keywordunParse(listRealname);
            const listContent = lists[key][1];
            let listfor = [];
            for (const keyin in listContent) {
              listfor.push(Cast.toStr(Cast.unParse(listContent[keyin])));
            }
            if (element == 0) {
              structs.push(['l_' + listName, "Vec<String>", listfor.length != 0 ? `[${listfor.join(',')}].iter().map(|s| s.to_string()).collect()` : 'vec![]']);
              usingvars['l_' + listName] = listRealname;
            }
            else {
              structs.push(['l_' + element + '_' + listName, "Vec<String>", listfor.length != 0 ? `[${listfor.join(',')}].iter().map(|s| s.to_string()).collect()` : 'vec![]']);
              usingvars['l_' + element + '_' + listName] = listRealname;
              nogloballistids.push(key);
              noglobalvarlist.push(listName);
            }
          }
          if (listadds.length != 0) Tools.setmain([listadds.join('\n')]);
        }
        else {
          Tools.setlibrary(['use std::sync::Mutex;']);
          for (const key in vars) {
            const variableRealname = vars[key][0];
            const variableName = Cast.keywordunParse(variableRealname);
            const variableContent = vars[key][1];
            if (element == 0) {
              if (typeof variableContent == 'number') {
                structs.push(['vf_' + variableName, 'Mutex<f64>', `Mutex::new(${Cast.toNum(variableContent)})`]);
              }
              else {
                structs.push(['vf_' + variableName, 'Mutex<f64>', 'Mutex::new(0.0)']);
              }
              structs.push(['vs_' + variableName, "Mutex<String>", `Mutex::new((${Cast.unParse(variableContent)}).to_string())`]);
              usingvars['vf_' + variableName] = variableRealname;
              usingvars['vs_' + variableName] = variableRealname;
              globalvarlist.push(variableName);
            }
            else {
              if (typeof variableContent == 'number') {
                structs.push(['vf_' + element + '_' + variableName, 'Mutex<f64>', `Mutex::new(${Cast.toNum(variableContent)})`]);
              }
              else {
                structs.push(['vf_' + element + '_' + variableName, 'Mutex<f64>', 'Mutex::new(0.0)']);
              }
              structs.push(['vs_' + element + '_' + variableName, "Mutex<String>", `Mutex::new((${Cast.unParse(variableContent)}).to_string())`]);
              usingvars['vf_' + element + '_' + variableName] = variableRealname;
              usingvars['vs_' + element + '_' + variableName] = variableRealname;
              noglobalvarids.push(key);
              noglobalvarlist.push(variableName);
            }
          }
          let listadds = [];
          for (const key in lists) {
            const listRealname = lists[key][0];
            const listName = Cast.keywordunParse(listRealname);
            const listContent = lists[key][1];
            let listfor = [];
            for (const keyin in listContent) {
              listfor.push(Cast.toStr(Cast.unParse(listContent[keyin])));
            }
            if (element == 0) {
              structs.push(['l_' + listName, "Mutex<Vec<String>>", `Mutex::new(${listfor.length != 0 ? `[${listfor.join(',')}].iter().map(|s| s.to_string()).collect()` : 'vec![]'})`]);
              usingvars['l_' + listName] = listRealname;
            }
            else {
              structs.push(['l_' + element + '_' + listName, "Mutex<Vec<String>>", `Mutex::new(${listfor.length != 0 ? `[${listfor.join(',')}].iter().map(|s| s.to_string()).collect()` : 'vec![]'})`]);
              usingvars['l_' + element + '_' + listName] = listRealname;
              nogloballistids.push(key);
              noglobalvarlist.push(listName);
            }
          }
          if (listadds.length != 0) Tools.setmain([listadds.join('\n')]);
        }
      }
      jsonData.targets.forEach((_, index) => {
        find(index);
      });
    }
    async function compile_input(block, target) {
      const jsonObj = block.inputs;
      const inputs = {};
      for (let key in jsonObj) {
        if (jsonObj.hasOwnProperty(key)) {
          if (typeof jsonObj[key][1] == 'object') {
            if (!jsonObj[key][1]) {
              if (key == 'CONDITION') {
                inputs[key] = 'false';
              }
              else {
                inputs[key] = '';
              }
            }
            else {
              const inputin = jsonObj[key][1][1];
              if (jsonObj[key][1].length == 3) {//变量
                if (jsonObj[key][1][0] == 11) {//广播
                  inputs[key] = new TypeInput.Str(Cast.unParse(inputin));
                }
                else {
                  const varin = Cast.keywordunParse(inputin);
                  inputs[key] = new TypeInput.Var(varin);
                }
              }
              else {
                if (Cast.NumTest(Cast.unParse(inputin)))
                  inputs[key] = new TypeInput.Num(Cast.toNum(inputin));
                else
                  inputs[key] = new TypeInput.Str(Cast.unParse(inputin));
              }
            }
          }
          else if (typeof jsonObj[key][1] == 'string') {
            const compblock = target.blocks[jsonObj[key][1]];
            if (compblock.opcode == 'procedures_call') {
              if (compblock.mutation.return) {
                const comped = await compile_input(compblock, target);
                inputs[key] = comped;
              }
              else {
                const comped = await compile_this(compblock, target);
                inputs[key] = comped;
              }
            }
            else
              if (inputlist.includes(compblock.opcode)) {
                if (operatorlist.includes(compblock.opcode) && !operatorlist.includes(block.opcode)) {
                  const compedToRemove = await compile_input(compblock, target);
                  if (typeof compedToRemove == 'object')
                    if (compedToRemove.hasOwnProperty('input'))
                      compedToRemove.input = Cast.replaceParentheses(compedToRemove.input);
                  var comped = compedToRemove;
                }
                else {
                  var comped = await compile_input(compblock, target);
                }
                inputs[key] = comped;
              }
              else {
                const comped = await compile_this(compblock, target);
                inputs[key] = comped;
              }
          }
        }
      }
      if (block.opcode == 'procedures_call') {
        if (block.mutation.return) {
          inputs.scope = { block, target };
          return await inputscompiles[block.opcode](inputs);
        }
        else {
          return inputs;
        }
      }
      else
        if (inputscompiles.hasOwnProperty(block.opcode)) {
          inputs.scope = { block, target };
          return await inputscompiles[block.opcode](inputs);
        }
      return inputs;
    }
    async function compile(block, target) {
      var compiler = '';
      if (!block) return '';
      if (block.opcode == 'rsc_ignore') {
        ignore = true;
      }
      if (JSON.stringify(block.inputs) != '{}') {
        switch (block.opcode) {
          case 'procedures_definition': {
            proctypelist = [];
            break;
          }
          case 'rsc_funcargin': {
            rscfuncargs = [];
            break;
          }
        }
        var inputs = await compile_input(block, target);
      }
      else {
        var inputs = {};
      }
      if (compiles.hasOwnProperty(block.opcode)) {
        inputs.scope = { block, target };
        inputs.compiler = compiler;
        compiler = await compiles[block.opcode](inputs);
      }
      else {
        console.log(inputs);
        if (!ignore)
          console.warn(`\x1b[33m未知的块\x1b[m: ${block.opcode}`);
      }
      return compiler;
    }
    async function compile_this(block, target) {
      var compiler = '';
      while (true) {
        compiler += await compile(block, target);
        if (block.next == null || compileEvents.includes(block.opcode)) break;
        else block = target.blocks[block.next];
      }
      return compiler;
    }
    async function start_compile_from_events(target) {
      if (target.blocks && typeof target.blocks === 'object') {
        for (const opcode of compileEvents) {
          for (const blockId in target.blocks) {
            const block = target.blocks[blockId];
            if (block.opcode === opcode) {
              await compile_this(block, target);
            }
          }
        }
        await compile_clones(target);
      }
      return;
    }
    function find_clones() {
      const ib = targetID;
      targetID = -1;
      jsonData.targets.forEach(target => {
        targetID++;
        if (target.blocks) {
          if (target.blocks && typeof target.blocks === 'object') {
            for (let blockId in target.blocks) {
              let block = target.blocks[blockId];
              if (block.opcode == 'control_start_as_clone') {
                clonecount++;
                if (!clones.hasOwnProperty(targetID)) clones[targetID] = [];
                clones[targetID].push(`_${targetID}_clone${clonecount}`);
              }
            }
          }
        }
      });
      targetID = ib;
      clonecount = 0;
      return;
    }
    async function compile_clones(target) {
      if (target.blocks && typeof target.blocks === 'object') {
        for (let blockId in target.blocks) {
          let block = target.blocks[blockId];
          if (block.opcode == 'control_start_as_clone') {
            isclone = true;
            await compile_this(block, target);
            isclone = false;
          }
        }
      }
      return;
    }
    if (isLocal) {
      function createDirectory(path) {
        if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
      }
      createDirectory(folderPath);
      out = `// By r-Scratch-Compiler ${new Date().toISOString()} 🍥 v${new rsc().version()}-${new rsc().compilertype()}\n` + out;
      fs.writeFile(path.join(folderPath, fileName + '.rs'), out, (err) => {
        if (err) {
          console.error('无法写入文件：', err);
        }
      });
    }
    if (iflog)
      console.log(out);
    if (diagnosis) console.log(diagnosis);
    return { deplist, globalextrablocks, out, reqlist };
  }
}
if (!isLocal) window.rsc = rsc;
module.exports = rsc;