import net from 'node:net'

const targetPort = Number(process.env.VITE_PORT || 5173)
const targetHost = '127.0.0.1'
const listenPorts = (process.env.PREVIEW_PORTS || '43127,43177')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((port) => Number.isInteger(port) && port > 0)

function proxyConn(socket) {
  const dest = net.connect(targetPort, targetHost, () => {
    socket.pipe(dest)
    dest.pipe(socket)
  })
  dest.on('error', () => socket.destroy())
  socket.on('error', () => dest.destroy())
}

for (const listenPort of listenPorts) {
  const server = net.createServer(proxyConn)
  server.on('error', (err) => {
    console.error(`[preview-proxy] :${listenPort} ${err.message}`)
  })
  server.listen(listenPort, '0.0.0.0', () => {
    console.log(`[preview-proxy] 0.0.0.0:${listenPort} -> ${targetHost}:${targetPort}`)
  })
}
