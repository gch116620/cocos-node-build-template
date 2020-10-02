const express = require('express');
const expressWs = require('express-ws');
// 反向代理中间件
const proxyMiddleWare = require("http-proxy-middleware");

// 端口
let port = 8080

// 代理配置 添加代理配置在里面按照格式写就行
const proxy = [
  {
    router: '/test', // 等同于devServer中的 proxy key
    target: 'http://test.com/',// 等同于devServer中的 target
    changeOrigin: true, // 等同于devServer中的 changeOrigin
  },
]


const app = express();
expressWs(app)
app.use('/local-realtime',express.static("./build/web-mobile"));

const h = new Date().getTime()
// 心跳检测接口
app.get('/heartBeat',((req, res) => {
  res.json({
    time: h.toString()
  })
}))

// websocket接口
app.ws('/ws',(ws,req) => {
  ws.on('message', function (msg) {
    ws.send(JSON.stringify({
      msg: '通讯正常',
      time: h
    }))
  })
})

// 创建反向代理
for (let i in proxy) {
  const {target, changeOrigin} = proxy[i]
  app.use(proxy[i].router, proxyMiddleWare.createProxyMiddleware({
    target,
    changeOrigin
  }))
}


// 启动服务
app.listen(port, () => {
  console.log(`\n\n项目在 http://localhost:${port}/local-realtime 地址启动。${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} \n\n`)

});

