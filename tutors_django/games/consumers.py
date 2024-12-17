from channels.generic.websocket import AsyncWebsocketConsumer
import json

room_players = {}

class ChessConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chess_{self.room_name}'
        players = room_players.get(self.room_group_name, [])

        if len(players) == 0:
            self.player_color = 'white'
        elif len(players) == 1:
            self.player_color = 'black'
        else:
            # Close connection if the room is full
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.add_player_to_room()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player.joined', 
                'player_color': self.player_color,
            }
        )

        await self.accept()
        await self.send(json.dumps({'color': self.player_color}))

    async def disconnect(self, close_code):

        # Remove the player from the room
        if self.room_group_name in room_players:
            room_players[self.room_group_name] = [
            player for player in room_players[self.room_group_name] if player != self.channel_name
            ]
            # If the room is empty, clean it up
            if not room_players[self.room_group_name]:
                del room_players[self.room_group_name]

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def player_joined(self, event):
        await self.send(json.dumps({
            'type': 'player_joined',
            'player_color': event['player_color'],
        }))

    async def add_player_to_room(self):
        if self.room_group_name not in room_players:
            room_players[self.room_group_name] = []

        if len(room_players[self.room_group_name]) >= 2:
            await self.send(json.dumps({'type': 'error', 'message': 'Room is full. Only 2 players allowed.'}))
            await self.close()
            return

        room_players[self.room_group_name].append(self.channel_name)


    # async def add_player_to_room(self):
    #     if self.room_group_name not in room_players:
    #         room_players[self.room_group_name] = []
    #     room_players[self.room_group_name].append(self.channel_name)

    # async def add_player(self, event):
    #     await self.send(text_data=json.dumps({
    #         'type': 'new_player',  
    #         'player_channel': event['player_channel'],
    #     }))

    async def receive(self, text_data):
        data = json.loads(text_data)

        if not data:
            return
    
        if 'from' in data and 'to' in data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_move',  
                    'move': data
                }
            )

    async def send_move(self, event):
        move = event['move']

        await self.send(text_data=json.dumps({
            'type': 'move',
            'move': move
        }))
