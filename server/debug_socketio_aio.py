from aiohttp import web
import socketio

sio = socketio.AsyncServer(cors_allowed_origins="*")
app = web.Application()
sio.attach(app)

async def index(request):
    """Serve the client-side application."""
    with open('client/debug_socketio.html') as f:
        return web.Response(text=f.read(), content_type='text/html')

@sio.event
def connect(sid, environ):
    print("connect ", sid)

@sio.event
async def chat_message(sid, data):
    print("message ", data)
    await sio.emit('reply', room=sid)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

app.router.add_static('/client', 'client')
app.router.add_get('/', index)

if __name__ == '__main__':
    web.run_app(app)