import net from 'node:net'

const listenPort = Number(process.env.PREVIEW_PORT || 43177)
const targetPort = Number(process.env.VITE_PORT || 5173)
const targetHost = '127.0.0.1'

const server = net.createServer((socket) => {
  const dest = net.connect(targetPort, targetHost, () => {
    socket.pipe(dest)
    dest.pipe(socket)
  })
  dest.on('error', () => socket.destroy())
  socket.on('error', () => dest.destroy())
})

server.on('error', (err) => {
  console.error(`[preview-proxy] ${err.message}`)
  process.exit(1)
})

server.listen(listenPort, '0.0.0.0', () => {
  console.log(`[preview-proxy] 0.0.0.0:${listenPort} -> ${targetHost}:${targetPort}`)
})
