# Scratch至原生Rust的编译器

## 构建：
需要 Node.js >= 14
```sh
git clone https://github.com/rsc-project/rCompiler.git
cd rCompiler
npm ci
```

## 运行：
需要 Rust 开发环境  
[rustup](https://rustup.rs/)
```sh
$ npm start main.sb3
'Hello, World!'
```
仅仅生成代码：
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
}
#[tokio::main]
async fn main(){
let init = Default::new();
init.flag1().await;
}'
```

## 打包：
打包至浏览器：
```sh
npm run build
```
打包至本地可执行文件：
```sh
npm run pkg
```

实战项目:   
[rxcalc](https://crates.io/crates/rxcalc)
