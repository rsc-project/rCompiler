// Lingba Saner 🍥 24502-*
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const crc32 = require('crc32');

class rsc {
  version() {
    return '1';
  }
  compilertype() {
    return 'stl';
  }
  compile(jsonData, folderPath, fileName, iflog) {
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
    var procUsingArgList = [];
    var ignore = false;
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
          if (!ext.blocks)
            return;
          if (!ext.id)
            return;
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
          ext.call({ rsc: this, require, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
        else
          ext.call({ TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
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
      Var: class {
        constructor(input) {
          this.input = input;
          this.type = 'Var';
        }
        Num() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `*self.vf_${varin}.lock().unwrap()`;
          }
          else {
            return `*self.vf_${targetID}_${varin}.lock().unwrap()`;
          }
        }
        Usize() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `*self.vf_${varin}.lock().unwrap() as usize`;
          }
          else {
            return `*self.vf_${targetID}_${varin}.lock().unwrap() as usize`;
          }
        }
        i32() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `*self.vf_${varin}.lock().unwrap() as i32`;
          }
          else {
            return `*self.vf_${targetID}_${varin}.lock().unwrap() as i32`;
          }
        }
        Str() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `**self.vs_${varin}.lock().unwrap()`;
          }
          else {
            return `**self.vs_${targetID}_${varin}.lock().unwrap()`;
          }
        }
        Stri() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `*self.vs_${varin}.lock().unwrap()`;
          }
          else {
            return `*self.vs_${targetID}_${varin}.lock().unwrap()`;
          }
        }
        Stu() {
          const varin = this.input;
          if (globalvarlist.includes(varin)) {
            return `*self.vs_${varin}.lock().unwrap()`;
          }
          else {
            return `*self.vs_${targetID}_${varin}.lock().unwrap()`;
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
          return keywords[parsed];
        else {
          keywordcount++;
          keywords[parsed] = keywordcount;
          return keywords[parsed];
        }
      },
      keywordOnly(parsed) {
        return crc32(parsed);
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
      'sensing_answer'(args) {
        Tools.setdepend(['lazy_static = "1.4"']);
        Tools.setlibrary(['use std::io;', 'use std::io::Write;', 'use std::sync::Mutex;', 'use lazy_static::lazy_static;']);
        Tools.setruntime([
          [
            'lazy_static! {',
            'static ref SENSING_ANSWER: Mutex<String> = Mutex::new(String::new());',
            '}'
          ].join('\n')]);
        return new TypeInput.Stri('SENSING_ANSWER.lock().unwrap().clone()');
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
        return protos;
      },
      'data_itemoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]).toLowerCase();
        name = name.slice(0, name.indexOf('.lock().unwrap()'));
        Tools.setruntime([[`fn get_item${name}(item: usize) -> String{`,
        `if let Some(value) = ${listin}.get(item) {`,
          `value.to_string()`,
          `} else {`,
          `String::new()`,
          `}`,
          `}`
        ].join('\n')]);
        return new TypeInput.Stri(`get_item${name}(if let Some(result) = ${args.INDEX == '"last"' ?
          `${listin}.len()` : '(' + args.INDEX.Usize()}).checked_sub(1) {result} else {0})`);
      },
      'data_itemnumoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]).toLowerCase();
        name = name.slice(0, name.indexOf('.lock().unwrap()'));
        Tools.setruntime([[`fn get_position${name}(value_to_find: &str) -> f64{`,
        `if let Some(position) = ${listin}.iter().position(|x| x == &value_to_find) {`,
          `position as f64 + 1.0`,
          `} else {`,
          `0.0`,
          `}`,
          `}`].join('\n')]);
        return new TypeInput.Num(`get_position${name}(${args.ITEM.Str()})`);
      },
      'data_lengthoflist'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]).toLowerCase();
        name = name.slice(0, name.indexOf('.lock().unwrap()'));
        Tools.setruntime([[`fn get_leng${name}() -> f64{`,
        `${listin}.len() as f64`,
          `}`].join('\n')]);
        return new TypeInput.Num(`get_leng${name}()`);
      },
      'data_listcontainsitem'(args) {
        const listin = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]);
        let name = getlist(Cast.keywordunParse(args.scope.block.fields.LIST[0]), args.scope.block.fields.LIST[1]).toLowerCase();
        name = name.slice(0, name.indexOf('.lock().unwrap()'));
        Tools.setruntime([[`fn get_contains${name}(item: &str) -> bool{`,
        `${listin}.contains(&item)`,
          `}`].join('\n')]);
        return new TypeInput.Bool(`get_contains${name}(${args.ITEM.Str()})`);
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
      'operator_mathop'(argfs) {
        if (args.scope.block.fields.OPERATOR[0] == 'abs') {
          Tools.setruntime([`fn numabs(s: f64) -> f64 {\ns.abs()\n}`
          ])
          return new TypeInput.Num(`numabs(${args.NUM.Num()})`);
        }
      },
      'rsc_user'(args) {
        const from = args.scope.block.fields.from[0];
        const hsm = args.scope.block.fields.hsm[0];
        const Args = Object.keys(args).filter(key => key.startsWith("ADD")).map(key => args[key].Stri());
        if (from != '') return new TypeInput.Stri(`${from}::procpub${Cast.keywordOnly(hsm)}(${Args.join(',')})`);
        else return new TypeInput.Stri(`procpub${Cast.keywordOnly(hsm)}(${Args.join(',')})`);
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
        return new TypeInput.Stri(`${procname}(${result.join(',')})${args.scope.block.mutation.hasOwnProperty('return') ? (args.scope.block.mutation.return == '1' ? '' : ';\n') : ';\n'}`);//aaa
      }
    }
    const compiles = {
      'event_whenflagclicked'(args) {
        flagcount++;
        starteventlist.push("flag" + flagcount);
        var comp = '';
        if (args.scope.block.next) {
          comp = compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        if (rscStorage?.project?.UnuseTokio)
          args.compiler += `fn flag${flagcount}(${selfmut ? 'mut self' : '&self'}){${inuselist.length == 0 ? '' : '\n'}${inuselist.join('\n') + '\n'}`;
        else
          args.compiler += `async fn flag${flagcount}(${selfmut ? 'mut self' : '&self'}){${inuselist.length == 0 ? '' : '\n'}${inuselist.join('\n') + '\n'}`;
        if (comp != '') {
          args.compiler += comp;
        }
        args.compiler += '}\n';
        funcs.push(args.compiler);
        return args.compiler;
      },
      'procedures_definition'(args) {
        proccount++;
        hasreturn = false;
        rscfunc = '';
        let comp = '';
        procUsingArgList = [];
        if (args.scope.block.next) {
          comp = compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
        }
        let block_opcodes = [];
        procparselist.push(`proc${proccount}`);
        proctypelistbackup.push(proctypelist);
        let i = -1;
        const custom_block = args.custom_block;//procedures_prototype
        Object.keys(custom_block).forEach(function (key) {
          i++;
          if (procUsingArgList.includes(custom_block[key]))
            block_opcodes.push(custom_block[key] + ': ' + proctypelist[i]);
          else
            block_opcodes.push('_' + custom_block[key] + ': ' + proctypelist[i]);
        })
        if (rscfunc != '') {
          procpublist.push(`proc${proccount}`);
          procpubrealnamelist.push(`procpub${rscfunc}`);
        }
        args.compiler += `${rscfunc ? `pub fn procpub${rscfunc}` : `fn proc${proccount}`}${hasCommandBlock ? '<F: Fn()>' : ''}(${block_opcodes.join(',')})${hasreturn ? '->Arc<String>' : ''}{\n`;
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
        out += args.compiler;
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
        args.compiler += `${procname}(${result.join(',')})${args.scope.block.mutation.hasOwnProperty('return') ? (args.scope.block.mutation.return == '1' ? '' : ';\n') : ';\n'}`;
        return args.compiler;//aaa
      },
      'control_start_as_clone'(args) {
        clonecount++;
        var comp = '';
        clonevarlist = [];
        if (args.scope.block.next) {
          comp = compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
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
        const numvar = getvar(varin, args.scope.block.fields.VARIABLE[1]).num;
        const strvar = getvar(varin, args.scope.block.fields.VARIABLE[1]).str;
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
      'sensing_askandwait'(args) {
        Tools.setdepend(['lazy_static = "1.4"']);
        Tools.setlibrary(['use std::io;', 'use std::io::Write;', 'use std::sync::Mutex;', 'use lazy_static::lazy_static;']);
        Tools.setruntime([
          [
            'lazy_static! {',
            'static ref SENSING_ANSWER: Mutex<String> = Mutex::new(String::new());',
            '}'
          ].join('\n')]);
        args.compiler += `print!("{}",${args.QUESTION.Stu()});\n`;
        args.compiler += `print!("\\n");\n`
        args.compiler += `io::stdout().flush().unwrap();\n`;
        args.compiler += `let mut sensing_answer = String::new();\n`;
        args.compiler += `io::stdin().read_line(&mut sensing_answer).unwrap();\n`;
        args.compiler += `*SENSING_ANSWER.lock().unwrap() = sensing_answer.trim().to_owned();\n`;
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
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).num} = ${args.VALUE.Num()};\n`;
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).str} = ${args.VALUE.Stri()};\n`;
        return args.compiler;
      },
      'data_changevariableby'(args) {
        const varin = Cast.keywordunParse(args.scope.block.fields.VARIABLE[0]);
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).num} += ${args.VALUE.Num()};\n`;
        args.compiler += `${getvar(varin, args.scope.block.fields.VARIABLE[1]).str} = (${getvar(varin, args.scope.block.fields.VARIABLE[1]).num}).to_string();\n`;
        return args.compiler;
      },
      'data_addtolist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let addin = ${args.ITEM.Str()};\n`
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.push(addin);\n`;
        return args.compiler;
      },
      'data_deletealloflist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.clear();\n`;
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
        return args.compiler;
      },
      'data_insertatlist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let insertin = ${args.ITEM.Str()};\n`
        args.compiler += `let insertin2 = ${args.INDEX == '"last"' ?
          `(${getlist(listin, args.scope.block.fields.LIST[1])}.len() as i32 - 1) as usize` : '(' + args.INDEX.i32() + ' - 1) as usize'};\n`;
        args.compiler += `if insertin2 != usize::MAX {\n`;
        args.compiler += `${getlist(listin, args.scope.block.fields.LIST[1])}.insert(insertin2,insertin);\n`;
        args.compiler += '}\n';
        return args.compiler;
      },
      'data_replaceitemoflist'(args) {
        const listin = Cast.keywordunParse(args.scope.block.fields.LIST[0]);
        args.compiler += `let getin = ${args.INDEX == '"last"' ?
          `(${getlist(listin, args.scope.block.fields.LIST[1])}.len() as i32 - 1) as usize` : '(' + args.INDEX.i32() + ' - 1) as usize'};\n`;
        args.compiler += `let itemin = ${args.ITEM.Str()};\n`;
        args.compiler += `if getin != usize::MAX {\n`;
        args.compiler += `if let Some(item) = ${getlist(listin, args.scope.block.fields.LIST[1])}.get_mut(getin) {\n`;
        args.compiler += `*item = itemin;\n`;
        args.compiler += `};\n`;
        args.compiler += `};\n`;
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
      'event_whenbroadcastreceived'(args) {
        var comp = '';
        const blockb = args.scope.block;
        if (args.scope.block.next) {
          comp = compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
          if (broadcastfuncs.hasOwnProperty(Cast.unParse(blockb.fields.BROADCAST_OPTION[0])))
            broadcastfuncs[Cast.unParse(blockb.fields.BROADCAST_OPTION[0])].push(comp);
          else
            broadcastfuncs[Cast.unParse(blockb.fields.BROADCAST_OPTION[0])] = [comp]
        }
        return args.compiler;
      },
      'event_whenkeypressed'(args) {
        presscount++;
        var comp = '';
        var pressing = Cast.toPress(args.scope.block.fields.KEY_OPTION[0], args.scope.block);
        Tools.setlibrary(['use crossterm::event::{self, Event, KeyCode};']);
        Tools.setdepend(['crossterm = "0.27.0"']);
        if (args.scope.block.next) {
          comp = compile_this(args.scope.target.blocks[args.scope.block.next], args.scope.target);
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
      'rsc_import'(args) {
        const mod = args.scope.block.fields.HEADER[0];
        if (mod != '') {
          if (fs.existsSync(mod + '.json')) {
            Tools.setlibrary([`mod ${mod};`]);
            const jsonpath = mod + '.json'
            const jsondata = fs.readFileSync(jsonpath);
            const { deplist, globalextrablocks } = new rsc().compile(jsondata, folderPath, path.parse(jsonpath).name, iflog);
            Tools.setextrablockcompile(globalextrablocks);
            Tools.setdepend(deplist);
          }
          else if (fs.existsSync(mod + '.sb3')) {
            const zipFilePath = mod + '.sb3';
            Tools.setlibrary([`mod ${mod};`]);
            const jsondata = rf(zipFilePath);
            const { deplist, globalextrablocks } = new rsc().compile(jsondata, folderPath, path.parse(zipFilePath).name, iflog);
            Tools.setextrablockcompile(globalextrablocks);
            Tools.setdepend(deplist);
          }
          else if (fs.existsSync(mod + '.js')) {
            const register = (ext) => {
              if (!ext.blocks)
                return;
              if (!ext.id)
                return;
              globalextrablocks.push(ext);
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
            const ext = new Function(fs.readFileSync(mod + '.js').toString());
            const ThrowError = (err) => {
              throw new Error(err)
            }
            if (rscStorage?.config?.AllowThis)
              ext.call({ rsc: this, TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
            else
              ext.call({ TypeInput, Cast, Tools, compile_this, BlockType, extensions, isCompiler, ThrowError });
          }
        }
        return args.compiler;
      },
      'rsc_func'(args) {
        rscfunc = Cast.keywordOnly(args.scope.block.fields.HEADER[0]);
        return args.compiler;
      },
      'rsc_use'(args) {
        const from = args.scope.block.fields.from[0];
        const hsm = args.scope.block.fields.hsm[0];
        const Args = Object.keys(args).filter(key => key.startsWith("ADD")).map(key => args[key].Stri());
        if (from != '') args.compiler += `${from}::procpub${Cast.keywordOnly(hsm)}(${Args.join(',')});\n`;
        else args.compiler += `procpub${Cast.keywordOnly(hsm)}(${Args.join(',')});\n`;
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
    jsonData.targets.forEach(target => {
      targetID++;
      if (target.blocks) {
        start_compile_from_events(target);
      }
    });
    out += compile_main();
    if (runtimelist.length != 0) {
      out = runtimelist.join('\n') + '\n' + out;
    }
    if (uselist.length != 0) {
      out = uselist.join('\n') + '\n' + out;
    }
    function getlist(listname, listid) {
      if (nogloballistids.includes(listid)) {
        if (isclone) {
          return `_${targetID}_list_${listname}`;
        }
        else {
          return `_${targetID}_LIST_${listname}.lock().unwrap()`;
        }
      }
      else {
        return `GLOBAL_LIST_${listname}.lock().unwrap()`;
      }
    }
    function getvar(varname, varid) {
      if (noglobalvarids.includes(varid)) {
        if (isclone) {
          Tools.setclonevar([`let mut _str_${varname} = self.vs_${targetID}_${varname}.lock().unwrap().clone();`, `let mut _num_${varname} = *self.vf_${targetID}_${varname}.lock().unwrap();`]);
          return { str: `_str_${varname}`, num: `_num_${varname}` };
        }
        else {
          return { str: `*self.vs_${targetID}_${varname}.lock().unwrap()`, num: `*self.vf_${targetID}_${varname}.lock().unwrap()` };
        }
      }
      else {
        return { str: `*self.vs_${varname}.lock().unwrap()`, num: `*self.vf_${varname}.lock().unwrap()` };
      }
    }
    function compile_main() {
      var fn = `struct Default{\n${structs.map(item => item[0] + ':' + item[1]).join(',\n')}\n}\n`;
      fn += `impl Default{\nfn new() -> Default{\nDefault{\n${structs.map(item => item[0] + ':' + item[2]).join(',\n')}\n}\n}\n${funcs.join('\n')}}\n`;
      if (flagcount == 0) {
        fn += `fn main(){\n${mainlist.length == 0 ? '' : mainlist.join('\n')}}`;
      }
      else if (flagcount == 1) {
        if (rscStorage?.project?.UnuseTokio)
          fn += `fn main(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}init.flag1();\n}`;
        else {
          Tools.setdepend([`tokio = { version = "1", features = ["full"] }`]);
          fn += `#[tokio::main]\nasync fn main(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}init.flag1().await;\n}`;
        }
      }
      else {
        if (rscStorage?.project?.UnuseTokio) {
          fn += `fn main(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}`;
          let i = -1;
          starteventlist.forEach(function (info) {
            i++;
            fn += `init.${info}();\n`;
          });
          fn += '}';
        }
        else {
          Tools.setdepend([`tokio = { version = "1", features = ["full"] }`]);
          fn += `#[tokio::main]\nasync fn main(){\nlet init = Default::new();\n${mainlist.length == 0 ? '' : mainlist.join('\n')}`;
          let tasks = [];
          let i = -1;
          starteventlist.forEach(function (info) {
            i++;
            tasks.push('init.'+info+'()');
          });
          let task = tasks.join(',');
          fn += `tokio::join!(${task});\n`
          fn += '}';
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
        Tools.setlibrary(['use std::sync::Mutex;']);
        for (const key in vars) {
          const variableName = Cast.keywordunParse(vars[key][0]);
          const variableContent = vars[key][1];
          if (element == 0) {
            if (typeof variableContent == 'number') {
              structs.push(['vf_' + variableName, 'Mutex<f64>', `Mutex::new(${Cast.toNum(variableContent)})`]);
            }
            else {
              structs.push(['vf_' + variableName, 'Mutex<f64>', 'Mutex::new(0.0)']);
            }
            structs.push(['vs_' + variableName, 'Mutex<String>', `Mutex::new((${Cast.unParse(variableContent)}).to_string())`]);
            globalvarlist.push(variableName);
          }
          else {
            if (typeof variableContent == 'number') {
              structs.push(['vf_' + element + '_' + variableName, 'Mutex<f64>', `Mutex::new(${Cast.toNum(variableContent)})`]);
            }
            else {
              structs.push(['vf_' + element + '_' + variableName, 'Mutex<f64>', 'Mutex::new(0.0)']);
            }
            structs.push(['vs_' + element + '_' + variableName, 'Mutex<String>', `Mutex::new((${Cast.unParse(variableContent)}).to_string())`]);
            noglobalvarids.push(key);
            noglobalvarlist.push(variableName);
          }
        }
        let listadds = [];
        for (const key in lists) {
          const listName = Cast.keywordunParse(lists[key][0]);
          const listContent = lists[key][1];
          let listfor = [];
          for (const keyin in listContent) {
            listfor.push(Cast.toStr(Cast.unParse(listContent[keyin])));
          }
          if (element == 0) {
            structs.push(`static ref GLOBAL_LIST_${listName}: Mutex<Vec<&'static str>> = Mutex::new(vec![${listfor.join(',')}]);`);
          }
          else {
            structs.push(`static ref _${element}_LIST_${listName}: Mutex<Vec<&'static str>> = Mutex::new(vec![${listfor.join(',')}]);`);
            nogloballistids.push(key);
            noglobalvarlist.push(listName);
          }
        }
        if (listadds.length != 0) Tools.setmain([listadds.join('\n')]);
      }
      jsonData.targets.forEach((_, index) => {
        find(index);
      });
    }
    function compile_input(block, target) {
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
                const comped = compile_input(compblock, target);
                inputs[key] = comped;
              }
              else {
                const comped = compile_this(compblock, target);
                inputs[key] = comped;
              }
            }
            else
              if (inputlist.includes(compblock.opcode)) {
                if (operatorlist.includes(compblock.opcode) && !operatorlist.includes(block.opcode)) {
                  const compedToRemove = compile_input(compblock, target);
                  if (typeof compedToRemove == 'object')
                    if (compedToRemove.hasOwnProperty('input'))
                      compedToRemove.input = Cast.replaceParentheses(compedToRemove.input);
                  var comped = compedToRemove;
                }
                else {
                  var comped = compile_input(compblock, target);
                }
                inputs[key] = comped;
              }
              else {
                const comped = compile_this(compblock, target);
                inputs[key] = comped;
              }
          }
        }
      }
      if (block.opcode == 'procedures_call') {
        if (block.mutation.return) {
          inputs.scope = { block, target };
          return inputscompiles[block.opcode](inputs);
        }
        else {
          return inputs;
        }
      }
      else
        if (inputscompiles.hasOwnProperty(block.opcode)) {
          inputs.scope = { block, target };
          return inputscompiles[block.opcode](inputs);
        }
      return inputs;
    }
    function compile(block, target) {
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
        var inputs = compile_input(block, target);
      }
      else {
        var inputs = {};
      }
      if (compiles.hasOwnProperty(block.opcode)) {
        inputs.scope = { block, target };
        inputs.compiler = compiler;
        compiler = compiles[block.opcode](inputs);
      }
      else {
        console.log(inputs);
        if (!ignore)
          console.warn(`\x1b[33m未知的块\x1b[m: ${block.opcode}`);
      }
      return compiler;
    }
    function compile_this(block, target) {
      var compiler = '';
      while (true) {
        compiler += compile(block, target);
        if (block.next == null || compileEvents.includes(block.opcode)) break;
        else block = target.blocks[block.next];
      }
      return compiler;
    }
    function start_compile_from_events(target) {
      if (target.blocks && typeof target.blocks === 'object') {
        for (const opcode of compileEvents) {
          for (const blockId in target.blocks) {
            const block = target.blocks[blockId];
            if (block.opcode === opcode) {
              compile_this(block, target);
            }
          }
        }
        compile_clones(target);
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
    function compile_clones(target) {
      if (target.blocks && typeof target.blocks === 'object') {
        for (let blockId in target.blocks) {
          let block = target.blocks[blockId];
          if (block.opcode == 'control_start_as_clone') {
            isclone = true;
            compile_this(block, target);
            isclone = false;
          }
        }
      }
      return;
    }
    function createDirectory(path) {
      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
    }
    function rf(zipFilePath) {
      try {
        const data = fs.readFileSync(zipFilePath);
        const zip = new AdmZip(data);
        const projectJsonEntry = zip.getEntry('project.json');

        if (!projectJsonEntry) {
          throw new Error('不是有效的Scratch项目文件');
        }

        const projectJsonContent = projectJsonEntry.getData().toString('utf-8');
        const projectJson = JSON.parse(projectJsonContent);
        return projectJson;
      } catch (error) {
        throw error;
      }
    }
    createDirectory(folderPath);
    out = `// By r-Scratch-Compiler ${new Date().toISOString()} 🍥 v${new rsc().version()}-${new rsc().compilertype()}\n` + out;
    fs.writeFile(path.join(folderPath, fileName + '.rs'), out, (err) => {
      if (err) {
        console.error('无法写入文件：', err);
      }
    });
    if (iflog)
      console.log(out);
    return { deplist, globalextrablocks, out };
  }
}
module.exports = rsc;