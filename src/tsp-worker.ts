type WorkerPostMessage = (data: any) => void
let wkPostMessage: WorkerPostMessage = <WorkerPostMessage>postMessage

self.onmessage = msg => {
	switch (msg.data.command) {
		case 'start': return doStart(msg.data.params)
		default: throw Error('Unknown command: ' + msg.data.command)
	}
}

function doStart(params) {
	console.log('Got start message: ' + params)
	wkPostMessage('Potato')
}
