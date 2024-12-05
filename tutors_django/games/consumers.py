from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ChessConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chess_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        # Broadcast move to other player
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chess_move',
                'move': data['move']
            }
        )

    async def chess_move(self, event):
        # Send move to WebSocket
        await self.send(text_data=json.dumps({
            'move': event['move']
        }))
