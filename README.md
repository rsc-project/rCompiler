# Scratch至原生Rust的编译器

## 构建
需要 Node.js >= 14
```sh
git clone https://github.com/rsc-project/rCompiler.git
cd rCompiler
npm ci
```

## 运行
需要 Rust 开发环境  
[rustup](https://rustup.rs/)
```sh
$ npm start main.sb3
'Hello, World!'
```
仅仅生成代码
```sh
$ npm start t main.sb3
'struct Default{
}
impl Default{
fn new() -> Default{
Default{
}
}
async fn flag1(&self){
println!("{}","Hello, World!");
}
async fn runflag(){
let init = Default::new();
init.flag1().await;
}
}
#[tokio::main]
async fn main(){
Default::runflag().await;
}'
```

## 打包
打包至浏览器
```sh
npm run build
```
打包至本地可执行文件
```sh
npm run pkg
```

## [扩展仓库](https://0832.ink/Gallery)

## 实战
[rxcalc](https://crates.io/crates/rxcalc)

## 计划
- [ ] 扩展仓库直接引用
- [ ] 编辑器内定义扩展积木
- [ ] 变量、列表类型选择
- [ ] 获取/改变其它组件变量
